import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAllowedAdminEmail } from '@/lib/admin-auth';
import { getProjectInquiryPushConfig } from '@/lib/project-inquiry-push';

export const runtime = 'nodejs';

const tableName = 'project_inquiry_push_subscriptions';

async function getAdminSupabase(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    return { response: NextResponse.json({ error: 'Konfigurasi server belum siap.' }, { status: 500 }) };
  }

  const authorization = request.headers.get('authorization');
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return { response: NextResponse.json({ error: 'Unauthorized.' }, { status: 401 }) };
  }

  const supabase = createClient(url, anonKey, {
    global: { headers: { Authorization: authorization } },
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) {
    return { response: NextResponse.json({ error: 'Unauthorized.' }, { status: 401 }) };
  }
  if (!isAllowedAdminEmail(data.user.email)) {
    return { response: NextResponse.json({ error: 'Forbidden.' }, { status: 403 }) };
  }

  return { supabase };
}

function parseEndpoint(value: unknown) {
  if (typeof value !== 'string' || value.length > 4096) return null;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const auth = await getAdminSupabase(request);
  if ('response' in auth) return auth.response;
  return NextResponse.json(getProjectInquiryPushConfig());
}

export async function POST(request: Request) {
  const auth = await getAdminSupabase(request);
  if ('response' in auth) return auth.response;

  const config = getProjectInquiryPushConfig();
  if (!config.configured) {
    return NextResponse.json({ error: 'Notifikasi desktop belum dikonfigurasi di server.' }, { status: 503 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Payload notifikasi tidak valid.' }, { status: 400 });
  }
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ error: 'Payload notifikasi tidak valid.' }, { status: 400 });
  }

  const body = payload as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  const endpoint = parseEndpoint(body.endpoint);
  const p256dh = typeof body.keys?.p256dh === 'string' ? body.keys.p256dh.trim() : '';
  const authKey = typeof body.keys?.auth === 'string' ? body.keys.auth.trim() : '';
  if (!endpoint || !p256dh || !authKey || p256dh.length > 256 || authKey.length > 256) {
    return NextResponse.json({ error: 'Data langganan notifikasi tidak lengkap.' }, { status: 400 });
  }

  const userAgent = request.headers.get('user-agent')?.slice(0, 300) || null;
  const { error } = await auth.supabase.from(tableName).upsert(
    { endpoint, p256dh, auth: authKey, user_agent: userAgent },
    { onConflict: 'endpoint' }
  );
  if (error) {
    return NextResponse.json({ error: 'Gagal menyimpan pengaturan notifikasi.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request) {
  const auth = await getAdminSupabase(request);
  if ('response' in auth) return auth.response;

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: 'Payload notifikasi tidak valid.' }, { status: 400 });
  }
  if (!payload || typeof payload !== 'object') {
    return NextResponse.json({ error: 'Payload notifikasi tidak valid.' }, { status: 400 });
  }

  const endpoint = parseEndpoint((payload as { endpoint?: unknown }).endpoint);
  if (!endpoint) {
    return NextResponse.json({ error: 'Alamat langganan notifikasi tidak valid.' }, { status: 400 });
  }

  const { error } = await auth.supabase.from(tableName).delete().eq('endpoint', endpoint);
  if (error) {
    return NextResponse.json({ error: 'Gagal menonaktifkan notifikasi.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
