import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAllowedAdminEmail } from '@/lib/admin-auth';

const allowedStatuses = ['draft', 'used', 'archived'] as const;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; draftId: string }> }) {
  const auth = await getAuthedSupabase(request); if ('error' in auth) return auth.error;
  const { id, draftId } = await params;

  if (!uuidPattern.test(id) || !uuidPattern.test(draftId)) {
    return NextResponse.json({ error: 'ID inquiry atau draft tidak valid.' }, { status: 400 });
  }

  let body: { status?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Payload tidak valid.' }, { status: 400 }); }

  if (!body.status || !allowedStatuses.includes(body.status as (typeof allowedStatuses)[number])) {
    return NextResponse.json({ error: 'Status draft tidak valid.' }, { status: 400 });
  }

  if (body.status === 'used') {
    const { error: resetError } = await auth.supabase
      .from('project_inquiry_proposal_drafts')
      .update({ status: 'draft' })
      .eq('inquiry_id', id)
      .eq('status', 'used')
      .neq('id', draftId);

    if (resetError) return NextResponse.json({ error: 'Gagal memperbarui status draft proposal.' }, { status: 500 });
  }

  const { data, error } = await auth.supabase
    .from('project_inquiry_proposal_drafts')
    .update({ status: body.status })
    .eq('id', draftId)
    .eq('inquiry_id', id)
    .select('id,inquiry_id,title,draft_content,follow_up_message,status,version,model,created_by,created_at,updated_at')
    .single();

  if (error) return NextResponse.json({ error: 'Gagal memperbarui status draft proposal.' }, { status: 500 });
  return NextResponse.json({ data });
}
