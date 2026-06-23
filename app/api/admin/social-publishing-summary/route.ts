import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAllowedAdminEmail } from '@/lib/admin-auth';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { toUtmContentLabel } from '@/lib/utm-links';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const platformDefinitions = [
  { key: 'instagram', label: 'Instagram', fields: ['instagram_reels_posted', 'instagram_carousel_posted'], urlField: 'instagram_url' },
  { key: 'threads', label: 'Threads', fields: ['threads_posted'], urlField: 'threads_url' },
  { key: 'tiktok', label: 'TikTok', fields: ['tiktok_posted'], urlField: 'tiktok_url' },
  { key: 'facebook', label: 'Facebook', fields: ['facebook_posted'], urlField: 'facebook_url' },
  { key: 'youtube_shorts', label: 'YouTube Shorts', fields: ['youtube_shorts_posted'], urlField: 'youtube_shorts_url' },
  { key: 'linkedin', label: 'LinkedIn', fields: ['linkedin_posted'], urlField: 'linkedin_url' },
  { key: 'whatsapp', label: 'WhatsApp', fields: ['whatsapp_shared'], urlField: 'whatsapp_url' },
] as const;

type ChecklistRow = {
  content_type: string;
  content_slug: string;
  content_title: string | null;
  posting_date: string | null;
  notes: string | null;
  instagram_reels_posted: boolean | null;
  instagram_carousel_posted: boolean | null;
  threads_posted: boolean | null;
  tiktok_posted: boolean | null;
  facebook_posted: boolean | null;
  youtube_shorts_posted: boolean | null;
  linkedin_posted: boolean | null;
  whatsapp_shared: boolean | null;
  instagram_url: string | null;
  threads_url: string | null;
  tiktok_url: string | null;
  facebook_url: string | null;
  youtube_shorts_url: string | null;
  linkedin_url: string | null;
  whatsapp_url: string | null;
  updated_at: string | null;
};

type PromoVisitRow = {
  path: string | null;
  utm_source: string | null;
  utm_content: string | null;
};

type ContentItem = {
  contentType: 'karya' | 'wawasan';
  slug: string;
  title: string | null;
  href: string;
};

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
  if (!supabase) return { error: NextResponse.json({ error: 'Ringkasan publikasi belum dikonfigurasi.' }, { status: 503 }) };
  return { supabase };
}

function getContentHref(contentType: string, slug: string) {
  return contentType === 'wawasan' ? `/wawasan/${slug}` : `/karya/${slug}`;
}

function getStatus(postedCount: number, totalRequired: number, visitCount: number) {
  if (postedCount === 0) return 'Belum dipromosikan';
  if (postedCount >= 4 && visitCount > 0) return 'Kanal utama sudah aktif';
  if (postedCount < totalRequired && visitCount > 0) return 'Perlu lengkapi kanal';
  if (visitCount > 0) return 'Mulai mendapat kunjungan';
  return 'Sudah diposting, belum ada kunjungan';
}

function visitMatchesContent(row: PromoVisitRow, contentType: string, slug: string) {
  const href = getContentHref(contentType, slug);
  const contentLabel = toUtmContentLabel(slug);
  return row.path === href || row.utm_content === contentLabel;
}

export async function GET(request: Request) {
  const auth = await requireAdmin(request);
  if ('error' in auth) return auth.error;

  const [{ data: checklists, error: checklistError }, { data: projects, error: projectsError }, { data: insights, error: insightsError }, { data: visits, error: visitsError }] = await Promise.all([
    auth.supabase.from('social_composer_checklists').select('*').order('updated_at', { ascending: false }).limit(200),
    auth.supabase.from('projects').select('slug,title').limit(1000),
    auth.supabase.from('insights').select('slug,title').limit(1000),
    auth.supabase.from('promo_link_visits').select('path,utm_source,utm_content').limit(5000),
  ]);

  if (checklistError) {
    console.error('[social-publishing-summary] Failed to fetch checklists', { code: checklistError.code, message: checklistError.message });
    return NextResponse.json({ error: 'Gagal memuat checklist publikasi.' }, { status: 500 });
  }

  if (projectsError || insightsError || visitsError) {
    console.error('[social-publishing-summary] Failed to fetch related summary data', {
      projects: projectsError?.message,
      insights: insightsError?.message,
      visits: visitsError?.message,
    });
    return NextResponse.json({ error: 'Gagal memuat ringkasan publikasi.' }, { status: 500 });
  }

  const checklistLookup = new Map<string, ChecklistRow>();
  ((checklists || []) as ChecklistRow[]).forEach((row) => {
    checklistLookup.set(`${row.content_type}:${row.content_slug}`, row);
  });

  const contentItems: ContentItem[] = [
    ...(projects || [])
      .filter((project) => Boolean(project.slug))
      .map((project) => ({
        contentType: 'karya' as const,
        slug: project.slug as string,
        title: project.title || null,
        href: `/karya/${project.slug}`,
      })),
    ...(insights || [])
      .filter((insight) => Boolean(insight.slug))
      .map((insight) => ({
        contentType: 'wawasan' as const,
        slug: insight.slug as string,
        title: insight.title || null,
        href: `/wawasan/${insight.slug}`,
      })),
  ];

  const visitRows = (visits || []) as PromoVisitRow[];

  const items = contentItems.map((content) => {
    const checklist = checklistLookup.get(`${content.contentType}:${content.slug}`);
    const platforms = platformDefinitions.map((platform) => {
      const posted = checklist ? platform.fields.some((field) => checklist[field] === true) : false;
      return {
        key: platform.key,
        label: platform.label,
        posted,
        url: checklist ? checklist[platform.urlField] || null : null,
      };
    });

    const matchedVisits = visitRows.filter((visit) => visitMatchesContent(visit, content.contentType, content.slug));
    const sourceCounts = new Map<string, number>();
    matchedVisits.forEach((visit) => {
      const source = visit.utm_source?.trim() || 'manual';
      sourceCounts.set(source, (sourceCounts.get(source) || 0) + 1);
    });
    const [topSource] = Array.from(sourceCounts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const postedCount = platforms.filter((platform) => platform.posted).length;
    const totalRequired = platforms.length;
    const visitCount = matchedVisits.length;

    return {
      contentType: content.contentType,
      slug: content.slug,
      title: checklist?.content_title || content.title || content.slug,
      href: content.href,
      platforms,
      postedChannels: platforms.filter((platform) => platform.posted).map((platform) => platform.label),
      unpostedChannels: platforms.filter((platform) => !platform.posted).map((platform) => platform.label),
      postingDate: checklist?.posting_date || null,
      notes: checklist?.notes || null,
      totalPostedChannels: postedCount,
      totalRequiredChannels: totalRequired,
      promoVisitCount: visitCount,
      topPromoSource: topSource ? topSource[0] : null,
      status: getStatus(postedCount, totalRequired, visitCount),
      updatedAt: checklist?.updated_at || null,
    };
  }).sort((a, b) => {
    const rank = (item: { totalPostedChannels: number; promoVisitCount: number }) => {
      if (item.totalPostedChannels === 0) return 0;
      if (item.promoVisitCount === 0) return 1;
      return 2;
    };
    return rank(a) - rank(b) || b.totalPostedChannels - a.totalPostedChannels || a.title.localeCompare(b.title);
  });

  return NextResponse.json({ items });
}
