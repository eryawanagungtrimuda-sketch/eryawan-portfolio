'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import type { Project } from '@/lib/types';
import { useToast } from '@/components/toast-provider';
import { getAdminProjectCreateHref, getAdminProjectEditHref } from '@/lib/admin-project-return-path';
import { buildPromotionUrl, toUtmContentLabel, type PromotionSource, type PromotionTarget } from '@/lib/utm-links';

const projectColumns = 'id,title,slug,category,design_category,design_style,area_type,area_tags,is_published,cover_image,problem,solution,impact,konteks,konflik,keputusan_desain,pendekatan,dampak,insight_kunci,created_at,project_images(id)';

type DashboardInsight = {
  id: string;
  slug?: string | null;
  source_project_id?: string | null;
  ai_prompt_source?: string | null;
  title?: string | null;
  excerpt?: string | null;
  content?: string | null;
};

type DashboardProject = Project & {
  hasWawasan: boolean;
  relatedInsightId?: string | null;
  relatedInsightSlug?: string | null;
};

type AttentionReason = {
  label: string;
  metric: 'missingCover' | 'galleryIncomplete' | 'missingNarrative' | 'missingAreaTags' | 'missingWawasan';
};

type PromotionTargetOption = PromotionTarget & {
  value: string;
  label: string;
};

type PromoLinkSummary = {
  total: number;
  bySource: { source: PromotionSource; count: number }[];
  topPaths: { path: string; count: number }[];
  topContent: { content: string; count: number }[];
  topCampaigns: { campaign: string; count: number }[];
};

type SocialPublishingSummaryItem = {
  contentType: string;
  slug: string;
  title: string;
  href: string;
  postedChannels: string[];
  unpostedChannels: string[];
  postingDate: string | null;
  notes: string | null;
  totalPostedChannels: number;
  totalRequiredChannels: number;
  promoVisitCount: number;
  topPromoSource: string | null;
  status: 'Belum dipromosikan' | 'Sudah diposting, belum ada kunjungan' | 'Mulai mendapat kunjungan' | 'Perlu lengkapi kanal' | 'Kanal utama sudah aktif';
};

type SocialPublishingSummary = {
  items: SocialPublishingSummaryItem[];
};

function getPromotionSourceLabel(value?: string | null) {
  return promotionSourceOptions.find((source) => source.value === value)?.label || value || 'Manual / Lainnya';
}

const vercelAnalyticsUrl = 'https://vercel.com/eryawanagungtrimuda-sketchs-projects/eryawan-portfolio/analytics';

const promotionSourceOptions: { value: PromotionSource; label: string }[] = [
  { value: 'instagram', label: 'Instagram' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'youtube_short', label: 'YouTube Short' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'manual', label: 'Manual / Lainnya' },
];

const staticPromotionTargets: PromotionTargetOption[] = [
  { value: 'home', label: 'Beranda', path: '/', contentLabel: 'home' },
  { value: 'all-works', label: 'Semua Karya', path: '/karya', contentLabel: 'all_works' },
  { value: 'start-project', label: 'Mulai Project', path: '/mulai-project', contentLabel: 'start_project' },
  { value: 'insights', label: 'Wawasan', path: '/wawasan', contentLabel: 'wawasan' },
];

function isBlank(value?: string | null) {
  return !value || value.trim().length === 0;
}

function getProjectAttentionReasons(project: DashboardProject): AttentionReason[] {
  const reasons: AttentionReason[] = [];
  const galleryCount = Array.isArray(project.project_images) ? project.project_images.length : null;

  if (isBlank(project.cover_image)) {
    reasons.push({ label: 'Belum ada gambar cover', metric: 'missingCover' });
  }

  if (galleryCount !== null && galleryCount < 3) {
    reasons.push({ label: 'Galeri belum lengkap', metric: 'galleryIncomplete' });
  }

  const isCaseStudyNarrativeIncomplete = [
    project.konteks,
    project.konflik,
    project.keputusan_desain,
    project.pendekatan,
    project.dampak || project.impact,
    project.insight_kunci,
  ].some(isBlank);

  if (isCaseStudyNarrativeIncomplete) {
    reasons.push({ label: 'Narasi studi kasus belum lengkap', metric: 'missingNarrative' });
  }

  if (!Array.isArray(project.area_tags) || project.area_tags.length === 0) {
    reasons.push({ label: 'Belum ada tag area', metric: 'missingAreaTags' });
  }

  if (!project.hasWawasan) {
    reasons.push({ label: 'Belum ada Wawasan terkait', metric: 'missingWawasan' });
  }

  return reasons;
}

