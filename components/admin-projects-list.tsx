'use client';

import Link from 'next/link';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import type { Project } from '@/lib/types';

type InsightRelation = {
  id: string;
  source_project_id: string | null;
};

type ProjectWithInsight = Project & {
  insightId: string | null;
};

type InsightStatusFilter = 'all' | 'done' | 'todo';

export default function AdminProjectsList() {
  const [projects, setProjects] = useState<ProjectWithInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<InsightStatusFilter>('all');

  useEffect(() => {
    async function loadProjects() {
      try {
        const supabase = getSupabaseClient();
        const [projectResult, insightResult] = await Promise.all([
          supabase
            .from('projects')
            .select('id,title,slug,category,cover_image,problem,solution,impact,created_at')
            .order('created_at', { ascending: false }),
          supabase.from('insights').select('id,source_project_id').not('source_project_id', 'is', null),
        ]);

        if (projectResult.error) throw projectResult.error;
        if (insightResult.error) throw insightResult.error;

        const insightByProjectId = new Map<string, string>();
        (insightResult.data as InsightRelation[] | null)?.forEach((row) => {
          if (row.source_project_id && !insightByProjectId.has(row.source_project_id)) {
            insightByProjectId.set(row.source_project_id, row.id);
          }
        });

        const projectRows = ((projectResult.data || []) as Project[]).map((project) => ({
          ...project,
          insightId: insightByProjectId.get(project.id) || null,
        }));

        setProjects(projectRows);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Gagal memuat projects.');
      } finally {
        setLoading(false);
      }
    }

    loadProjects();
  }, []);

  const totalProjects = projects.length;
  const doneCount = useMemo(() => projects.filter((project) => Boolean(project.insightId)).length, [projects]);
  const todoCount = totalProjects - doneCount;

  const filteredProjects = useMemo(() => {
    if (statusFilter === 'done') return projects.filter((project) => Boolean(project.insightId));
    if (statusFilter === 'todo') return projects.filter((project) => !project.insightId);
    return projects;
  }, [projects, statusFilter]);

  if (loading) return <p className="py-10 text-white/50">Memuat projects...</p>;
  if (message) return <p className="py-10 text-red-300">{message}</p>;

  return (
    <div className="space-y-5">
      <div className="grid gap-3 rounded-sm border border-white/10 bg-white/[0.02] p-4 sm:grid-cols-3">
        <SummaryCard label="Total Proyek" value={totalProjects} />
        <SummaryCard label="Sudah Jadi Wawasan" value={doneCount} />
        <SummaryCard label="Belum Jadi Wawasan" value={todoCount} />
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterButton active={statusFilter === 'all'} onClick={() => setStatusFilter('all')}>Semua</FilterButton>
        <FilterButton active={statusFilter === 'done'} onClick={() => setStatusFilter('done')}>Sudah Jadi Wawasan</FilterButton>
        <FilterButton active={statusFilter === 'todo'} onClick={() => setStatusFilter('todo')}>Belum Jadi Wawasan</FilterButton>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="rounded-sm border border-white/10 bg-white/[0.025] p-8">
          <p className="text-white/60">Tidak ada project pada filter ini.</p>
        </div>
      ) : null}

      {filteredProjects.map((project) => {
        const hasInsight = Boolean(project.insightId);
        return (
          <div key={project.id} className="grid gap-4 rounded-sm border border-white/10 bg-white/[0.025] p-5 transition hover:border-[#D4AF37]/35 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-semibold text-white/90">{project.title}</h2>
                {project.category ? (
                  <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
                    {project.category}
                  </span>
                ) : null}
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${hasInsight ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-200'}`}>
                  {hasInsight ? 'Sudah Jadi Wawasan' : 'Belum Jadi Wawasan'}
                </span>
              </div>
              <p className="mt-2 text-sm text-white/45">/{project.slug}</p>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:justify-end">
              <Link href={`/admin/projects/${project.id}/edit`} className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-white/70 transition hover:border-white/35">
                Edit Proyek
              </Link>
              {hasInsight && project.insightId ? (
                <>
                  <Link href={`/admin/insights/${project.insightId}/edit`} className="rounded-full border border-[#D4AF37]/40 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#D4AF37] transition hover:border-[#D4AF37]/70">
                    Lihat Wawasan
                  </Link>
                  <Link href={`/admin/insights/${project.insightId}/edit`} className="rounded-full bg-[#D4AF37] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#080807] transition hover:bg-[#E2C866]">
                    Edit Wawasan
                  </Link>
                </>
              ) : (
                <Link href={`/admin/insights/new?projectId=${project.id}`} className="rounded-full bg-[#D4AF37] px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#080807] transition hover:bg-[#E2C866]">
                  Buat Wawasan
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-sm border border-white/10 bg-white/[0.025] p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-white/50">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white/90">{value}</p>
    </div>
  );
}

function FilterButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition ${active ? 'bg-[#D4AF37] text-[#080807]' : 'border border-white/15 text-white/70 hover:border-white/35'}`}
    >
      {children}
    </button>
  );
}
