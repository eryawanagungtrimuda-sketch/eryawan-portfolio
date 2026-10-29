import JSZip from 'jszip';
import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { isAllowedAdminEmail } from '@/lib/admin-auth';
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ProjectMeta = {
  id: string;
  title: string | null;
  cover_image: string | null;
};

type ImageRow = {
  image_url: string | null;
  sort_order: number | null;
};

type CandidateAsset = {
  kind: 'cover' | 'project' | 'insight';
  url: string;
};

type ZipAsset = {
  name: string;
  url: string;
};

// Step 1: Sanitize filename chunks so Content-Disposition stays safe and predictable.
function sanitizeFileName(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || 'project';
}

// Step 2: Resolve extension from URL path; fallback to jpg when uncertain.
function getFileExtensionFromUrl(url: string): string {
  try {
    const { pathname } = new URL(url);
    const fileName = pathname.split('/').pop() || '';
    const extension = fileName.includes('.') ? fileName.split('.').pop()?.toLowerCase() : '';
    if (extension && /^[a-z0-9]{2,5}$/.test(extension)) return extension;
  } catch {
    // ignore invalid URL and fallback below
  }

  return 'jpg';
}

// Step 3: Normalize URLs only for duplicate detection. Fetch the original URL so its query string is preserved.
function getAssetDeduplicationKey(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.origin + parsed.pathname.replace(/\/+$/, '');
  } catch {
    return url.trim().replace(/[?#].*$/, '').replace(/\/+$/, '');
  }
}

// Step 4: Verify admin from Supabase access token to keep endpoint server-side/admin-only.
async function requireAdminUser(request: Request): Promise<User | null> {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) return null;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;

  return isAllowedAdminEmail(data.user.email) ? data.user : null;
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    // Step 5: Early config and auth guards.
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Supabase belum terkonfigurasi.' }, { status: 503 });
    }

    const adminUser = await requireAdminUser(request);
    if (!adminUser) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    // Step 6: Validate required query param for current Social Composer flow.
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId')?.trim();
    if (!projectId) {
      return NextResponse.json({ error: 'projectId wajib diisi.' }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();

    // Step 7: Resolve project/insight title and cover image for the final ZIP.
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id,title,cover_image')
      .eq('id', projectId)
      .maybeSingle<ProjectMeta>();
    if (projectError) {
      return NextResponse.json({ error: 'Gagal mengambil data proyek.' }, { status: 500 });
    }

    const { data: insight, error: insightError } = project
      ? { data: null, error: null }
      : await supabase
          .from('insights')
          .select('id,title,cover_image')
          .eq('id', projectId)
          .maybeSingle<ProjectMeta>();
    if (insightError) {
      return NextResponse.json({ error: 'Gagal mengambil data wawasan.' }, { status: 500 });
    }

    if (!project && !insight) {
      return NextResponse.json({ error: 'Project/Wawasan tidak ditemukan.' }, { status: 404 });
    }

    // Step 8: Fetch all gallery images for the project or insight.
    const [projectImagesResult, insightImagesResult] = await Promise.all([
      supabase
        .from('project_images')
        .select('image_url,sort_order')
        .eq('project_id', projectId)
        .order('sort_order', { ascending: true })
        .returns<ImageRow[]>(),
      supabase
        .from('insight_images')
        .select('image_url,sort_order')
        .eq('insight_id', projectId)
        .order('sort_order', { ascending: true })
        .returns<ImageRow[]>(),
    ]);

    if (projectImagesResult.error || insightImagesResult.error) {
      return NextResponse.json({ error: 'Gagal mengambil daftar gambar.' }, { status: 500 });
    }

    // Include the cover first, followed by the sorted gallery. Avoid duplicate downloads when
    // the cover is also present in the gallery, matching the public gallery behavior.
    const coverImageUrl = project?.cover_image || insight?.cover_image || null;
    const candidateAssets: CandidateAsset[] = [
      ...(coverImageUrl ? [{ kind: 'cover' as const, url: coverImageUrl }] : []),
      ...(projectImagesResult.data || [])
        .filter((row): row is ImageRow & { image_url: string } => Boolean(row.image_url))
        .map((row) => ({ kind: 'project' as const, url: row.image_url })),
      ...(insightImagesResult.data || [])
        .filter((row): row is ImageRow & { image_url: string } => Boolean(row.image_url))
        .map((row) => ({ kind: 'insight' as const, url: row.image_url })),
    ];

    const seenAssetUrls = new Set<string>();
    const uniqueAssets = candidateAssets.filter((asset) => {
      const key = getAssetDeduplicationKey(asset.url);
      if (!key || seenAssetUrls.has(key)) return false;
      seenAssetUrls.add(key);
      return true;
    });

    const imageCounters = { project: 0, insight: 0 };
    const assets: ZipAsset[] = uniqueAssets.map((asset) => {
      if (asset.kind === 'cover') return { name: 'cover', url: asset.url };

      imageCounters[asset.kind] += 1;
      const prefix = asset.kind === 'project' ? 'project' : 'wawasan';
      return {
        name: prefix + '-' + String(imageCounters[asset.kind]).padStart(2, '0'),
        url: asset.url,
      };
    });

    if (!assets.length) {
      return NextResponse.json({ error: 'Belum ada gambar untuk diunduh.' }, { status: 404 });
    }

    // Step 9: Build ZIP by downloading each original asset URL and adding its bytes to JSZip.
    const zip = new JSZip();
    for (const asset of assets) {
      const imageResponse = await fetch(asset.url, { cache: 'no-store' });
      if (!imageResponse.ok) throw new Error('Gagal mengunduh aset: ' + asset.url);

      const imageArrayBuffer: ArrayBuffer = await imageResponse.arrayBuffer();
      const extension = getFileExtensionFromUrl(asset.url);
      zip.file(asset.name + '.' + extension, imageArrayBuffer);
    }

    // Step 10: Generate ArrayBuffer so body type is valid for NextResponse on Vercel/Next.js.
    const zipArrayBuffer: ArrayBuffer = await zip.generateAsync({
      type: 'arraybuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
      streamFiles: true,
    });

    const baseName = sanitizeFileName(project?.title || insight?.title || 'project');
    const dateStamp = new Date().toISOString().slice(0, 10);
    const fileName = baseName + '-' + dateStamp + '.zip';

    // Step 11: Return downloadable ZIP with required headers.
    return new NextResponse(zipArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': 'attachment; filename="' + fileName + '"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[download-project-images] unexpected error:', error);
    return NextResponse.json({ error: 'Gagal membuat ZIP gambar.' }, { status: 500 });
  }
}
