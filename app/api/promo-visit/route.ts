import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

const allowedSources = new Set(['instagram', 'tiktok', 'facebook', 'youtube_short', 'linkedin', 'manual']);

type PromoVisitPayload = {
  path?: unknown;
  utm_source?: unknown;
  utm_medium?: unknown;
  utm_campaign?: unknown;
  utm_content?: unknown;
  referrer?: unknown;
  session_id?: unknown;
};

function sanitizeString(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > maxLength) return null;
  return trimmed;
}

function sanitizePath(value: unknown) {
  const path = sanitizeString(value, 500);
  if (!path || !path.startsWith('/')) return null;
  if (path.startsWith('//')) return null;
  return path;
}

export async function POST(request: Request) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ success: false, error: 'Promo tracking belum dikonfigurasi.' }, { status: 503 });
  }

  let payload: PromoVisitPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Payload tidak valid.' }, { status: 400 });
  }

  const path = sanitizePath(payload.path);
  const utmSource = sanitizeString(payload.utm_source, 80)?.toLowerCase() || null;

  if (!utmSource) {
    return NextResponse.json({ success: true });
  }

  if (!path || !allowedSources.has(utmSource)) {
    return NextResponse.json({ success: false, error: 'Payload tidak valid.' }, { status: 400 });
  }

  const row = {
    path,
    utm_source: utmSource,
    utm_medium: sanitizeString(payload.utm_medium, 120),
    utm_campaign: sanitizeString(payload.utm_campaign, 160),
    utm_content: sanitizeString(payload.utm_content, 200),
    referrer: sanitizeString(payload.referrer, 500),
    session_id: sanitizeString(payload.session_id, 120),
  };

  const { error } = await supabase.from('promo_link_visits').insert(row);
  if (error) {
    console.error('[promo-visit] Failed to insert promo visit', { code: error.code, message: error.message });
    return NextResponse.json({ success: false, error: 'Gagal menyimpan tracking promo.' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
