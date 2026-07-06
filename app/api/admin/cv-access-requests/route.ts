import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAllowedAdminEmail } from '@/lib/admin-auth';
import { cvAccessSelectColumns } from '@/lib/cv-access';

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ error: 'Konfigurasi server belum siap.' }, { status: 500 });
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const supabase = createClient(url, key, { global: { headers: { Authorization: authHeader } } });
  const { data } = await supabase.auth.getUser();
  if (!data.user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  if (!isAllowedAdminEmail(data.user.email)) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  const { data: rows, error } = await supabase.from('cv_access_requests').select(cvAccessSelectColumns).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: 'Gagal memuat permintaan akses CV.' }, { status: 500 });
  return NextResponse.json({ data: rows || [] });
}
