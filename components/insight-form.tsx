'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabaseClient';
import type { Insight, InsightSourceType } from '@/lib/types';

type InsightFormValues = {
  title: string;
  slug: string;
  category: string;
  source_type: InsightSourceType;
  source_project_id: string;
  cover_image: string;
  excerpt: string;
  content: string;
  is_published: boolean;
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
}

export default function InsightForm({ insight, projects = [] }: { insight?: Insight | null; projects?: { id: string; title: string }[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState<InsightFormValues>({
    title: insight?.title || '',
    slug: insight?.slug || '',
    category: insight?.category || '',
    source_type: insight?.source_type || 'manual',
    source_project_id: insight?.source_project_id || '',
    cover_image: insight?.cover_image || '',
    excerpt: insight?.excerpt || '',
    content: insight?.content || '',
    is_published: insight?.is_published || false,
  });

  const canGenerate = useMemo(() => Boolean(form.title || form.source_project_id || form.content), [form]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const supabase = getSupabaseClient();
      const payload = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        category: form.category || null,
        source_type: form.source_type,
        source_project_id: form.source_project_id || null,
        cover_image: form.cover_image || null,
        excerpt: form.excerpt || null,
        content: form.content || null,
        is_published: form.is_published,
        updated_at: new Date().toISOString(),
      };

      if (insight?.id) {
        const { error: updateError } = await supabase.from('insights').update(payload).eq('id', insight.id);
        if (updateError) throw updateError;
        setMessage('Wawasan berhasil diperbarui.');
      } else {
        const { data, error: insertError } = await supabase.from('insights').insert(payload).select('id').single();
        if (insertError) throw insertError;
        setMessage('Draft wawasan berhasil dibuat.');
        router.push(`/admin/insights/${data.id}/edit`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan wawasan.');
    } finally {
      setLoading(false);
    }
  }

  async function generateDraft() {
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/generate-insight-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_type: form.source_type,
          source_project_id: form.source_project_id || undefined,
          title: form.title,
          context: form.content,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal generate draft AI.');

      setForm((prev) => ({
        ...prev,
        title: data.title || prev.title,
        slug: prev.slug || slugify(data.title || prev.title),
        category: data.category || prev.category,
        excerpt: data.excerpt || prev.excerpt,
        content: data.content || prev.content,
      }));
      setMessage('Draft AI berhasil dimuat. Cek ulang sebelum simpan/publish.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal generate draft AI.');
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input placeholder="Judul Wawasan" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
      <input placeholder="Slug URL" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
      <input placeholder="Kategori" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />

      <select value={form.source_type} onChange={(e) => setForm({ ...form, source_type: e.target.value as InsightSourceType })}>
        <option value="manual">manual</option>
        <option value="project">project</option>
        <option value="image_review">image_review</option>
      </select>

      <select value={form.source_project_id} onChange={(e) => setForm({ ...form, source_project_id: e.target.value })}>
        <option value="">Pilih project (opsional)</option>
        {projects.map((project) => (
          <option key={project.id} value={project.id}>{project.title}</option>
        ))}
      </select>

      <input placeholder="URL Cover Image" value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} />
      <textarea placeholder="Excerpt" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
      <textarea rows={14} placeholder="Konten Wawasan" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />

      <label className="block">
        <input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> Publish
      </label>

      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <div className="flex gap-3">
        <button type="submit" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan'}</button>
        <button type="button" onClick={generateDraft} disabled={!canGenerate || loading}>Bangun / Perbaiki dengan AI</button>
      </div>
    </form>
  );
}
