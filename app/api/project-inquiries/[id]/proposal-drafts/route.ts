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

function errorJson(code: string, message: string, status: number) {
  return NextResponse.json({ error: message, code }, { status });
}

async function getAuthedSupabase(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { error: errorJson('SERVER_CONFIG_MISSING', 'Konfigurasi server belum siap.', 500) };
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return { error: errorJson('UNAUTHORIZED', 'Unauthorized.', 401) };
  const supabase = createClient(url, key, { global: { headers: { Authorization: authHeader } } });
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: errorJson('UNAUTHORIZED', 'Unauthorized.', 401) };
  if (!isAllowedAdminEmail(data.user.email)) return { error: errorJson('FORBIDDEN', 'Forbidden.', 403) };
  return { supabase, userEmail: data.user.email ?? null };
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthedSupabase(request); if ('error' in auth) return auth.error;
  const { id } = await params;
  if (!uuidPattern.test(id)) return errorJson('INVALID_INQUIRY_ID', 'ID inquiry tidak valid.', 400);

  const { data, error } = await auth.supabase
    .from('project_inquiry_proposal_drafts')
    .select(selectColumns)
    .eq('inquiry_id', id)
    .order('status', { ascending: true })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[proposal-drafts][GET] failed', { inquiryId: id, code: error.code, details: error.details, hint: error.hint });
    return errorJson('FETCH_FAILED', 'Gagal memuat riwayat draft proposal.', 500);
  }
  return NextResponse.json({ data: data || [] });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAuthedSupabase(request); if ('error' in auth) return auth.error;
  const { id } = await params;
  if (!uuidPattern.test(id)) return errorJson('INVALID_INQUIRY_ID', 'ID inquiry tidak valid.', 400);

  let payload: Record<string, unknown>;
  try { payload = await request.json(); } catch { return errorJson('INVALID_PAYLOAD', 'Payload tidak valid.', 400); }

  const title = sanitize(payload.title, MAX_TITLE);
  const draftContent = sanitize(payload.draftContent, MAX_DRAFT_CONTENT);
  const followUpMessage = sanitize(payload.followUpMessage, MAX_FOLLOW_UP);
  const model = sanitize(payload.model, MAX_MODEL);

  if (!title || !draftContent) return errorJson('MISSING_FIELDS', 'Judul dan isi draft wajib diisi.', 400);

  const { data: inquiry, error: inquiryError } = await auth.supabase
    .from('project_inquiries')
    .select('id')
    .eq('id', id)
    .maybeSingle();

  if (inquiryError) {
    console.error('[proposal-drafts][POST] inquiry lookup failed', { inquiryId: id, code: inquiryError.code, details: inquiryError.details, hint: inquiryError.hint });
    return errorJson('INQUIRY_LOOKUP_FAILED', 'Gagal memvalidasi inquiry.', 500);
  }
  if (!inquiry) return errorJson('INQUIRY_NOT_FOUND', 'Inquiry tidak ditemukan.', 404);

  const { data: versionRows, error: versionError } = await auth.supabase
    .from('project_inquiry_proposal_drafts')
    .select('version')
    .eq('inquiry_id', id)
    .order('version', { ascending: false })
    .limit(1);

  if (versionError) {
    console.error('[proposal-drafts][POST] version lookup failed', {
      inquiryId: id,
      code: versionError.code,
      details: versionError.details,
      hint: versionError.hint,
    });
    return errorJson('VERSION_CALCULATION_FAILED', 'Gagal memproses versi draft proposal.', 500);
  }

  const latestVersion = versionRows?.[0]?.version;
  const nextVersion = typeof latestVersion === 'number' && Number.isFinite(latestVersion)
    ? latestVersion + 1
    : 1;

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

  if (error) {
    const safeCode = error.code === '42501' ? 'RLS_BLOCKED' : error.code === '23503' ? 'INQUIRY_NOT_FOUND' : 'INSERT_FAILED';
    console.error('[proposal-drafts][POST] insert failed', { inquiryId: id, code: error.code, details: error.details, hint: error.hint });
    return errorJson(safeCode, 'Draft proposal belum berhasil disimpan. Silakan coba lagi.', safeCode === 'INQUIRY_NOT_FOUND' ? 404 : 500);
  }

  return NextResponse.json({ data });
}
