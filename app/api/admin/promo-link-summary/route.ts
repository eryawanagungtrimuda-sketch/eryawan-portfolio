import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAllowedAdminEmail } from '@/lib/admin-auth';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const knownSources = ['instagram', 'tiktok', 'facebook', 'youtube_short', 'linkedin', 'manual'];

type PromoVisitSummaryRow = {
  path: string | null;
  utm_source: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
};

function countBy(rows: PromoVisitSummaryRow[], key: keyof PromoVisitSummaryRow, fallback: string, limit = 8) {
  const counts = new Map<string, number>();
  rows.forEach((row) => {
    const rawValue = row[key];
    const value = rawValue && rawValue.trim() ? rawValue.trim() : fallback;
    counts.set(value, (counts.get(value) || 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
    .slice(0, limit);
}

export async function GET(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Konfigurasi server belum siap.' }, { status: 503 });
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const authClient = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: userData } = await authClient.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  if (!isAllowedAdminEmail(userData.user.email)) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });

  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: 'Promo tracking belum dikonfigurasi.' }, { status: 503 });
  }

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await supabase
    .from('promo_link_visits')
    .select('path,utm_source,utm_campaign,utm_content')
    .gte('created_at', since)
    .limit(5000);

  if (error) {
    console.error('[promo-link-summary] Failed to fetch aggregate source rows', { code: error.code, message: error.message });
    return NextResponse.json({ error: 'Gagal memuat ringkasan link promosi.' }, { status: 500 });
  }

  const rows = (data || []) as PromoVisitSummaryRow[];
  const bySourceCounts = new Map(knownSources.map((source) => [source, 0]));
  rows.forEach((row) => {
    const source = row.utm_source || 'manual';
    bySourceCounts.set(source, (bySourceCounts.get(source) || 0) + 1);
  });

  return NextResponse.json({
    total: rows.length,
    bySource: Array.from(bySourceCounts.entries()).map(([source, count]) => ({ source, count })),
    topPaths: countBy(rows, 'path', 'Tanpa path').map((item) => ({ path: item.value, count: item.count })),
    topContent: countBy(rows, 'utm_content', 'Tanpa label').map((item) => ({ content: item.value, count: item.count })),
    topCampaigns: countBy(rows, 'utm_campaign', 'Tanpa campaign').map((item) => ({ campaign: item.value, count: item.count })),
  });
}
