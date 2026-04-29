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
      setMessage(error instanceof Error ? error.message : 'Gagal memuat data project.');
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
      <section className="py-14">
        <div className="rounded-sm border border-white/10 bg-white/[0.025] p-8">
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-white/45">Memuat data project...</p>
        </div>
      </section>
    );
  }

  return (
    <div className="py-12">
      <section>
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#D4AF37]">Overview</p>
            <h2 className="font-display mt-3 text-4xl font-normal leading-[1.08] tracking-[-0.035em] md:text-5xl">Project Overview</h2>
          </div>
          <div className="hidden h-px flex-1 bg-white/10 md:block" />
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-sm border border-white/10 bg-white/[0.025] p-6 transition duration-300 hover:border-[#D4AF37]/25">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-white/38">Total Projects</p>
            <p className="mt-5 font-display text-5xl leading-none text-white/92">{projects.length}</p>
          </div>

          <div className="rounded-sm border border-white/10 bg-white/[0.025] p-6 transition duration-300 hover:border-[#D4AF37]/25">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-white/38">Published Projects</p>
            <p className="mt-5 font-display text-5xl leading-none text-white/92">{projects.length}</p>
            <p className="mt-3 text-sm leading-6 text-white/45">Status belum digunakan; semua project tampil sebagai public.</p>
          </div>

          <div className="rounded-sm border border-white/10 bg-white/[0.025] p-6 transition duration-300 hover:border-[#D4AF37]/25">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-white/38">Last Updated Project</p>
            {lastUpdatedProject ? (
              <>
                <p className="mt-5 text-lg font-semibold leading-6 text-white/90">{lastUpdatedProject.title}</p>
                <p className="mt-2 text-sm text-white/45">{formatDateTime(lastUpdatedProject.created_at)}</p>
              </>
            ) : (
              <p className="mt-5 text-base leading-7 text-white/48">Belum ada data project.</p>
            )}
          </div>
        </div>
      </section>

      <section className="mt-14 border-t border-white/10 pt-12">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#D4AF37]">Projects</p>
            <h2 className="font-display mt-3 text-4xl font-normal leading-[1.08] tracking-[-0.035em] md:text-5xl">Daftar Project</h2>
          </div>
          <Link href="/admin/projects/new" className="inline-flex items-center justify-center rounded-[4px] bg-[#D4AF37] px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#080807] shadow-[0_18px_40px_rgba(212,175,55,0.14)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#E2C866]">
            Tambah Project
          </Link>
        </div>

        {message ? <p className="mt-6 rounded-sm border border-red-400/20 bg-red-500/10 p-4 text-sm leading-6 text-red-200">{message}</p> : null}

        {projects.length === 0 ? (
          <div className="mt-8 rounded-sm border border-white/10 bg-white/[0.025] p-8 md:p-10">
            <p className="max-w-2xl text-xl leading-8 text-white/76">
              Belum ada project.<br />
              Mulai tambahkan project pertama Anda untuk membangun portfolio berbasis keputusan.
            </p>
            <Link href="/admin/projects/new" className="mt-8 inline-flex items-center justify-center rounded-[4px] bg-[#D4AF37] px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#080807] transition duration-300 hover:-translate-y-0.5 hover:bg-[#E2C866]">
              Tambah Project
            </Link>
          </div>
        ) : (
          <div className="mt-8 overflow-hidden rounded-sm border border-white/10 bg-white/[0.018]">
            <div className="hidden grid-cols-[1.25fr_0.75fr_0.65fr_0.6fr] border-b border-white/10 px-5 py-4 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-white/38 md:grid">
              <span>Title</span>
              <span>Category</span>
              <span>Created At</span>
              <span className="text-right">Actions</span>
            </div>

            <div className="divide-y divide-white/10">
              {projects.map((project) => (
                <div key={project.id} className="grid gap-4 px-5 py-5 transition duration-300 hover:bg-[#D4AF37]/[0.045] md:grid-cols-[1.25fr_0.75fr_0.65fr_0.6fr] md:items-center">
                  <div>
                    <p className="text-base font-semibold leading-6 text-white/92">{project.title}</p>
                    <p className="mt-1 text-sm text-white/38">/{project.slug}</p>
                  </div>
                  <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-white/50">{project.category || 'Uncategorized'}</p>
                  <p className="text-sm text-white/50">{formatDate(project.created_at)}</p>
                  <div className="flex items-center gap-3 md:justify-end">
                    <Link href={`/admin/projects/${project.id}/edit`} className="rounded-sm border border-white/10 px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white/70 transition duration-300 hover:border-[#D4AF37]/40 hover:text-[#D4AF37]">
                      Edit
                    </Link>
                    <button type="button" disabled={deletingId === project.id} onClick={() => deleteProject(project)} className="rounded-sm border border-red-400/20 px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-red-200 transition duration-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50">
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
