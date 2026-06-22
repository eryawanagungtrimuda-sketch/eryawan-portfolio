import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAllowedAdminEmail } from '@/lib/admin-auth';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const allowedContentTypes = new Set(['karya', 'wawasan']);
const textFields = ['content_title', 'instagram_url', 'threads_url', 'tiktok_url', 'facebook_url', 'youtube_shorts_url', 'linkedin_url', 'whatsapp_url', 'posting_date', 'notes'] as const;
const booleanFields = ['instagram_posted', 'threads_posted', 'tiktok_posted', 'facebook_posted', 'youtube_shorts_posted', 'linkedin_posted', 'whatsapp_shared'] as const;

function sanitizeText(value: unknown, maxLength = 2000) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLength);
}

function sanitizeUrl(value: unknown) {
  const text = sanitizeText(value, 900);
  if (!text) return null;
  try {
    const url = new URL(text);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    return url.toString();
  } catch {
    return text.slice(0, 900);
  }
}

function sanitizeDate(value: unknown) {
  const text = sanitizeText(value, 20);
  if (!text) return null;
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : null;
}

async function requireAdmin(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return { error: NextResponse.json({ error: 'Konfigurasi server belum siap.' }, { status: 503 }) };
  }
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return { error: NextResponse.json({ error: 'Unauthorized.' }, { status: 401 }) };
  const authClient = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: userData } = await authClient.auth.getUser();
  if (!userData.user) return { error: NextResponse.json({ error: 'Unauthorized.' }, { status: 401 }) };
  if (!isAllowedAdminEmail(userData.user.email)) return { error: NextResponse.json({ error: 'Forbidden.' }, { status: 403 }) };
  const supabase = createSupabaseAdminClient();
  if (!supabase) return { error: NextResponse.json({ error: 'Checklist belum dikonfigurasi.' }, { status: 503 }) };
  return { supabase };
}

function readIdentity(searchParams: URLSearchParams) {
  const contentType = sanitizeText(searchParams.get('content_type'), 40);
  const contentSlug = sanitizeText(searchParams.get('content_slug'), 180);
  if (!contentType || !allowedContentTypes.has(contentType) || !contentSlug) return null;
  return { contentType, contentSlug };
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;
  const { searchParams } = new URL(request.url);
  const identity = readIdentity(searchParams);
  if (!identity) return NextResponse.json({ error: 'Parameter checklist tidak valid.' }, { status: 400 });

  const { data, error } = await auth.supabase
    .from('social_composer_checklists')
    .select('*')
    .eq('content_type', identity.contentType)
    .eq('content_slug', identity.contentSlug)
    .maybeSingle();

  if (error) {
    console.error('[social-composer-checklist] Failed to load checklist', { code: error.code, message: error.message });
    return NextResponse.json({ error: 'Gagal memuat checklist.' }, { status: 500 });
  }

  return NextResponse.json({ checklist: data || null });
}

export async function POST(request: Request) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'Payload checklist tidak valid.' }, { status: 400 });
  const contentType = sanitizeText(body.content_type, 40);
  const contentSlug = sanitizeText(body.content_slug, 180);
  if (!contentType || !allowedContentTypes.has(contentType) || !contentSlug) return NextResponse.json({ error: 'Konten checklist tidak valid.' }, { status: 400 });

  const row: Record<string, unknown> = {
    content_type: contentType,
    content_slug: contentSlug,
    updated_at: new Date().toISOString(),
  };
  for (const field of booleanFields) row[field] = body[field] === true;
  row.content_title = sanitizeText(body.content_title, 240);
  row.notes = sanitizeText(body.notes, 4000);
  row.posting_date = sanitizeDate(body.posting_date);
  for (const field of textFields) {
    if (field.endsWith('_url')) row[field] = sanitizeUrl(body[field]);
  }

  const { data, error } = await auth.supabase
    .from('social_composer_checklists')
    .upsert(row, { onConflict: 'content_type,content_slug' })
    .select('*')
    .single();

  if (error) {
    console.error('[social-composer-checklist] Failed to save checklist', { code: error.code, message: error.message });
    return NextResponse.json({ error: 'Gagal menyimpan checklist.' }, { status: 500 });
  }

  return NextResponse.json({ checklist: data });
}
