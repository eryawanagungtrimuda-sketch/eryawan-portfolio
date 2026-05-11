import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAllowedAdminEmail } from '@/lib/admin-auth';

const MAX_TITLE = 180;
const MAX_DRAFT_CONTENT = 12000;
const MAX_FOLLOW_UP = 4000;
const MAX_MODEL = 120;
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const selectColumns = 'id,inquiry_id,title,draft_content,follow_up_message,status,version,model,created_by,created_at,updated_at';

function sanitize(input: unknown, max: number) {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, max);
}

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
  return { supabase, userEmail: data.user.email ?? null };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthedSupabase(request); if ('error' in auth) return auth.error;
  const { id } = await params;
  if (!uuidPattern.test(id)) return NextResponse.json({ error: 'ID inquiry tidak valid.' }, { status: 400 });

  const { data, error } = await auth.supabase
    .from('project_inquiry_proposal_drafts')
    .select(selectColumns)
    .eq('inquiry_id', id)
    .order('status', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: 'Gagal memuat riwayat draft proposal.' }, { status: 500 });
  return NextResponse.json({ data: data || [] });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthedSupabase(request); if ('error' in auth) return auth.error;
  const { id } = await params;
  if (!uuidPattern.test(id)) return NextResponse.json({ error: 'ID inquiry tidak valid.' }, { status: 400 });

  let payload: Record<string, unknown>;
  try { payload = await request.json(); } catch { return NextResponse.json({ error: 'Payload tidak valid.' }, { status: 400 }); }

  const title = sanitize(payload.title, MAX_TITLE);
  const draftContent = sanitize(payload.draftContent, MAX_DRAFT_CONTENT);
  const followUpMessage = sanitize(payload.followUpMessage, MAX_FOLLOW_UP);
  const model = sanitize(payload.model, MAX_MODEL);

  if (!title || !draftContent) return NextResponse.json({ error: 'Judul dan isi draft wajib diisi.' }, { status: 400 });

  const { data: currentMaxRow, error: maxError } = await auth.supabase
    .from('project_inquiry_proposal_drafts')
    .select('version')
    .eq('inquiry_id', id)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxError) return NextResponse.json({ error: 'Gagal memproses versi draft proposal.' }, { status: 500 });

  const nextVersion = (currentMaxRow?.version ?? 0) + 1;

  const { data, error } = await auth.supabase
    .from('project_inquiry_proposal_drafts')
    .insert({
      inquiry_id: id,
      title,
      draft_content: draftContent,
      follow_up_message: followUpMessage || null,
      model: model || null,
      created_by: auth.userEmail,
      version: nextVersion,
      status: 'draft',
    })
    .select(selectColumns)
    .single();

  if (error) return NextResponse.json({ error: 'Draft proposal belum berhasil disimpan. Silakan coba lagi.' }, { status: 500 });

  return NextResponse.json({ data });
}
