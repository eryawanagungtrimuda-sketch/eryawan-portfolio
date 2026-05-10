import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAllowedAdminEmail } from '@/lib/admin-auth';

const allowedStatuses = ['baru', 'ditinjau', 'dihubungi', 'selesai', 'arsip'] as const;
const selectColumns = 'id,nama,perusahaan,email,whatsapp,jenis_kebutuhan,lokasi_project,estimasi_luas,tahap_project,timeline,budget_range,kebutuhan_utama,status_file,message_preview,status,source,created_at,updated_at';

async function getAuthedSupabase(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { error: NextResponse.json({ error: 'Konfigurasi server belum siap.' }, { status: 500 }) };
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return { error: NextResponse.json({ error: 'Unauthorized.' }, { status: 401 }) };
  const supabase = createClient(url, key, { global: { headers: { Authorization: authHeader } } });
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: NextResponse.json({ error: 'Unauthorized.' }, { status: 401 }) };
  if (!isAllowedAdminEmail(data.user.email)) return { error: NextResponse.json({ error: 'Forbidden.' }, { status: 403 }) };
  return { supabase };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthedSupabase(request); if ('error' in auth) return auth.error;
  const { id } = await params;
  const { data, error } = await auth.supabase.from('project_inquiries').select(selectColumns).eq('id', id).single();
  if (error) return NextResponse.json({ error: 'Inquiry tidak ditemukan.' }, { status: 404 });
  return NextResponse.json({ data });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthedSupabase(request); if ('error' in auth) return auth.error;
  const { id } = await params;
  let body: { status?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Payload tidak valid.' }, { status: 400 }); }
  if (!body.status || !allowedStatuses.includes(body.status as (typeof allowedStatuses)[number])) return NextResponse.json({ error: 'Status tidak valid.' }, { status: 400 });
  const { error } = await auth.supabase.from('project_inquiries').update({ status: body.status }).eq('id', id);
  if (error) return NextResponse.json({ error: 'Gagal memperbarui status inquiry.' }, { status: 500 });
  return NextResponse.json({ success: true });
}
