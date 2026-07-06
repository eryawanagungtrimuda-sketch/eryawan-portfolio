import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAllowedAdminEmail } from '@/lib/admin-auth';
import { cvAccessStatuses, sanitizeCvField } from '@/lib/cv-access';

async function getAdminClient(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { error: NextResponse.json({ error: 'Konfigurasi server belum siap.' }, { status: 500 }) };
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return { error: NextResponse.json({ error: 'Unauthorized.' }, { status: 401 }) };
  const supabase = createClient(url, key, { global: { headers: { Authorization: authHeader } } });
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: NextResponse.json({ error: 'Unauthorized.' }, { status: 401 }) };
  if (!isAllowedAdminEmail(data.user.email)) return { error: NextResponse.json({ error: 'Forbidden.' }, { status: 403 }) };
  return { supabase };
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAdminClient(request); if ('error' in auth) return auth.error;
  const { id } = await params;
  let body: { status?: string; admin_note?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Payload tidak valid.' }, { status: 400 }); }
  if (!body.status || !cvAccessStatuses.includes(body.status as any)) return NextResponse.json({ error: 'Status tidak valid.' }, { status: 400 });
  const reviewed_at = body.status === 'approved' || body.status === 'rejected' ? new Date().toISOString() : null;
  const { error } = await auth.supabase.from('cv_access_requests').update({ status: body.status, reviewed_at, admin_note: sanitizeCvField(body.admin_note, 1200) || null }).eq('id', id);
  if (error) return NextResponse.json({ error: 'Gagal memperbarui status.' }, { status: 500 });
  return NextResponse.json({ success: true });
}
