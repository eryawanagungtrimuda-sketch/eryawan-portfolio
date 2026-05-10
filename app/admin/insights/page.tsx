'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import AdminAuthGuard from '@/components/admin-auth-guard';
import ContextualBackButton from '@/components/contextual-back-button';
import { getSupabaseClient } from '@/lib/supabaseClient';
import type { Insight } from '@/lib/types';

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function AdminInsightsPage() {
  const [items, setItems] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadInsights() {
      setLoading(true);
      try {
        const { data, error } = await getSupabaseClient()
          .from('insights')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[AdminInsightsPage] Failed to load insights', error.message);
          return;
        }

        if (isMounted) setItems((data || []) as Insight[]);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    void loadInsights();

    return () => {
      isMounted = false;
    };
  }, []);

  const published = useMemo(() => items.filter((item) => item.is_published).length, [items]);

  return (
    <AdminAuthGuard>
      <main id="admin-shell" className="min-h-screen bg-[#080807] px-4 py-10 font-sans text-[#F4F1EA] sm:px-5 md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl space-y-8">
          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="font-sans text-[2rem] font-semibold tracking-[-0.02em] sm:text-[2.4rem] md:text-5xl">Kelola Wawasan</h1>
                <p className="mt-2 max-w-2xl text-sm text-white/70 md:text-base">Kelola artikel wawasan desain untuk publikasi halaman /wawasan.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/admin/insights/new" className="rounded-lg bg-[#E5A900] px-4 py-2 text-sm font-medium text-black transition hover:bg-[#f8bb15]">Tambah Review Karya</Link>
                <ContextualBackButton fallbackHref="/admin" className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white/90 transition hover:border-white/40 hover:bg-white/5" />
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            {[
              { label: 'Total Wawasan', value: items.length },
              { label: 'Published', value: published },
              { label: 'Draft', value: items.length - published },
            ].map((card) => (
              <div key={card.label} className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <p className="text-xs uppercase tracking-wide text-white/60">{card.label}</p>
                <p className="mt-2 text-3xl font-semibold">{card.value}</p>
              </div>
            ))}
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
            {loading ? (
              <p className="p-6 text-sm text-white/70">Memuat data wawasan...</p>
            ) : items.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-lg font-medium">Belum ada wawasan.</p>
                <p className="mt-1 text-sm text-white/70">Mulai dengan menambahkan wawasan baru untuk ditinjau dan dipublikasikan.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/10 font-sans text-sm">
                  <thead className="bg-white/[0.03] text-left text-xs uppercase tracking-wide text-white/60">
                    <tr>
                      <th className="px-4 py-3">Title</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Source Type</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Created At</th><th className="px-4 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {items.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-3">{item.title}</td>
                        <td className="px-4 py-3 text-white/80">{item.category || '-'}</td>
                        <td className="px-4 py-3 text-white/80">{item.source_type}</td>
                        <td className="px-4 py-3"><span className={`rounded-full px-2.5 py-1 text-xs ${item.is_published ? 'bg-emerald-400/15 text-emerald-300' : 'bg-amber-400/15 text-amber-300'}`}>{item.is_published ? 'Published' : 'Draft'}</span></td>
                        <td className="px-4 py-3 text-white/80">{formatDate(item.created_at)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-3">
                            <Link href={`/admin/insights/${item.id}/edit`} className="font-sans text-[#F6C453] hover:underline">Edit</Link>
                            <button
                              className="font-sans text-red-300 hover:underline"
                              onClick={async () => {
                                await getSupabaseClient().from('insights').delete().eq('id', item.id);
                                setItems((current) => current.filter((row) => row.id !== item.id));
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </AdminAuthGuard>
  );
}
