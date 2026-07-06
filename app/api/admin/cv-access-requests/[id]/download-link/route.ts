import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAllowedAdminEmail } from '@/lib/admin-auth';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { CV_BUCKET, CV_OBJECT_PATH, CV_SIGNED_URL_EXPIRES_IN } from '@/lib/cv-access';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ error: 'Konfigurasi server belum siap.' }, { status: 500 });
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const supabase = createClient(url, key, { global: { headers: { Authorization: authHeader } } });
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  if (!isAllowedAdminEmail(data.user.email)) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  const { id } = await params;
  const { data: row, error } = await supabase.from('cv_access_requests').select('id,status,download_count').eq('id', id).single();
  if (error || !row) return NextResponse.json({ error: 'Permintaan tidak ditemukan.' }, { status: 404 });
  if (row.status !== 'approved') return NextResponse.json({ error: 'Link hanya dapat dibuat untuk request approved.' }, { status: 400 });
  const admin = createSupabaseAdminClient();
  if (!admin) return NextResponse.json({ error: 'Service role Supabase belum dikonfigurasi.' }, { status: 500 });
  const { data: signed, error: signedError } = await admin.storage.from(CV_BUCKET).createSignedUrl(CV_OBJECT_PATH, CV_SIGNED_URL_EXPIRES_IN, { download: 'Eryawan Agung Trimuda.pdf' });
  if (signedError || !signed?.signedUrl) return NextResponse.json({ error: 'Gagal membuat signed URL CV.' }, { status: 500 });
  const now = new Date();
  const expires = new Date(now.getTime() + CV_SIGNED_URL_EXPIRES_IN * 1000);
  await supabase.from('cv_access_requests').update({ download_token_created_at: now.toISOString(), download_expires_at: expires.toISOString(), download_count: (row.download_count || 0) + 1 }).eq('id', id);
  return NextResponse.json({ signedUrl: signed.signedUrl, expiresAt: expires.toISOString() });
}
