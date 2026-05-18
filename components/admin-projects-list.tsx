'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
type AdminProjectListItem = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  hasWawasan: boolean;
  relatedInsightId: string | null;
};

type InsightFilter = 'all' | 'without_wawasan' | 'with_wawasan';

export default function AdminProjectsList() {
  const [projects, setProjects] = useState<AdminProjectListItem[]>([]);
  const [insightFilter, setInsightFilter] = useState<InsightFilter>('all');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadProjects() {
      try {
        const supabase = getSupabaseClient();
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

    loadProjects();
  }, []);

  if (loading) return <p className="py-10 text-white/50">Memuat projects...</p>;
  if (message) return <p className="py-10 text-red-300">{message}</p>;

  const filteredProjects = projects.filter((project) => {
    if (insightFilter === 'without_wawasan') return !project.hasWawasan;
    if (insightFilter === 'with_wawasan') return project.hasWawasan;
    return true;
  });

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
        <Link
          key={project.id}
          href={`/admin/projects/${project.id}/edit`}
          className="grid gap-4 rounded-sm border border-white/10 bg-white/[0.025] p-5 transition hover:border-[#D4AF37]/35 md:grid-cols-[1fr_auto] md:items-center"
        >
          <div>
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
          </div>
          <span className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[#D4AF37]">Edit</span>
        </Link>
      ))}
    </div>
  );
}
