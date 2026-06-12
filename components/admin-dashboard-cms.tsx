'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import type { Project } from '@/lib/types';
import { useToast } from '@/components/toast-provider';
import { getAdminProjectCreateHref, getAdminProjectEditHref } from '@/lib/admin-project-return-path';

const projectColumns = 'id,title,slug,category,design_category,design_style,area_type,area_tags,is_published,cover_image,problem,solution,impact,created_at';

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

function formatDateTime(value?: string | null) {
  if (!value) return '—';
  try {
    return new Intl.DateTimeFormat('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return '—';
  }
}

export default function AdminDashboardCMS() {
  const [projects, setProjects] = useState<DashboardProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [wawasanFilter, setWawasanFilter] = useState<'all' | 'with_wawasan' | 'without_wawasan'>('all');
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

  useEffect(() => {
    loadProjects();
  }, []);

  const lastUpdatedProject = useMemo(() => {
    if (projects.length === 0) return null;
    return [...projects].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (wawasanFilter === 'with_wawasan') return projects.filter((project) => project.hasWawasan);
    if (wawasanFilter === 'without_wawasan') return projects.filter((project) => !project.hasWawasan);
    return projects;
  }, [projects, wawasanFilter]);

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
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#D4AF37]/90">Overview</p>
            <h2 className="font-display mt-4 text-4xl font-normal leading-[1.08] tracking-[-0.035em] md:text-5xl">Project Overview</h2>
          </div>
          <div className="hidden h-px flex-1 bg-white/[0.07] md:block" />
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/8 bg-white/[0.022] p-7 transition duration-300 hover:border-[#D4AF37]/22 hover:bg-white/[0.032] hover:shadow-[0_18px_44px_rgba(212,175,55,0.035)]">
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.26em] text-white/42">Total Projects</p>
            <p className="mt-6 font-display text-6xl leading-none text-white/90 md:text-7xl">{projects.length}</p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.022] p-7 transition duration-300 hover:border-[#D4AF37]/22 hover:bg-white/[0.032] hover:shadow-[0_18px_44px_rgba(212,175,55,0.035)]">
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.26em] text-white/42">Published Projects</p>
            <p className="mt-6 font-display text-6xl leading-none text-white/90 md:text-7xl">{projects.filter((project) => project.is_published !== false).length}</p>
            <p className="mt-4 text-sm leading-6 text-white/38">Project yang terhitung hanya yang berstatus published.</p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.022] p-7 transition duration-300 hover:border-[#D4AF37]/22 hover:bg-white/[0.032] hover:shadow-[0_18px_44px_rgba(212,175,55,0.035)]">
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.26em] text-white/42">Last Updated Project</p>
            {lastUpdatedProject ? (
              <>
                <p className="mt-6 text-lg font-semibold leading-6 text-white/88">{lastUpdatedProject.title}</p>
                <p className="mt-3 text-sm text-white/38">{formatDateTime(lastUpdatedProject.created_at)}</p>
              </>
            ) : (
              <p className="mt-6 text-base leading-7 text-white/38">Belum ada data project.</p>
            )}
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.022] p-7 transition duration-300 hover:border-[#D4AF37]/22 hover:bg-white/[0.032] hover:shadow-[0_18px_44px_rgba(212,175,55,0.035)]">
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.26em] text-white/42">Projects With Wawasan</p>
            <p className="mt-6 font-display text-6xl leading-none text-white/90 md:text-7xl">{projects.filter((project) => project.hasWawasan).length}</p>
            <p className="mt-4 text-sm leading-6 text-white/38">Project yang sudah diangkat menjadi Wawasan.</p>
          </div>
        </div>
      </section>

      <section className="mt-20 border-t border-white/[0.07] pt-14">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#D4AF37]/90">Projects</p>
            <h2 className="font-display mt-4 text-4xl font-normal leading-[1.08] tracking-[-0.035em] md:text-5xl">Daftar Project</h2>
          </div>
          <Link href={getAdminProjectCreateHref('/admin/dashboard')} className="inline-flex min-h-11 items-center justify-center rounded-[4px] bg-[#D4AF37] px-6 py-3.5 text-center text-sm font-semibold uppercase tracking-[0.12em] text-[#080807] shadow-[0_18px_40px_rgba(212,175,55,0.14)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#E2C866]">
            Tambah Project
          </Link>
        </div>

        {message ? <p className="mt-8 rounded-2xl border border-red-400/20 bg-red-500/10 p-4 text-sm leading-6 text-red-200">{message}</p> : null}

        {projects.length === 0 ? (
          <div className="mt-10 flex min-h-[280px] items-center justify-center rounded-2xl border border-white/8 bg-white/[0.018] p-8 text-center md:p-12">
            <div className="max-w-xl">
              <p className="font-display text-4xl font-normal leading-[1.08] tracking-[-0.035em] text-white/90 md:text-5xl">Belum ada project</p>
              <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-white/52 md:text-lg">
                Mulai tambahkan project pertama Anda untuk membangun portfolio berbasis keputusan yang terstruktur.
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
              <div className="px-6 py-8 text-sm text-white/52">Tidak ada project yang sesuai filter Wawasan.</div>
            ) : null}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
