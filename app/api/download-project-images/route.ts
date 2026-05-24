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
};

type ImageRow = {
  image_url: string | null;
  sort_order: number | null;
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

// Step 3: Verify admin from Supabase access token to keep endpoint server-side/admin-only.
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
    // Step 4: Early config and auth guards.
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Supabase belum terkonfigurasi.' }, { status: 503 });
    }

    const adminUser = await requireAdminUser(request);
    if (!adminUser) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    // Step 5: Validate required query param for current Social Composer flow.
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get('projectId')?.trim();
    if (!projectId) {
      return NextResponse.json({ error: 'projectId wajib diisi.' }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();

    // Step 6: Resolve project/insight display name for final ZIP filename.
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id,title')
      .eq('id', projectId)
      .maybeSingle<ProjectMeta>();
    if (projectError) {
      return NextResponse.json({ error: 'Gagal mengambil data proyek.' }, { status: 500 });
    }

    const { data: insight, error: insightError } = project
      ? { data: null, error: null }
      : await supabase
          .from('insights')
          .select('id,title')
          .eq('id', projectId)
          .maybeSingle<ProjectMeta>();
    if (insightError) {
      return NextResponse.json({ error: 'Gagal mengambil data wawasan.' }, { status: 500 });
    }

    if (!project && !insight) {
      return NextResponse.json({ error: 'Project/Wawasan tidak ditemukan.' }, { status: 404 });
    }

    // Step 7: Fetch all related image rows from both project_images and insight_images.
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

    const assets: ZipAsset[] = [
      ...(projectImagesResult.data || [])
        .filter((row) => Boolean(row.image_url))
        .map((row, index) => ({
          name: `project-${String(index + 1).padStart(2, '0')}`,
          url: row.image_url as string,
        })),
      ...(insightImagesResult.data || [])
        .filter((row) => Boolean(row.image_url))
        .map((row, index) => ({
          name: `wawasan-${String(index + 1).padStart(2, '0')}`,
          url: row.image_url as string,
        })),
    ];

    if (!assets.length) {
      return NextResponse.json({ error: 'Belum ada gambar untuk diunduh.' }, { status: 404 });
    }

    // Step 8: Build ZIP by downloading each asset and adding ArrayBuffer bytes to JSZip.
    const zip = new JSZip();
    for (const asset of assets) {
      const imageResponse = await fetch(asset.url, { cache: 'no-store' });
      if (!imageResponse.ok) throw new Error(`Gagal mengunduh aset: ${asset.url}`);

      const imageArrayBuffer: ArrayBuffer = await imageResponse.arrayBuffer();
      const extension = getFileExtensionFromUrl(asset.url);
      zip.file(`${asset.name}.${extension}`, imageArrayBuffer);
    }

    // Step 9: Generate ArrayBuffer so body type is valid for NextResponse on Vercel/Next.js.
    const zipArrayBuffer: ArrayBuffer = await zip.generateAsync({
      type: 'arraybuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
      streamFiles: true,
    });

    const baseName = sanitizeFileName(project?.title || insight?.title || 'project');
    const dateStamp = new Date().toISOString().slice(0, 10);
    const fileName = `${baseName}-${dateStamp}.zip`;

    // Step 10: Return downloadable ZIP with required headers.
    return new NextResponse(zipArrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[download-project-images] unexpected error:', error);
    return NextResponse.json({ error: 'Gagal membuat ZIP gambar.' }, { status: 500 });
  }
}
