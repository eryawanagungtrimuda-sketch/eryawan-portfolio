'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminAuthGuard from '@/components/admin-auth-guard';
import ContextualBackButton from '@/components/contextual-back-button';
import InsightForm from '@/components/insight-form';
import { getSupabaseClient } from '@/lib/supabaseClient';

export default function NewInsightPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');
  const [loadingFromProject, setLoadingFromProject] = useState(Boolean(projectId));
  const [error, setError] = useState('');

  useEffect(() => {
    async function createFromProject() {
      if (!projectId) return;
      setLoadingFromProject(true);
      setError('');

      try {
        const { data: auth } = await getSupabaseClient().auth.getSession();
        const token = auth.session?.access_token;
        if (!token) throw new Error('Sesi admin tidak ditemukan. Silakan login ulang.');

        const response = await fetch('/api/insights/from-project', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ projectId }),
        });

        const payload = (await response.json()) as { id?: string; error?: string };
        if (!response.ok || !payload.id) {
          throw new Error(payload.error || 'Gagal membuat wawasan dari project.');
        }

        router.replace(`/admin/insights/${payload.id}/edit`);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Terjadi kesalahan saat membuat wawasan.');
      } finally {
        setLoadingFromProject(false);
      }
    }

    createFromProject();
  }, [projectId, router]);

  return (
    <AdminAuthGuard>
      <main id="admin-shell" className="min-h-screen bg-[#080807] px-4 py-10 font-sans text-[#F4F1EA] sm:px-5 md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl space-y-6">
          <ContextualBackButton fallbackHref="/admin/insights" className="inline-flex font-sans rounded-lg border border-white/20 px-4 py-2 text-sm text-white/90 hover:bg-white/5" />
          <div>
            <h1 className="font-display text-[2rem] font-normal tracking-[-0.02em] sm:text-[2.4rem] md:text-5xl">Tambah Review Karya</h1>
            <p className="mt-2 text-sm text-white/70 md:text-base">Unggah gambar karya, buat narasi review dengan AI, lalu tinjau sebelum dipublikasikan.</p>
          </div>
          {loadingFromProject ? <p className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/75">Menyiapkan wawasan dari project terpilih...</p> : null}
          {error ? <p className="rounded-lg border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}
          {!projectId ? <InsightForm /> : null}
        </div>
      </main>
    </AdminAuthGuard>
  );
}
