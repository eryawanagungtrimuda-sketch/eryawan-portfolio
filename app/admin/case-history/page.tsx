'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AdminAuthGuard from '@/components/admin-auth-guard';
import { getSupabaseClient } from '@/lib/supabaseClient';

type CaseHistoryProject = {
  id: string;
  title: string | null;
  slug: string | null;
  category: string | null;
  design_category: string | null;
  design_style: string | null;
  area_type: string | null;
  client_problem_raw: string | null;
  design_reference: string | null;
  area_scope: string | null;
  project_size: string | null;
  konteks: string | null;
  konflik: string | null;
  keputusan_desain: string | null;
  pendekatan: string | null;
  dampak: string | null;
  insight_kunci: string | null;
  created_at: string | null;
};

function FieldValue({ value }: { value: string | null }) {
  if (!value) {
    return <p className="text-sm text-white/35">Belum diisi.</p>;
  }

  return <p className="text-sm leading-6 text-white/75">{value}</p>;
}

export default function AdminCaseHistoryPage() {
  const [projects, setProjects] = useState<CaseHistoryProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadCaseHistory() {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('projects')
          .select(
            'id,title,slug,category,design_category,design_style,area_type,client_problem_raw,design_reference,area_scope,project_size,konteks,konflik,keputusan_desain,pendekatan,dampak,insight_kunci,created_at',
          )
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProjects((data || []) as CaseHistoryProject[]);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Gagal memuat case history.');
      } finally {
        setLoading(false);
      }
    }

    loadCaseHistory();
  }, []);

  return (
    <AdminAuthGuard>
      <main id="admin-shell" className="min-h-screen bg-[#080807] px-5 py-10 font-sans text-[#F4F1EA] md:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="border-b border-white/10 pb-8">
            <Link href="/admin/dashboard" className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white/35 transition hover:text-[#D4AF37]">
              Kembali ke Dashboard
            </Link>
            <h1 className="font-display mt-4 text-5xl font-normal leading-[1.05] tracking-[-0.04em]">Case History</h1>
            <p className="mt-4 max-w-4xl text-base leading-7 text-white/55">
              Arsip brief internal, riwayat masalah klien, keputusan desain, dan insight project. Data ini hanya untuk admin dan tidak tampil di halaman publik.
            </p>
          </div>

          <section className="space-y-4 py-10">
            {loading ? <p className="text-white/50">Memuat case history...</p> : null}
            {message ? <p className="text-red-300">{message}</p> : null}

            {!loading && !message && projects.length === 0 ? (
              <div className="rounded-sm border border-white/10 bg-white/[0.025] p-8">
                <p className="text-white/60">Belum ada data case history.</p>
              </div>
            ) : null}

            {!loading && !message
              ? projects.map((project) => (
                  <article key={project.id} className="rounded-sm border border-white/10 bg-white/[0.025] p-6">
                    <div className="flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-start md:justify-between">
                      <div>
                        <h2 className="text-2xl font-semibold text-white/90">{project.title || 'Tanpa Judul'}</h2>
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/40">/{project.slug || '-'}</p>
                      </div>
                      <Link href={`/admin/projects/${project.id}/edit`} className="inline-flex rounded-sm border border-[#D4AF37]/40 px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-[#D4AF37] transition hover:border-[#D4AF37] hover:bg-[#D4AF37]/10">
                        Edit Project
                      </Link>
                    </div>

                    <div className="mt-6 grid gap-5 md:grid-cols-2">
                      <div>
                        <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Category / Design Category / Design Style</p>
                        <FieldValue value={[project.category, project.design_category, project.design_style].filter(Boolean).join(' / ') || null} />
                      </div>
                      <div>
                        <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Area Type</p>
                        <FieldValue value={project.area_type} />
                      </div>
                      <div>
                        <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Project Size</p>
                        <FieldValue value={project.project_size} />
                      </div>
                      <div>
                        <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Area Scope</p>
                        <FieldValue value={project.area_scope} />
                      </div>
                      <div className="md:col-span-2">
                        <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Client Problem Raw</p>
                        <FieldValue value={project.client_problem_raw} />
                      </div>
                      <div className="md:col-span-2">
                        <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Design Reference</p>
                        <FieldValue value={project.design_reference} />
                      </div>
                      <div className="md:col-span-2">
                        <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Konteks</p>
                        <FieldValue value={project.konteks} />
                      </div>
                      <div className="md:col-span-2">
                        <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Konflik</p>
                        <FieldValue value={project.konflik} />
                      </div>
                      <div className="md:col-span-2">
                        <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Keputusan Desain</p>
                        <FieldValue value={project.keputusan_desain} />
                      </div>
                      <div className="md:col-span-2">
                        <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Insight Kunci</p>
                        <FieldValue value={project.insight_kunci} />
                      </div>
                    </div>
                  </article>
                ))
              : null}
          </section>
        </div>
      </main>
    </AdminAuthGuard>
  );
}
