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
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState<InsightFormValues>({
    title: insight?.title || '', slug: insight?.slug || '', category: insight?.category || '', source_type: insight?.source_type || 'manual',
    source_project_id: insight?.source_project_id || '', cover_image: insight?.cover_image || '', excerpt: insight?.excerpt || '', content: insight?.content || '', is_published: insight?.is_published || false,
  });

  const canGenerate = useMemo(() => Boolean(form.title || form.source_project_id || form.content || form.excerpt), [form]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      const supabase = getSupabaseClient();
      const payload = { title: form.title, slug: form.slug || slugify(form.title), category: form.category || null, source_type: form.source_type, source_project_id: form.source_project_id || null, cover_image: form.cover_image || null, excerpt: form.excerpt || null, content: form.content || null, is_published: form.is_published, updated_at: new Date().toISOString() };
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
    } finally { setLoading(false); }
  }

  async function generateDraft() {
    setGenerating(true); setError(''); setMessage('');
    try {
      const response = await fetch('/api/generate-insight-draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source_type: form.source_type, source_project_id: form.source_project_id || undefined, title: form.title, category: form.category, excerpt: form.excerpt, context: form.content }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal generate draft AI.');
      setForm((prev) => ({ ...prev, title: prev.title || data.title || prev.title, slug: prev.slug || slugify(data.title || prev.title), category: prev.category || data.category || prev.category, excerpt: data.excerpt || prev.excerpt, content: data.content || prev.content }));
      setMessage('Draft AI berhasil dimuat. Review sebelum menyimpan.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal generate draft AI.');
    } finally { setGenerating(false); }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 md:p-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5"><label className="text-sm">Judul Wawasan</label><input className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2" placeholder="Contoh: Merancang Sirkulasi Dapur Kecil" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
        <div className="space-y-1.5"><label className="text-sm">Slug URL</label><input className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /><p className="text-xs text-white/60">Slug dipakai untuk URL public.</p></div>
        <div className="space-y-1.5"><label className="text-sm">Kategori</label><input className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
        <div className="space-y-1.5"><label className="text-sm">Jenis Sumber</label><select className="w-full rounded-lg border border-white/15 bg-[#111] px-3 py-2" value={form.source_type} onChange={(e) => setForm({ ...form, source_type: e.target.value as InsightSourceType })}><option value="manual">manual</option><option value="project">project</option><option value="image_review">image_review</option></select></div>
      </div>

      <div className="space-y-1.5"><label className="text-sm">Project Sumber</label><select className="w-full rounded-lg border border-white/15 bg-[#111] px-3 py-2" value={form.source_project_id} onChange={(e) => setForm({ ...form, source_project_id: e.target.value })}><option value="">Pilih project (opsional)</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</select></div>

      <div className="space-y-1.5"><label className="text-sm">URL Cover Image</label><input className="w-full max-w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 break-words" value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} /></div>

      <div className="space-y-1.5"><label className="text-sm">Ringkasan Pembuka</label><textarea className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2" rows={3} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /><p className="text-xs text-white/60">Ringkasan pembuka tampil di listing /wawasan.</p></div>

      <div className="space-y-1.5"><label className="text-sm">Konten Wawasan</label><textarea className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2 text-sm sm:text-base" rows={14} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /><p className="text-xs text-white/60">Konten boleh markdown sederhana.</p></div>

      <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> Publikasikan Wawasan</label>

      <div className="rounded-lg border border-white/10 bg-black/20 p-4">
        <h3 className="text-sm font-medium">Preview Ringkas</h3>
        <p className="mt-2 text-lg">{form.title || 'Judul wawasan belum diisi'}</p>
        <p className="mt-1 text-xs text-white/60">Kategori: {form.category || '-'}</p>
        <p className="mt-2 text-sm text-white/80">{form.excerpt || 'Ringkasan pembuka akan tampil di sini.'}</p>
      </div>

      {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
      {error ? <p className="text-sm text-red-300">{error}</p> : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <button type="submit" disabled={loading || generating} className="min-h-11 rounded-lg bg-[#E5A900] px-4 py-2 text-sm font-medium text-black disabled:opacity-60">{loading ? 'Menyimpan...' : insight ? 'Simpan Perubahan' : 'Simpan Draft'}</button>
        <button type="button" onClick={generateDraft} disabled={!canGenerate || loading || generating} className="min-h-11 rounded-lg border border-white/20 px-4 py-2 text-sm disabled:opacity-60">{generating ? 'Memproses AI...' : 'Bangun / Perbaiki dengan AI'}</button>
      </div>
    </form>
  );
}