function normalizeText(value?: string | null) {
  return (value || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

function normalizeSlug(value?: string | null) {
  return normalizeText(value)
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function findRelatedInsightForDashboardProject(project: Project, insights: DashboardInsight[]) {
  const projectId = (project.id || '').trim();
  const projectSlug = normalizeSlug(project.slug);
  const projectTitle = normalizeText(project.title);

  const sourceProjectMatch = insights.find((insight) => (insight.source_project_id || '').trim() === projectId);
  if (sourceProjectMatch) return sourceProjectMatch;

  const legacyInsights = insights.filter((insight) => !(insight.source_project_id || '').trim());
  const legacySlugMatch = legacyInsights.find((insight) => {
    const haystack = normalizeSlug([insight.ai_prompt_source, insight.excerpt, insight.content, insight.title].join(' '));
    return Boolean(projectSlug) && haystack.includes(projectSlug);
  });
  if (legacySlugMatch) return legacySlugMatch;

  const legacyTitleMatch = legacyInsights.find((insight) => {
    const haystack = normalizeText([insight.ai_prompt_source, insight.excerpt, insight.content, insight.title].join(' '));
    return Boolean(projectTitle) && haystack.includes(projectTitle);
  });

  return legacyTitleMatch || null;
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(value));
  } catch {
    return '—';
  }
}

function formatLoadedAt(value: Date) {
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(value);
}


export default function AdminDashboardCMS() {
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [wawasanFilter, setWawasanFilter] = useState<'all' | 'with_wawasan' | 'without_wawasan'>('all');
  const [promotionTargetValue, setPromotionTargetValue] = useState(staticPromotionTargets[0].value);
  const [promotionSource, setPromotionSource] = useState<PromotionSource>('instagram');
  const [promotionCampaign, setPromotionCampaign] = useState('portfolio_content');
  const [promotionContent, setPromotionContent] = useState(staticPromotionTargets[0].contentLabel);
  const [promotionCopied, setPromotionCopied] = useState(false);
  const [promoSummary, setPromoSummary] = useState<PromoLinkSummary | null>(null);
  const [promoSummaryLoading, setPromoSummaryLoading] = useState(true);
  const [promoSummaryMessage, setPromoSummaryMessage] = useState('');
  const [promoSummaryLoadedAt, setPromoSummaryLoadedAt] = useState<Date | null>(null);
  const [publishingSummary, setPublishingSummary] = useState<SocialPublishingSummary | null>(null);
  const [publishingSummaryLoading, setPublishingSummaryLoading] = useState(true);
  const [publishingSummaryMessage, setPublishingSummaryMessage] = useState('');
  const [publishingSummaryLoadedAt, setPublishingSummaryLoadedAt] = useState<Date | null>(null);
  const [publishingFilter, setPublishingFilter] = useState<'all' | 'not_promoted' | 'posted' | 'no_visits'>('all');
  const { toast } = useToast();

  async function loadProjects() {
    setLoading(true);
    setMessage('');

    try {
      const supabase = getSupabaseClient();
      const { data, error, status } = await supabase
        .from('projects')
        .select(projectColumns)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[AdminDashboardCMS] Failed to fetch public.projects', {
          table: 'public.projects',
          columns: projectColumns,
          status,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });

        const emptyLikeError =
          error.code === 'PGRST116' ||
          error.message.toLowerCase().includes('no rows') ||
          error.message.toLowerCase().includes('0 rows');

        if (emptyLikeError) {
          setProjects([]);
          setMessage('');
          return;
        }

        setProjects([]);
        setMessage(`Tidak dapat membaca table public.projects: ${error.message}`);
        return;
      }

      const { data: insights, error: insightsError } = await supabase
        .from('insights')
        .select('id,slug,source_project_id,ai_prompt_source,title,excerpt,content')
        .order('created_at', { ascending: false });

      if (insightsError) {
        console.warn('[AdminDashboardCMS] Failed to fetch public.insights', {
          table: 'public.insights',
          code: insightsError.code,
          message: insightsError.message,
          details: insightsError.details,
          hint: insightsError.hint,
        });
      }

      const mappedProjects = (data || []).map((project) => {
        const relatedInsight = insightsError ? null : findRelatedInsightForDashboardProject(project as Project, (insights || []) as DashboardInsight[]);
        return {
          ...(project as Project),
          hasWawasan: Boolean(relatedInsight),
          relatedInsightId: relatedInsight?.id || null,
          relatedInsightSlug: relatedInsight?.slug || null,
        };
      });

      setProjects(mappedProjects);
      setMessage('');
    } catch (error) {
      console.error('[AdminDashboardCMS] Unexpected projects fetch failure', error);
      setProjects([]);
      setMessage(error instanceof Error ? error.message : 'Terjadi kesalahan saat membaca data project.');
    } finally {
      setLoading(false);
    }
  }


  async function loadPromoSummary() {
    setPromoSummaryLoading(true);
    setPromoSummaryMessage('');

    try {
      const supabase = getSupabaseClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setPromoSummary(null);
        setPromoSummaryMessage('Sesi admin belum tersedia untuk membaca ringkasan promosi.');
        return;
      }

      const response = await fetch('/api/admin/promo-link-summary', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const result = await response.json().catch(() => null) as PromoLinkSummary | { error?: string } | null;

      if (!response.ok) {
        setPromoSummary(null);
        setPromoSummaryMessage(result && 'error' in result && result.error ? result.error : 'Gagal memuat ringkasan link promosi.');
        return;
      }

      setPromoSummary(result as PromoLinkSummary);
      setPromoSummaryLoadedAt(new Date());
    } catch (error) {
      console.error('[AdminDashboardCMS] Failed to load promo summary', error);
      setPromoSummary(null);
      setPromoSummaryMessage(error instanceof Error ? error.message : 'Gagal memuat ringkasan link promosi.');
    } finally {
      setPromoSummaryLoading(false);
    }
  }


  async function loadPublishingSummary() {
    setPublishingSummaryLoading(true);
    setPublishingSummaryMessage('');

    try {
      const supabase = getSupabaseClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        setPublishingSummary(null);
        setPublishingSummaryMessage('Sesi admin belum tersedia untuk membaca status publikasi.');
        return;
      }

      const response = await fetch('/api/admin/social-publishing-summary', {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      const result = await response.json().catch(() => null) as SocialPublishingSummary | { error?: string } | null;

      if (!response.ok) {
        setPublishingSummary(null);
        setPublishingSummaryMessage(result && 'error' in result && result.error ? result.error : 'Gagal memuat status publikasi konten.');
        return;
      }

      setPublishingSummary(result as SocialPublishingSummary);
      setPublishingSummaryLoadedAt(new Date());
    } catch (error) {
      console.error('[AdminDashboardCMS] Failed to load publishing summary', error);
      setPublishingSummary(null);
      setPublishingSummaryMessage(error instanceof Error ? error.message : 'Gagal memuat status publikasi konten.');
    } finally {
      setPublishingSummaryLoading(false);
    }
  }


  useEffect(() => {
    loadProjects();
    loadPromoSummary();
    loadPublishingSummary();
  }, []);

  const contentHealth = useMemo(() => {
    const projectsWithReasons = projects.map((project) => ({ project, reasons: getProjectAttentionReasons(project) }));
    return {
      publishedCount: projects.filter((project) => project.is_published !== false).length,
      draftCount: projects.filter((project) => project.is_published === false).length,
      withWawasanCount: projects.filter((project) => project.hasWawasan).length,
      needsAttention: projectsWithReasons.filter((item) => item.reasons.length > 0),
      missingCover: projectsWithReasons.filter((item) => item.reasons.some((reason) => reason.metric === 'missingCover')).length,
      galleryIncomplete: projectsWithReasons.filter((item) => item.reasons.some((reason) => reason.metric === 'galleryIncomplete')).length,
      missingNarrative: projectsWithReasons.filter((item) => item.reasons.some((reason) => reason.metric === 'missingNarrative')).length,
      missingAreaTags: projectsWithReasons.filter((item) => item.reasons.some((reason) => reason.metric === 'missingAreaTags')).length,
      missingWawasan: projectsWithReasons.filter((item) => item.reasons.some((reason) => reason.metric === 'missingWawasan')).length,
    };
  }, [projects]);

  const attentionPreview = useMemo(() => contentHealth.needsAttention.slice(0, 8), [contentHealth.needsAttention]);

  const filteredPublishingItems = useMemo(() => {
    const items = publishingSummary?.items || [];
    if (publishingFilter === 'not_promoted') return items.filter((item) => item.totalPostedChannels === 0);
    if (publishingFilter === 'posted') return items.filter((item) => item.totalPostedChannels > 0);
    if (publishingFilter === 'no_visits') return items.filter((item) => item.totalPostedChannels > 0 && item.promoVisitCount === 0);
    return items;
  }, [publishingFilter, publishingSummary]);

  const promotionTargets = useMemo<PromotionTargetOption[]>(() => {
    const projectTargets = projects
      .filter((project) => Boolean(project.slug))
      .map((project) => ({
        value: `project:${project.id}`,
        label: `Proyek: ${project.title}`,
        path: `/karya/${project.slug}`,
        contentLabel: toUtmContentLabel(project.slug || project.title || 'project'),
      }));

    return [...staticPromotionTargets, ...projectTargets];
  }, [projects]);

  const selectedPromotionTarget = useMemo(() => {
    return promotionTargets.find((target) => target.value === promotionTargetValue) || promotionTargets[0];
  }, [promotionTargets, promotionTargetValue]);

  const generatedPromotionUrl = useMemo(() => buildPromotionUrl({
    target: selectedPromotionTarget,
    source: promotionSource,
    campaign: promotionCampaign,
    content: promotionContent,
  }), [selectedPromotionTarget, promotionSource, promotionCampaign, promotionContent]);

  const promotionPathLabels = useMemo(() => new Map(promotionTargets.map((target) => [target.path, target.label.replace(/^Proyek: /, '')])), [promotionTargets]);

  function getPromotionPathLabel(path: string) {
    return promotionPathLabels.get(path) || path;
  }

  useEffect(() => {
    const fallbackTarget = promotionTargets[0];
    const currentTarget = promotionTargets.find((target) => target.value === promotionTargetValue);

    if (!currentTarget && fallbackTarget) {
      setPromotionTargetValue(fallbackTarget.value);
      setPromotionContent(fallbackTarget.contentLabel);
    }
  }, [promotionTargets, promotionTargetValue]);

  const filteredProjects = useMemo(() => {
    if (wawasanFilter === 'with_wawasan') return projects.filter((project) => project.hasWawasan);
    if (wawasanFilter === 'without_wawasan') return projects.filter((project) => !project.hasWawasan);
    return projects;
  }, [projects, wawasanFilter]);

  function handlePromotionTargetChange(value: string) {
    const nextTarget = promotionTargets.find((target) => target.value === value);
    setPromotionTargetValue(value);
    setPromotionContent(nextTarget?.contentLabel || '');
    setPromotionCopied(false);
  }

  async function copyPromotionLink() {
    try {
      await navigator.clipboard.writeText(generatedPromotionUrl);
      setPromotionCopied(true);
      toast({ type: 'success', title: 'Link disalin', description: 'Link promosi UTM siap ditempel ke caption atau bio.' });
      window.setTimeout(() => setPromotionCopied(false), 2400);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Browser tidak mengizinkan salin otomatis.';
      setPromotionCopied(false);
      toast({ type: 'error', title: 'Gagal menyalin link', description: errorMessage });
    }
  }

  async function deleteProject(project: DashboardProject) {
    const confirmed = window.confirm(`Hapus project "${project.title}"?`);
    if (!confirmed) return;

    setDeletingId(project.id);
    setMessage('');

    try {
      const supabase = getSupabaseClient();
      const { error, status } = await supabase.from('projects').delete().eq('id', project.id);
      if (error) {
        console.error('[AdminDashboardCMS] Failed to delete public.projects row', {
          table: 'public.projects',
          id: project.id,
          status,
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }
      setProjects((current) => current.filter((item) => item.id !== project.id));
      toast({ type: 'success', title: 'Project dihapus', description: `${project.title} berhasil dihapus.` });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal menghapus project.';
      setMessage(errorMessage);
      toast({ type: 'error', title: 'Gagal menghapus project', description: errorMessage });
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <section className="py-14 space-y-10" aria-label="Memuat dashboard project" aria-busy="true">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="rounded-2xl border border-white/8 bg-white/[0.022] p-7">
              <div className="premium-skeleton h-3 w-28" />
              <div className="premium-skeleton mt-6 h-14 w-24" />
              <div className="premium-skeleton mt-5 h-3 w-11/12" />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="premium-skeleton h-4 w-44" />
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.015] p-4">
            <div className="grid grid-cols-5 gap-4 border-b border-white/10 pb-4">
              <div className="premium-skeleton col-span-2 h-3" />
              <div className="premium-skeleton h-3" />
              <div className="premium-skeleton h-3" />
              <div className="premium-skeleton h-3" />
            </div>
            <div className="space-y-3 pt-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="grid grid-cols-5 gap-4">
                  <div className="premium-skeleton col-span-2 h-9" />
                  <div className="premium-skeleton h-9" />
                  <div className="premium-skeleton h-9" />
                  <div className="premium-skeleton h-9" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="py-14">
      <section>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#D4AF37]/90">Ikhtisar</p>
            <h2 className="font-display mt-4 text-4xl font-normal leading-[1.08] tracking-[-0.035em] md:text-5xl">Ringkasan Proyek</h2>
          </div>
          <div className="hidden h-px flex-1 bg-white/[0.07] md:block" />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/8 bg-white/[0.022] p-7 transition duration-300 hover:border-[#D4AF37]/22 hover:bg-white/[0.032] hover:shadow-[0_18px_44px_rgba(212,175,55,0.035)]">
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.26em] text-white/42">Total Proyek</p>
            <p className="mt-6 font-display text-6xl leading-none text-white/90 md:text-7xl">{projects.length}</p>
            <p className="mt-4 text-sm leading-6 text-white/38">Seluruh proyek yang tercatat di dashboard admin.</p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.022] p-7 transition duration-300 hover:border-[#D4AF37]/22 hover:bg-white/[0.032] hover:shadow-[0_18px_44px_rgba(212,175,55,0.035)]">
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.26em] text-white/42">Terbit / Draft</p>
            <p className="mt-6 font-display text-4xl leading-none text-white/90 md:text-5xl">{contentHealth.publishedCount} / {contentHealth.draftCount}</p>
            <p className="mt-4 text-sm leading-6 text-white/38">{contentHealth.publishedCount} Terbit / {contentHealth.draftCount} Draft</p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.022] p-7 transition duration-300 hover:border-[#D4AF37]/22 hover:bg-white/[0.032] hover:shadow-[0_18px_44px_rgba(212,175,55,0.035)]">
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.26em] text-white/42">Proyek dengan Wawasan</p>
            <p className="mt-6 font-display text-6xl leading-none text-white/90 md:text-7xl">{contentHealth.withWawasanCount}</p>
            <p className="mt-4 text-sm leading-6 text-white/38">Proyek yang sudah memiliki konten Wawasan pendukung.</p>
          </div>

          <div className="rounded-2xl border border-[#D4AF37]/18 bg-[#D4AF37]/[0.035] p-7 transition duration-300 hover:border-[#D4AF37]/35 hover:bg-[#D4AF37]/[0.055] hover:shadow-[0_18px_44px_rgba(212,175,55,0.055)]">
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.26em] text-[#D4AF37]/85">Perlu Dilengkapi</p>
            <p className="mt-6 font-display text-6xl leading-none text-white/90 md:text-7xl">{contentHealth.needsAttention.length}</p>
            <p className="mt-4 text-sm leading-6 text-white/45">Proyek yang masih perlu dilengkapi sebelum dipromosikan.</p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-white/8 bg-white/[0.018] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-white/40">Akses Analitik</p>
            <p className="mt-2 text-sm leading-6 text-white/52">Buka Vercel Analytics untuk melihat performa website tanpa menarik data analitik ke dashboard admin.</p>
          </div>
          <Link href={vercelAnalyticsUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#D4AF37]/35 px-5 py-2.5 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-[#D4AF37] transition duration-300 hover:bg-[#D4AF37]/10">
            Lihat Vercel Analytics
          </Link>
        </div>
      </section>

      <section className="mt-8 rounded-[28px] border border-[#D4AF37]/16 bg-[#D4AF37]/[0.028] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#D4AF37]/90">Link Promosi</p>
            <h2 className="font-display mt-4 text-3xl font-normal leading-[1.08] tracking-[-0.035em] text-white/92 md:text-4xl">Pembuat Link Promosi</h2>
            <p className="mt-4 text-sm leading-6 text-white/52">Buat link portfolio dengan penanda sumber traffic untuk IG, TikTok, Facebook, YouTube Short, dan kanal lainnya.</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-white/42">Medium UTM: social</div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="promotion-target" className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-white/50">Target halaman</label>
            <select id="promotion-target" value={promotionTargetValue} onChange={(event) => handlePromotionTargetChange(event.target.value)} className="w-full rounded-xl border border-white/12 bg-[#121212] px-4 py-3 text-sm text-white/80 outline-none transition focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20">
              {promotionTargets.map((target) => <option key={target.value} value={target.value}>{target.label}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="promotion-source" className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-white/50">Kanal / Sumber</label>
            <select id="promotion-source" value={promotionSource} onChange={(event) => { setPromotionSource(event.target.value as PromotionSource); setPromotionCopied(false); }} className="w-full rounded-xl border border-white/12 bg-[#121212] px-4 py-3 text-sm text-white/80 outline-none transition focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20">
              {promotionSourceOptions.map((source) => <option key={source.value} value={source.value}>{source.label}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <label htmlFor="promotion-campaign" className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-white/50">Kampanye</label>
            <input id="promotion-campaign" value={promotionCampaign} onChange={(event) => { setPromotionCampaign(event.target.value); setPromotionCopied(false); }} className="w-full rounded-xl border border-white/12 bg-[#121212] px-4 py-3 text-sm text-white/80 outline-none transition placeholder:text-white/24 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20" placeholder="portfolio_content" />
          </div>
          <div className="space-y-2">
            <label htmlFor="promotion-content" className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-white/50">Label konten opsional</label>
            <input id="promotion-content" value={promotionContent} onChange={(event) => { setPromotionContent(event.target.value); setPromotionCopied(false); }} className="w-full rounded-xl border border-white/12 bg-[#121212] px-4 py-3 text-sm text-white/80 outline-none transition placeholder:text-white/24 focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20" placeholder={selectedPromotionTarget.contentLabel} />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 p-4">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-white/38">Link yang Dihasilkan</p>
          <p className="mt-3 break-all text-sm leading-6 text-white/72">{generatedPromotionUrl}</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="button" onClick={copyPromotionLink} className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#D4AF37] px-5 py-2.5 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-[#080807] transition duration-300 hover:-translate-y-0.5 hover:bg-[#E2C866]">Salin Link</button>
            {promotionCopied ? <p className="text-sm leading-6 text-emerald-300">Link promosi berhasil disalin.</p> : null}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.018] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#D4AF37]/90">Analitik Promosi</p>
            <h2 className="font-display mt-4 text-3xl font-normal leading-[1.08] tracking-[-0.035em] text-white/92 md:text-4xl">Performa Link Promosi</h2>
            <p className="mt-4 text-sm leading-6 text-white/52">Ringkasan kunjungan dari link promosi yang memakai UTM.</p>
            <p className="mt-2 text-xs leading-5 text-white/40">Data ini hanya menghitung kunjungan dari link yang memiliki UTM.</p>
          </div>
          <div className="flex flex-col items-start gap-2 lg:items-end">
            <button type="button" onClick={loadPromoSummary} className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#D4AF37]/35 px-5 py-2.5 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-[#D4AF37] transition duration-300 hover:bg-[#D4AF37]/10">
              Muat Ulang
            </button>
            {promoSummaryLoadedAt ? <p className="text-xs leading-5 text-white/38">Terakhir dimuat: {formatLoadedAt(promoSummaryLoadedAt)}</p> : null}
          </div>
        </div>

        {promoSummaryLoading ? (
          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => <div key={index} className="premium-skeleton h-28 rounded-2xl" />)}
          </div>
        ) : promoSummaryMessage ? (
          <p className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">{promoSummaryMessage}</p>
        ) : promoSummary && promoSummary.total === 0 ? (
          <p className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm leading-6 text-white/58">Belum ada kunjungan promosi. Buat link dari Pembuat Link Promosi, buka link tersebut, lalu klik Muat Ulang.</p>
        ) : promoSummary ? (
          <>
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
              <div className="rounded-2xl border border-[#D4AF37]/18 bg-[#D4AF37]/[0.035] p-5">
                <p className="font-mono text-[9px] font-black uppercase tracking-[0.22em] text-[#D4AF37]/85">Total 30 Hari</p>
                <p className="mt-5 font-display text-5xl leading-none text-white/92">{promoSummary.total}</p>
              </div>
              {promotionSourceOptions.map((source) => {
                const count = promoSummary.bySource.find((item) => item.source === source.value)?.count || 0;
                return (
                  <div key={source.value} className="rounded-2xl border border-white/8 bg-black/20 p-5">
                    <p className="font-mono text-[9px] font-black uppercase tracking-[0.22em] text-white/42">{source.label}</p>
                    <p className="mt-5 font-display text-5xl leading-none text-white/90">{count}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
              <div className="rounded-2xl border border-white/8 bg-black/20 p-5">
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-white/45">Halaman paling sering dibuka dari promosi</p>
                <div className="mt-5 space-y-3">
                  {promoSummary.topPaths.length > 0 ? promoSummary.topPaths.slice(0, 5).map((item) => (
                    <div key={item.path} className="flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
                      <span>
                        <span className="block text-sm font-semibold leading-5 text-white/82">{getPromotionPathLabel(item.path)}</span>
                        <span className="mt-1 block break-all text-xs leading-5 text-white/38">{item.path}</span>
                      </span>
                      <span className="font-mono text-sm font-black text-[#D4AF37]">{item.count}</span>
                    </div>
                  )) : <p className="text-sm leading-6 text-white/42">Belum ada kunjungan promosi.</p>}
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-black/20 p-5">
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-white/45">Konten promosi teratas</p>
                <div className="mt-5 space-y-3">
                  {promoSummary.topContent.length > 0 ? promoSummary.topContent.slice(0, 5).map((item) => (
                    <div key={item.content} className="flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
                      <span className="break-all text-sm text-white/70">{item.content}</span>
                      <span className="font-mono text-sm font-black text-[#D4AF37]">{item.count}</span>
                    </div>
                  )) : <p className="text-sm leading-6 text-white/42">Belum ada label konten promosi.</p>}
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-black/20 p-5">
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-white/45">Kampanye Teratas</p>
                <div className="mt-5 space-y-3">
                  {promoSummary.topCampaigns.length > 0 ? promoSummary.topCampaigns.slice(0, 5).map((item) => (
                    <div key={item.campaign} className="flex items-center justify-between gap-4 rounded-xl border border-white/8 bg-white/[0.025] px-4 py-3">
                      <span className="break-all text-sm text-white/70">{item.campaign}</span>
                      <span className="font-mono text-sm font-black text-[#D4AF37]">{item.count}</span>
                    </div>
                  )) : <p className="text-sm leading-6 text-white/42">Belum ada kampanye promosi.</p>}
                </div>
              </div>
            </div>
          </>
        ) : null}
      </section>


      <section className="mt-8 rounded-[28px] border border-white/10 bg-white/[0.018] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.18)] md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#D4AF37]/90">Publikasi Manual</p>
            <h2 className="font-display mt-4 text-3xl font-normal leading-[1.08] tracking-[-0.035em] text-white/92 md:text-4xl">Status Publikasi Konten</h2>
            <p className="mt-4 text-sm leading-6 text-white/52">Ringkasan kanal yang sudah diposting dan performa awal dari link promosi.</p>
          </div>
          <div className="flex flex-col items-start gap-2 lg:items-end">
            <button type="button" onClick={loadPublishingSummary} className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#D4AF37]/35 px-5 py-2.5 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-[#D4AF37] transition duration-300 hover:bg-[#D4AF37]/10">
              Muat Ulang
            </button>
            {publishingSummaryLoadedAt ? <p className="text-xs leading-5 text-white/38">Terakhir dimuat: {formatLoadedAt(publishingSummaryLoadedAt)}</p> : null}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {[
            ['all', 'Semua'],
            ['not_promoted', 'Belum dipromosikan'],
            ['posted', 'Sudah diposting'],
            ['no_visits', 'Belum ada kunjungan'],
          ].map(([value, label]) => (
            <button key={value} type="button" onClick={() => setPublishingFilter(value as typeof publishingFilter)} className={`rounded-full border px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.14em] transition ${publishingFilter === value ? 'border-[#D4AF37]/60 bg-[#D4AF37]/15 text-[#D4AF37]' : 'border-white/10 bg-black/20 text-white/48 hover:border-[#D4AF37]/35 hover:text-[#D4AF37]'}`}>
              {label}
            </button>
          ))}
        </div>

        {publishingSummaryLoading ? (
          <div className="mt-8 space-y-3">
            {Array.from({ length: 4 }).map((_, index) => <div key={index} className="premium-skeleton h-20 rounded-2xl" />)}
          </div>
        ) : publishingSummaryMessage ? (
          <p className="mt-6 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4 text-sm leading-6 text-amber-100">{publishingSummaryMessage}</p>
        ) : publishingSummary && publishingSummary.items.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5 text-sm leading-6 text-white/58">Belum ada data publikasi. Simpan Checklist dari Social Composer untuk mulai melihat status publikasi di dashboard.</p>
        ) : publishingSummary ? (
          <div className="mt-8 overflow-hidden rounded-2xl border border-white/8 bg-black/20">
            <div className="hidden grid-cols-[1.2fr_1fr_1fr_0.45fr_0.9fr] border-b border-white/[0.07] px-5 py-4 font-mono text-[9px] font-black uppercase tracking-[0.22em] text-white/34 lg:grid">
              <span>Konten</span>
              <span>Sudah Diposting</span>
              <span>Belum Diposting</span>
              <span>Kunjungan UTM</span>
              <span>Status</span>
            </div>
            {filteredPublishingItems.length > 0 ? (
              <div className="divide-y divide-white/[0.07]">
                {filteredPublishingItems.map((item) => (
                  <div key={`${item.contentType}:${item.slug}`} className="grid gap-4 px-5 py-5 transition duration-300 hover:bg-[#D4AF37]/[0.045] lg:grid-cols-[1.2fr_1fr_1fr_0.45fr_0.9fr] lg:items-start">
                    <div>
                      <p className="text-base font-semibold leading-6 text-white/90">{item.title}</p>
                      <p className="mt-1 text-xs text-white/36">/{item.slug}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Link href={item.href} target="_blank" rel="noreferrer" className="rounded-full border border-white/10 px-3 py-1.5 font-mono text-[9px] font-black uppercase tracking-[0.14em] text-white/58 transition hover:border-[#D4AF37]/40 hover:text-[#D4AF37]">Lihat Checklist</Link>
                        {item.postingDate ? <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/42">{formatDate(item.postingDate)}</span> : null}
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-emerald-200/80">{item.postedChannels.length > 0 ? item.postedChannels.join(', ') : '—'}</p>
                    <p className="text-sm leading-6 text-white/50">{item.unpostedChannels.length > 0 ? item.unpostedChannels.join(', ') : '—'}</p>
                    <div>
                      <p className="font-display text-4xl leading-none text-white/90">{item.promoVisitCount}</p>
                      {item.topPromoSource ? <p className="mt-2 text-xs leading-5 text-white/38">Teratas: {getPromotionSourceLabel(item.topPromoSource)}</p> : null}
                    </div>
                    <div>
                      <span className="inline-flex rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-3 py-1.5 text-xs font-semibold text-[#D4AF37]">{item.status}</span>
                      <p className="mt-2 text-xs leading-5 text-white/38">{item.totalPostedChannels}/{item.totalRequiredChannels} kanal aktif</p>
                      {item.notes ? <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/42">{item.notes}</p> : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-5 py-8 text-sm leading-6 text-white/52">Tidak ada data publikasi yang sesuai filter.</div>
            )}
          </div>
        ) : null}
      </section>


      <section className="mt-20 border-t border-white/[0.07] pt-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#D4AF37]/90">Kesiapan Konten</p>
            <h2 className="font-display mt-4 text-4xl font-normal leading-[1.08] tracking-[-0.035em] md:text-5xl">Kesehatan Konten</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-white/48">Ringkasan kesiapan konten berdasarkan gambar cover, galeri, narasi studi kasus, tag area, dan dukungan Wawasan.</p>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          {[
            ['Proyek tanpa gambar cover', contentHealth.missingCover],
            ['Proyek dengan galeri kurang lengkap', contentHealth.galleryIncomplete],
            ['Proyek dengan narasi studi kasus belum lengkap', contentHealth.missingNarrative],
            ['Proyek tanpa tag area', contentHealth.missingAreaTags],
            ['Proyek tanpa Wawasan terkait', contentHealth.missingWawasan],
          ].map(([label, count]) => (
            <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.018] p-5">
              <p className="font-display text-4xl leading-none text-white/90">{count}</p>
              <p className="mt-4 text-sm leading-6 text-white/45">{label}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-white/8 bg-white/[0.016]">
          <div className="border-b border-white/[0.07] px-6 py-5">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#D4AF37]/85">Perlu Dilengkapi</p>
          </div>
          {attentionPreview.length > 0 ? (
            <div className="divide-y divide-white/[0.07]">
              {attentionPreview.map(({ project, reasons }) => (
                <div key={project.id} className="grid gap-4 px-6 py-5 transition duration-300 hover:bg-[#D4AF37]/[0.045] md:grid-cols-[1fr_1.4fr_auto] md:items-center">
                  <div>
                    <p className="text-base font-semibold leading-6 text-white/90">{project.title}</p>
                    <p className="mt-1 text-sm text-white/36">/{project.slug}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {reasons.map((reason) => (
                      <span key={reason.metric} className="rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-xs text-white/58">{reason.label}</span>
                    ))}
                  </div>
                  <Link href={getAdminProjectEditHref(project.id, '/admin/dashboard')} className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#D4AF37]/35 px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-[#D4AF37] transition duration-300 hover:bg-[#D4AF37]/10">
                    Edit Cepat
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-8 text-sm leading-6 text-white/52">Semua proyek utama sudah terlihat siap dipromosikan.</div>
          )}
        </div>
      </section>

      <section className="mt-20 border-t border-white/[0.07] pt-14">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#D4AF37]/90">Proyek</p>
            <h2 className="font-display mt-4 text-4xl font-normal leading-[1.08] tracking-[-0.035em] md:text-5xl">Daftar Proyek</h2>
          </div>
          <Link href={getAdminProjectCreateHref('/admin/dashboard')} className="inline-flex min-h-11 items-center justify-center rounded-[4px] bg-[#D4AF37] px-6 py-3.5 text-center text-sm font-semibold uppercase tracking-[0.12em] text-[#080807] shadow-[0_18px_40px_rgba(212,175,55,0.14)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#E2C866]">
            Tambah Proyek
          </Link>
        </div>

        {message ? <p className="mt-8 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm leading-6 text-red-200">{message}</p> : null}

        {projects.length === 0 ? (
          <div className="mt-10 flex min-h-[280px] items-center justify-center rounded-2xl border border-white/8 bg-white/[0.018] p-8 text-center md:p-12">
            <div className="max-w-xl">
              <p className="font-display text-4xl font-normal leading-[1.08] tracking-[-0.035em] text-white/90 md:text-5xl">Belum ada proyek</p>
              <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-white/52 md:text-lg">
                Mulai tambahkan proyek pertama Anda untuk membangun portfolio berbasis keputusan yang terstruktur.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-10 space-y-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="wawasan-filter" className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-white/50">
                Filter Status Wawasan
              </label>
              <select
                id="wawasan-filter"
                value={wawasanFilter}
                onChange={(event) => setWawasanFilter(event.target.value as 'all' | 'with_wawasan' | 'without_wawasan')}
                className="w-full max-w-xs rounded-lg border border-white/12 bg-[#121212] px-4 py-2.5 text-sm text-white/80 outline-none transition focus:border-[#D4AF37]/60 focus:ring-2 focus:ring-[#D4AF37]/20"
              >
                <option value="all">Semua Project</option>
                <option value="with_wawasan">Sudah Jadi Wawasan</option>
                <option value="without_wawasan">Belum Jadi Wawasan</option>
              </select>
            </div>

            <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.016]">
            <div className="hidden grid-cols-[1.2fr_1fr_0.55fr_0.65fr_0.6fr] border-b border-white/[0.07] px-6 py-4 font-mono text-[9px] font-black uppercase tracking-[0.24em] text-white/34 md:grid">
              <span>Title</span>
              <span>Taxonomy</span>
              <span>Status</span>
              <span>Created At</span>
              <span className="text-right">Actions</span>
            </div>

            <div className="divide-y divide-white/[0.07]">
              {filteredProjects.map((project) => (
                <div key={project.id} className="grid gap-4 px-6 py-5 transition duration-300 hover:bg-[#D4AF37]/[0.045] hover:shadow-[inset_2px_0_0_rgba(212,175,55,0.45)] md:grid-cols-[1.2fr_1fr_0.55fr_0.65fr_0.6fr] md:items-center">
                  <div>
                    <p className="text-base font-semibold leading-6 text-white/90">{project.title}</p>
                    <p className="mt-1 text-sm text-white/36">/{project.slug}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/55">{project.category || 'Uncategorized'}</p>
                    <p className="text-xs text-white/46">{project.design_category || '—'} · {project.design_style || '—'}</p>
                    <p className="text-xs text-white/38">{project.area_type || ((project.area_tags || []).slice(0, 2).join(', ') || '—')}</p>
                  </div>
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.14em]">
                    {project.hasWawasan ? (
                      project.relatedInsightSlug ? (
                        <Link href={`/wawasan/${project.relatedInsightSlug}`} target="_blank" rel="noreferrer" className="text-emerald-300 hover:underline">
                          Sudah Jadi Wawasan
                        </Link>
                      ) : (
                        <span className="text-emerald-300">Sudah Jadi Wawasan</span>
                      )
                    ) : (
                      <span className="text-white/45">Belum Jadi Wawasan</span>
                    )}
                  </p>
                  <p className="text-sm text-white/48">{formatDate(project.created_at)}</p>
                  <div className="flex flex-wrap items-center gap-3 md:justify-end">
                    <Link href={getAdminProjectEditHref(project.id, '/admin/dashboard')} className="min-h-11 rounded-full border border-white/10 px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white/68 transition duration-300 hover:border-[#D4AF37]/40 hover:text-[#D4AF37]">
                      Edit
                    </Link>
                    <button type="button" disabled={deletingId === project.id} onClick={() => deleteProject(project)} className="min-h-11 rounded-full border border-red-400/20 px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-red-200/80 transition duration-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50">
                      {deletingId === project.id ? 'Deleting' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {projects.length > 0 && filteredProjects.length === 0 ? (
              <div className="px-6 py-8 text-sm text-white/52">Tidak ada proyek yang sesuai filter Wawasan.</div>
            ) : null}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
