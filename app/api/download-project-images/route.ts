import JSZip from 'jszip';
import { NextResponse } from 'next/server';
import type { User } from '@supabase/supabase-js';
import { isAllowedAdminEmail } from '@/lib/admin-auth';
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase';

export const runtime = 'nodejs';

type ImageRow = {
  image_url: string | null;
  sort_order: number | null;
};

type DownloadAsset = {
  fileStem: string;
  url: string;
};

type ProjectRow = {
  id: string;
  title: string | null;
  slug: string;
};

function sanitizeFileName(value: string): string {
  const normalized = value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || 'project';
}

function getFileExtension(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const tail = pathname.split('/').pop() || '';
    const ext = tail.includes('.') ? tail.split('.').pop()?.toLowerCase() : '';
    if (ext && /^[a-z0-9]{2,5}$/.test(ext)) return ext;
  } catch {
    // ignore and fallback
  }
  return 'jpg';
}

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
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Supabase belum terkonfigurasi.' }, { status: 503 });
    }

    const adminUser = await requireAdminUser(request);
    if (!adminUser) {
      return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const projectSlug = searchParams.get('projectSlug')?.trim().toLowerCase();

    if (!projectSlug) {
      return NextResponse.json({ error: 'projectSlug wajib diisi.' }, { status: 400 });
    }

    const supabase = createSupabaseServerClient();
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('id,title,slug')
      .eq('slug', projectSlug)
      .maybeSingle<ProjectRow>();

    if (projectError) {
      return NextResponse.json({ error: 'Gagal mengambil data proyek.' }, { status: 500 });
    }

    if (!project) {
      return NextResponse.json({ error: 'Proyek tidak ditemukan.' }, { status: 404 });
    }

    const { data: imageRows, error: imageError } = await supabase
      .from('project_images')
      .select('image_url,sort_order')
      .eq('project_id', project.id)
      .order('sort_order', { ascending: true })
      .returns<ImageRow[]>();

    if (imageError) {
      return NextResponse.json({ error: 'Gagal mengambil daftar gambar proyek.' }, { status: 500 });
    }

    const assets: DownloadAsset[] = (imageRows || [])
      .filter((row) => Boolean(row.image_url))
      .map((row, index) => ({
        fileStem: `project-${String(index + 1).padStart(2, '0')}`,
        url: row.image_url as string,
      }));

    if (!assets.length) {
      return NextResponse.json({ error: 'Belum ada gambar proyek untuk diunduh.' }, { status: 404 });
    }

    const zip = new JSZip();

    // Sequential fetch to keep memory pressure lower for larger sets.
    for (const asset of assets) {
      const imageResponse = await fetch(asset.url, { cache: 'no-store' });
      if (!imageResponse.ok) {
        throw new Error(`Gagal mengunduh gambar: ${asset.url}`);
      }

      const arrayBuffer: ArrayBuffer = await imageResponse.arrayBuffer();
      const fileName = `${asset.fileStem}.${getFileExtension(asset.url)}`;
      zip.file(fileName, new Uint8Array(arrayBuffer), { binary: true });
    }

    const zipBytes: Uint8Array = await zip.generateAsync({
      type: 'uint8array',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
      streamFiles: true,
    });

    const dateStamp = new Date().toISOString().slice(0, 10);
    const baseName = sanitizeFileName(project.title || project.slug || 'project');
    const fileName = `${baseName}-${dateStamp}.zip`;

    return new NextResponse(zipBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('[download-project-images] unexpected error:', error);
    return NextResponse.json({ error: 'Gagal membuat file ZIP gambar proyek.' }, { status: 500 });
  }
}
