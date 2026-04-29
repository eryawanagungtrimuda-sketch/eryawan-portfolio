'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import type { Project } from '@/lib/types';

export default function AdminProjectsList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadProjects() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProjects((data || []) as Project[]);
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

  return (
    <div className="space-y-4">
      {projects.length === 0 ? (
        <div className="rounded-sm border border-white/10 bg-white/[0.025] p-8">
          <p className="text-white/60">Belum ada project. Tambahkan project pertama.</p>
        </div>
      ) : null}

      {projects.map((project) => (
        <Link
          key={project.id}
          href={`/admin/projects/${project.id}/edit`}
          className="grid gap-4 rounded-sm border border-white/10 bg-white/[0.025] p-5 transition hover:border-[#D4AF37]/35 md:grid-cols-[1fr_auto] md:items-center"
        >
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-semibold text-white/90">{project.title}</h2>
              <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/45">
                {project.status}
              </span>
              {project.featured ? (
                <span className="rounded-full border border-[#D4AF37]/30 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#D4AF37]">Featured</span>
              ) : null}
            </div>
            <p className="mt-2 text-sm text-white/45">/{project.slug}</p>
          </div>
          <span className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[#D4AF37]">Edit</span>
        </Link>
      ))}
    </div>
  );
}
