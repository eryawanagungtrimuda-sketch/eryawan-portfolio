import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const allowedStatuses = ['baru', 'ditinjau', 'dihubungi', 'selesai', 'arsip'] as const;

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.json({ error: 'Konfigurasi server belum siap.' }, { status: 500 });

  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const supabase = createClient(url, key, { global: { headers: { Authorization: authHeader } } });
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  let body: { status?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Payload tidak valid.' }, { status: 400 }); }

  if (!body.status || !allowedStatuses.includes(body.status as (typeof allowedStatuses)[number])) {
    return NextResponse.json({ error: 'Status tidak valid.' }, { status: 400 });
  }

  const { error } = await supabase.from('project_inquiries').update({ status: body.status }).eq('id', id);
  if (error) return NextResponse.json({ error: 'Gagal memperbarui status inquiry.' }, { status: 500 });

  return NextResponse.json({ success: true });
}
