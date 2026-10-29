'use client';

import Link from 'next/link';
import { Download } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { getAdminProjectEditHref } from '@/lib/admin-project-return-path';
import { triggerBrowserDownload } from '@/components/social-composer/actions';

type AdminProjectListItem = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  hasWawasan: boolean;
  relatedInsightId: string | null;
};

type InsightFilter = 'all' | 'without_wawasan' | 'with_wawasan';
type DownloadFeedback = { projectId: string; tone: 'success' | 'error'; message: string };

export default function AdminProjectsList() {
  const [projects, setProjects] = useState<AdminProjectListItem[]>([]);
  const [insightFilter, setInsightFilter] = useState<InsightFilter>('all');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [downloadingProjectId, setDownloadingProjectId] = useState<string | null>(null);
  const [downloadFeedback, setDownloadFeedback] = useState<DownloadFeedback | null>(null);

  async function downloadProjectImages(project: AdminProjectListItem) {
    if (downloadingProjectId) return;

    setDownloadingProjectId(project.id);
    setDownloadFeedback(null);

    try {
      const { data, error: sessionError } = await getSupabaseClient().auth.getSession();
      const token = data.session?.access_token;

      if (sessionError || !token) {
        throw sessionError || new Error('Sesi admin tidak ditemukan. Silakan login ulang.');
      }

      const response = await fetch(
        '/api/download-project-images?projectId=' + encodeURIComponent(project.id),
        {
          method: 'GET',
          headers: { Authorization: 'Bearer ' + token },
          cache: 'no-store',
        },
      );

      if (!response.ok) {
        const result = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(result.error || 'Gagal mengunduh gambar proyek.');
      }

      const blob = await response.blob();
      if (!blob.size) throw new Error('File ZIP kosong.');

      const disposition = response.headers.get('Content-Disposition') || '';
      const matched = disposition.match(/filename="?([^";]+)"?/i);
      triggerBrowserDownload(blob, matched?.[1] || (project.slug + '-images.zip'));

      setDownloadFeedback({
        projectId: project.id,
        tone: 'success',
        message: 'ZIP gambar berhasil disiapkan. Periksa folder Downloads.',
      });
    } catch (error) {
      setDownloadFeedback({
        projectId: project.id,
        tone: 'error',
        message: error instanceof Error ? error.message : 'Gagal mengunduh gambar proyek. Coba lagi.',
      });
    } finally {
      setDownloadingProjectId(null);
    }
  }

  useEffect(() => {
    const supabase = getSupabaseClient();

    async function loadProjects() {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id,title,slug,category,cover_image,problem,solution,impact,created_at,insights(id)')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const mappedProjects = (data || []).map((project) => {
          const linkedInsights = Array.isArray(project.insights) ? project.insights : [];

          return {
            id: project.id,
            title: project.title,
            slug: project.slug,
            category: project.category,
            hasWawasan: linkedInsights.length > 0,
            relatedInsightId: linkedInsights[0]?.id || null,
          };
        });

        setProjects(mappedProjects as AdminProjectListItem[]);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Gagal memuat projects.');
      } finally {
        setLoading(false);
      }
    }

    const realtimeChannel = supabase
      .channel('admin-projects-wawasan-status')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, loadProjects)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'insights' }, loadProjects)
      .subscribe();

    loadProjects();

    return () => {
      void supabase.removeChannel(realtimeChannel);
    };
  }, []);

  const filteredProjects = useMemo(
    () =>
      projects.filter((project) => {
        if (insightFilter === 'without_wawasan') return !project.hasWawasan;
        if (insightFilter === 'with_wawasan') return project.hasWawasan;
        return true;
      }),
    [projects, insightFilter],
  );

  if (loading) return <p className="py-10 text-white/50">Memuat projects...</p>;
  if (message) return <p className="py-10 text-red-300">{message}</p>;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-white/10 bg-white/[0.02] p-3">
        <p className="text-xs uppercase tracking-[0.16em] text-white/45">Filter Wawasan</p>
        <select
          value={insightFilter}
          onChange={(event) => setInsightFilter(event.target.value as InsightFilter)}
          className="rounded-sm border border-white/15 bg-[#14100A] px-3 py-2 text-xs uppercase tracking-[0.14em] text-white/80 outline-none transition focus:border-[#D4AF37]/50"
        >
          <option value="all">Semua</option>
          <option value="with_wawasan">Sudah Jadi Wawasan</option>
          <option value="without_wawasan">Belum Jadi Wawasan</option>
        </select>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-sm border border-white/10 bg-white/[0.025] p-8">
          <p className="text-white/60">Belum ada project. Tambahkan project pertama.</p>
        </div>
      ) : null}

      {projects.length > 0 && filteredProjects.length === 0 ? (
        <div className="rounded-sm border border-white/10 bg-white/[0.025] p-8">
          <p className="text-white/60">Tidak ada project yang sesuai filter.</p>
        </div>
      ) : null}

      {filteredProjects.map((project) => (
        <div
          key={project.id}
          className="grid gap-4 rounded-sm border border-white/10 bg-white/[0.025] p-5 transition hover:border-[#D4AF37]/35 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
        >
          <Link
            href={getAdminProjectEditHref(project.id, '/admin/projects')}
            aria-label={'Edit project ' + project.title}
            className="block min-w-0 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/70"
          >
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold text-white/90">{project.title}</h2>
              {project.category ? (
                <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
                  {project.category}
                </span>
              ) : null}
              {project.hasWawasan ? (
                <span className="rounded-full border border-emerald-400/40 bg-emerald-500/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-200">
                  Sudah Jadi Wawasan
                </span>
              ) : (
                <span className="rounded-full border border-white/20 bg-white/5 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/65">
                  Belum Jadi Wawasan
                </span>
              )}
            </div>
            <p className="mt-2 text-sm text-white/45">/{project.slug}</p>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void downloadProjectImages(project)}
              disabled={downloadingProjectId !== null}
              aria-busy={downloadingProjectId === project.id}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/[0.06] px-4 py-2 text-center font-sans text-xs font-semibold text-[#E6C676] transition hover:bg-[#D4AF37]/[0.14] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download size={15} aria-hidden="true" />
              {downloadingProjectId === project.id ? 'Menyiapkan ZIP...' : 'Download Semua Gambar'}
            </button>
            <Link
              href={getAdminProjectEditHref(project.id, '/admin/projects')}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 px-4 py-2 font-mono text-xs font-black uppercase tracking-[0.18em] text-[#D4AF37] transition hover:border-[#D4AF37]/40"
            >
              Edit
            </Link>
          </div>

          {downloadFeedback?.projectId === project.id ? (
            <p
              role="status"
              className={downloadFeedback.tone === 'success' ? 'text-xs text-emerald-200 md:col-span-2' : 'text-xs text-red-300 md:col-span-2'}
            >
              {downloadFeedback.message}
            </p>
          ) : null}
        </div>
      ))}
    </div>
  );
}
