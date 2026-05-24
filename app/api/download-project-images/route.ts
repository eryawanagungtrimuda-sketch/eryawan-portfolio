import JSZip from 'jszip';
import { NextResponse } from 'next/server';
import { isAllowedAdminEmail } from '@/lib/admin-auth';
import { createSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase';

type Asset = { name: string; url: string };

function sanitizeFileName(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'project';
}

function getExtensionFromUrl(url: string) {
  try {
    const { pathname } = new URL(url);
    const fileName = pathname.split('/').pop() || '';
    const extension = fileName.includes('.') ? fileName.split('.').pop() : '';
    const normalized = extension?.toLowerCase();
    if (normalized && /^[a-z0-9]{2,5}$/.test(normalized)) return normalized;
  } catch {
    return 'jpg';
  }
  return 'jpg';
}

async function requireAdminUser(req: Request) {
  const authHeader = req.headers.get('authorization') || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  if (!token) return null;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error) return null;
  return isAllowedAdminEmail(data.user?.email) ? data.user : null;
}

export async function GET(req: Request) {
  if (!isSupabaseConfigured) return NextResponse.json({ error: 'Supabase belum terkonfigurasi.' }, { status: 503 });

  const adminUser = await requireAdminUser(req);
  if (!adminUser) return NextResponse.json({ error: 'Akses ditolak.' }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get('projectId')?.trim();
  if (!projectId) return NextResponse.json({ error: 'projectId wajib diisi.' }, { status: 400 });

  const supabase = createSupabaseServerClient();
  const { data: project, error: projectError } = await supabase.from('projects').select('id,title').eq('id', projectId).maybeSingle();
  if (projectError) return NextResponse.json({ error: 'Gagal mengambil data proyek.' }, { status: 500 });

  const { data: insight, error: insightError } = project
    ? { data: null, error: null }
    : await supabase.from('insights').select('id,title').eq('id', projectId).maybeSingle();
  if (insightError) return NextResponse.json({ error: 'Gagal mengambil data wawasan.' }, { status: 500 });

  if (!project && !insight) return NextResponse.json({ error: 'Project/Wawasan tidak ditemukan.' }, { status: 404 });

  const [projectImagesResult, insightImagesResult] = await Promise.all([
    supabase.from('project_images').select('image_url,sort_order').eq('project_id', projectId).order('sort_order', { ascending: true }),
    supabase.from('insight_images').select('image_url,sort_order').eq('insight_id', projectId).order('sort_order', { ascending: true }),
  ]);

  if (projectImagesResult.error || insightImagesResult.error) {
    return NextResponse.json({ error: 'Gagal mengambil daftar gambar.' }, { status: 500 });
  }

  const assets: Asset[] = [
    ...(projectImagesResult.data || []).map((item, idx) => ({ name: `project-${String(idx + 1).padStart(2, '0')}`, url: item.image_url })),
    ...(insightImagesResult.data || []).map((item, idx) => ({ name: `wawasan-${String(idx + 1).padStart(2, '0')}`, url: item.image_url })),
  ].filter((item) => item.url);

  if (!assets.length) return NextResponse.json({ error: 'Belum ada gambar untuk diunduh.' }, { status: 404 });

  const zip = new JSZip();

  await Promise.all(
    assets.map(async (asset) => {
      const res = await fetch(asset.url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`Gagal mengunduh ${asset.url}`);
      const bytes = await res.arrayBuffer();
      const ext = getExtensionFromUrl(asset.url);
      zip.file(`${asset.name}.${ext}`, bytes);
    }),
  );

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  const baseName = sanitizeFileName(project?.title || insight?.title || 'project');
  const dateStamp = new Date().toISOString().slice(0, 10);
  const fileName = `${baseName}-${dateStamp}.zip`;

  return new NextResponse(zipBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Cache-Control': 'no-store',
    },
  });
}
