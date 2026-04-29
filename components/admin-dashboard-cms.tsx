'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import type { Project } from '@/lib/types';

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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function loadProjects() {
    setLoading(true);
    setMessage('');

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('projects')
        .select('id,title,slug,category,cover_image,problem,solution,impact,created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects((data || []) as Project[]);
    } catch (error) {
      const description = error instanceof Error ? error.message : '';
      const isEmptyLikeFailure = description.toLowerCase().includes('no rows') || description.toLowerCase().includes('0 rows');
      setMessage(isEmptyLikeFailure ? '' : description || 'Tidak dapat terhubung ke Supabase. Periksa koneksi atau environment variables.');
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

  async function deleteProject(project: Project) {
    const confirmed = window.confirm(`Hapus project "${project.title}"?`);
    if (!confirmed) return;

    setDeletingId(project.id);
    setMessage('');

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('projects').delete().eq('id', project.id);
      if (error) throw error;
      setProjects((current) => current.filter((item) => item.id !== project.id));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal menghapus project.');
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <section className="py-16">
        <div className="rounded-sm border border-white/8 bg-white/[0.02] p-10">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-white/42">Memuat data project...</p>
        </div>
      </section>
    );
  }

  return (
    <div className="py-14">
      <section>
        <div className="flex items-end justify-between gap-8">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#D4AF37]/90">Overview</p>
            <h2 className="font-display mt-4 text-4xl font-normal leading-[1.08] tracking-[-0.035em] md:text-5xl">Project Overview</h2>
          </div>
          <div className="hidden h-px flex-1 bg-white/[0.07] md:block" />
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          <div className="rounded-sm border border-white/8 bg-white/[0.022] p-7 transition duration-300 hover:border-[#D4AF37]/22 hover:bg-white/[0.032] hover:shadow-[0_18px_44px_rgba(212,175,55,0.035)]">
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.26em] text-white/42">Total Projects</p>
            <p className="mt-6 font-display text-6xl leading-none text-white/90 md:text-7xl">{projects.length}</p>
          </div>

          <div className="rounded-sm border border-white/8 bg-white/[0.022] p-7 transition duration-300 hover:border-[#D4AF37]/22 hover:bg-white/[0.032] hover:shadow-[0_18px_44px_rgba(212,175,55,0.035)]">
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.26em] text-white/42">Published Projects</p>
            <p className="mt-6 font-display text-6xl leading-none text-white/90 md:text-7xl">{projects.length}</p>
            <p className="mt-4 text-sm leading-6 text-white/38">Semua project saat ini bersifat public.</p>
          </div>

          <div className="rounded-sm border border-white/8 bg-white/[0.022] p-7 transition duration-300 hover:border-[#D4AF37]/22 hover:bg-white/[0.032] hover:shadow-[0_18px_44px_rgba(212,175,55,0.035)]">
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
        </div>
      </section>

      <section className="mt-20 border-t border-white/[0.07] pt-14">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#D4AF37]/90">Projects</p>
            <h2 className="font-display mt-4 text-4xl font-normal leading-[1.08] tracking-[-0.035em] md:text-5xl">Daftar Project</h2>
          </div>
          <Link href="/admin/projects/new" className="inline-flex items-center justify-center rounded-[4px] bg-[#D4AF37] px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#080807] shadow-[0_18px_40px_rgba(212,175,55,0.14)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#E2C866]">
            Tambah Project
          </Link>
        </div>

        {message ? <p className="mt-8 rounded-sm border border-red-400/20 bg-red-500/10 p-4 text-sm leading-6 text-red-200">{message}</p> : null}

        {projects.length === 0 ? (
          <div className="mt-10 flex min-h-[280px] items-center justify-center rounded-sm border border-white/8 bg-white/[0.018] p-8 text-center md:p-12">
            <div className="max-w-xl">
              <p className="font-display text-4xl font-normal leading-[1.08] tracking-[-0.035em] text-white/90 md:text-5xl">Belum ada project</p>
              <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-white/52 md:text-lg">
                Mulai tambahkan project pertama Anda untuk membangun portfolio berbasis keputusan yang terstruktur.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-10 overflow-hidden rounded-sm border border-white/8 bg-white/[0.016]">
            <div className="hidden grid-cols-[1.25fr_0.75fr_0.65fr_0.6fr] border-b border-white/[0.07] px-6 py-4 font-mono text-[9px] font-black uppercase tracking-[0.24em] text-white/34 md:grid">
              <span>Title</span>
              <span>Category</span>
              <span>Created At</span>
              <span className="text-right">Actions</span>
            </div>

            <div className="divide-y divide-white/[0.07]">
              {projects.map((project) => (
                <div key={project.id} className="grid gap-4 px-6 py-5 transition duration-300 hover:bg-[#D4AF37]/[0.045] hover:shadow-[inset_2px_0_0_rgba(212,175,55,0.45)] md:grid-cols-[1.25fr_0.75fr_0.65fr_0.6fr] md:items-center">
                  <div>
                    <p className="text-base font-semibold leading-6 text-white/90">{project.title}</p>
                    <p className="mt-1 text-sm text-white/36">/{project.slug}</p>
                  </div>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-white/48">{project.category || 'Uncategorized'}</p>
                  <p className="text-sm text-white/48">{formatDate(project.created_at)}</p>
                  <div className="flex items-center gap-3 md:justify-end">
                    <Link href={`/admin/projects/${project.id}/edit`} className="rounded-sm border border-white/10 px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white/68 transition duration-300 hover:border-[#D4AF37]/40 hover:text-[#D4AF37]">
                      Edit
                    </Link>
                    <button type="button" disabled={deletingId === project.id} onClick={() => deleteProject(project)} className="rounded-sm border border-red-400/20 px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-red-200/80 transition duration-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50">
                      {deletingId === project.id ? 'Deleting' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
