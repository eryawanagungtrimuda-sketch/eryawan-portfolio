'use client';

import { useEffect, useState } from 'react';
import AdminAuthGuard from '@/components/admin-auth-guard';
import ContextualBackButton from '@/components/contextual-back-button';
import InsightForm from '@/components/insight-form';
import { getSupabaseClient } from '@/lib/supabaseClient';
import type { Insight, InsightImage } from '@/lib/types';

export default function EditInsightPage({ params }: { params: { id: string } }) {
  const [insight, setInsight] = useState<Insight | null>(null);
  const [projects, setProjects] = useState<{ id: string; title: string }[]>([]);
  const [images, setImages] = useState<InsightImage[]>([]);

  useEffect(() => {
    const supabase = getSupabaseClient();

    supabase
      .from('insights')
      .select('*')
      .eq('id', params.id)
      .single()
      .then(({ data }) => setInsight((data || null) as Insight | null));

    supabase
      .from('insight_images')
      .select('*')
      .eq('insight_id', params.id)
      .order('sort_order')
      .then(({ data }) => setImages((data || []) as InsightImage[]));

    supabase
      .from('projects')
      .select('id,title')
      .order('title')
      .then(({ data }) => setProjects((data || []) as { id: string; title: string }[]));
  }, [params.id]);

  return (
    <AdminAuthGuard>
      <main id="admin-shell" className="min-h-screen bg-[#080807] px-4 py-10 font-sans text-[#F4F1EA] sm:px-5 md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl space-y-6">
          <ContextualBackButton fallbackHref="/admin/insights" className="inline-flex font-sans rounded-lg border border-white/20 px-4 py-2 text-sm text-white/90 hover:bg-white/5" />
          <div>
            <h1 className="font-sans text-[2rem] font-semibold tracking-[-0.02em] sm:text-[2.4rem] md:text-5xl">Edit Wawasan</h1>
            <p className="mt-2 text-sm text-white/70 md:text-base">Perbarui konten, review hasil AI, lalu simpan perubahan wawasan.</p>
          </div>
          {insight ? <InsightForm insight={insight} projects={projects} initialImages={images} /> : <p>Memuat...</p>}
        </div>
      </main>
    </AdminAuthGuard>
  );
}
