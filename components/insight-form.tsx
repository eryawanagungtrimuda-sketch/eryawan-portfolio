'use client';

import Image from 'next/image';
import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { createUniqueStorageFileName } from '@/lib/storage';
import type { Insight, InsightImage, InsightSourceType } from '@/lib/types';

type InsightFormValues = {
  title: string;
  slug: string;
  category: string;
  content_type: 'artikel' | 'review_karya';
  source_type: InsightSourceType;
  source_project_id: string;
  cover_image: string;
  excerpt: string;
  content: string;
  is_published: boolean;
};

type LocalImage = { id: string; image_url: string; sort_order: number; file?: File };
const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGE = 4;
const MAX_SIZE = 5 * 1024 * 1024;

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
}

export default function InsightForm({ insight, projects = [], initialImages = [] }: { insight?: Insight | null; projects?: { id: string; title: string }[]; initialImages?: InsightImage[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState<InsightFormValues>({
    title: insight?.title || '', slug: insight?.slug || '', category: insight?.category || '', content_type: insight?.content_type || 'artikel', source_type: insight?.source_type || 'manual',
    source_project_id: insight?.source_project_id || '', cover_image: insight?.cover_image || '', excerpt: insight?.excerpt || '', content: insight?.content || '', is_published: insight?.is_published || false,
  });
  const [images, setImages] = useState<LocalImage[]>(initialImages.map((img) => ({ id: img.id, image_url: img.image_url, sort_order: img.sort_order })));

  const canGenerate = useMemo(() => Boolean(form.title || form.source_project_id || form.content || form.excerpt || images.length), [form, images.length]);

  function validateFiles(files: FileList | null) {
    if (!files) return null;
    if (images.length + files.length > MAX_IMAGE) return `Maksimal ${MAX_IMAGE} gambar.`;
    for (const file of Array.from(files)) {
      if (!ACCEPTED.includes(file.type)) return 'Format file harus jpg, jpeg, png, atau webp.';
      if (file.size > MAX_SIZE) return 'Ukuran file maksimal 5MB per gambar.';
    }
    return null;
  }

  async function uploadPendingImages(insightId: string) {
    const pending = images.filter((img) => img.file);
    if (!pending.length) return images;
    const supabase = getSupabaseClient();
    const uploaded: LocalImage[] = [];

    for (const item of pending) {
      const file = item.file as File;
      const filePath = `insights/${insightId}/${createUniqueStorageFileName(file.name)}`;
      const { error: uploadError } = await supabase.storage.from(process.env.NEXT_PUBLIC_INSIGHT_IMAGES_BUCKET || 'insight-images').upload(filePath, file, { upsert: false });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from(process.env.NEXT_PUBLIC_INSIGHT_IMAGES_BUCKET || 'insight-images').getPublicUrl(filePath);
      uploaded.push({ ...item, image_url: data.publicUrl, file: undefined });
    }

    const finalImages = [...images.filter((img) => !img.file), ...uploaded].slice(0, MAX_IMAGE).map((img, idx) => ({ ...img, sort_order: idx }));
    await supabase.from('insight_images').delete().eq('insight_id', insightId);
    const { error: imageError } = await supabase.from('insight_images').insert(finalImages.map((img) => ({ insight_id: insightId, image_url: img.image_url, sort_order: img.sort_order })));
    if (imageError) throw imageError;
    return finalImages;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      const supabase = getSupabaseClient();
      const payload = { title: form.title, slug: form.slug || slugify(form.title), category: form.category || null, content_type: form.content_type, source_type: form.source_type, source_project_id: form.source_project_id || null, cover_image: form.cover_image || null, excerpt: form.excerpt || null, content: form.content || null, is_published: form.is_published, updated_at: new Date().toISOString() };
      let insightId = insight?.id;
      if (insight?.id) {
        const { error: updateError } = await supabase.from('insights').update(payload).eq('id', insight.id);
        if (updateError) throw updateError;
      } else {
        const { data, error: insertError } = await supabase.from('insights').insert(payload).select('id').single();
        if (insertError) throw insertError;
        insightId = data.id;
      }
      const finalImages = await uploadPendingImages(insightId as string);
      if (!form.cover_image && finalImages[0]?.image_url) {
        await supabase.from('insights').update({ cover_image: finalImages[0].image_url }).eq('id', insightId as string);
      }
      setMessage(insight?.id ? 'Wawasan berhasil diperbarui.' : 'Draft wawasan berhasil dibuat.');
      if (!insight?.id) router.push(`/admin/insights/${insightId}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan wawasan.');
    } finally { setLoading(false); }
  }

  async function generateDraft() {
    setGenerating(true); setError(''); setMessage('');
    try {
      const response = await fetch('/api/generate-insight-draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source_type: form.source_type, source_project_id: form.source_project_id || undefined, title: form.title, category: form.category, excerpt: form.excerpt, context: form.content, imageUrls: images.map((img) => img.image_url).filter(Boolean) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Gagal generate draft AI.');
      setForm((prev) => ({ ...prev, title: prev.title || data.title || prev.title, slug: prev.slug || slugify(data.title || prev.title), category: prev.category || data.category || prev.category, excerpt: data.excerpt || prev.excerpt, content: data.content || prev.content }));
      setMessage('Draft AI berhasil dimuat. Review sebelum menyimpan.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal generate draft AI.');
    } finally { setGenerating(false); }
  }

  return (<form onSubmit={onSubmit} className="space-y-5 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 md:p-6">
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-1.5"><label className="text-sm">Judul Wawasan</label><input className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
      <div className="space-y-1.5"><label className="text-sm">Slug URL</label><input className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
      <div className="space-y-1.5"><label className="text-sm">Tipe Konten</label><select className="w-full rounded-lg border border-white/15 bg-[#111] px-3 py-2" value={form.content_type} onChange={(e) => setForm({ ...form, content_type: e.target.value as 'artikel' | 'review_karya' })}><option value="artikel">Artikel</option><option value="review_karya">Review Karya</option></select></div>
      <div className="space-y-1.5"><label className="text-sm">Jenis Sumber</label><select className="w-full rounded-lg border border-white/15 bg-[#111] px-3 py-2" value={form.source_type} onChange={(e) => setForm({ ...form, source_type: e.target.value as InsightSourceType })}><option value="manual">manual</option><option value="project">project</option><option value="image_review">image_review</option></select></div>
    </div>
    <div className="space-y-1.5"><label className="text-sm">Upload Gambar Review (max 4)</label><input type="file" multiple accept="image/jpeg,image/jpg,image/png,image/webp" onChange={(e) => { const err = validateFiles(e.target.files); if (err) { setError(err); return; } const next = Array.from(e.target.files || []).map((file, idx) => ({ id: `${Date.now()}-${idx}`, image_url: URL.createObjectURL(file), sort_order: images.length + idx, file })); setImages((prev) => [...prev, ...next].slice(0, MAX_IMAGE)); setError(''); }} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{images.map((img, idx) => <div key={img.id} className="rounded-lg border border-white/10 p-2"><Image src={img.image_url} alt={`Preview ${idx + 1}`} width={180} height={120} className="h-24 w-full rounded object-cover" /><button type="button" className="mt-2 text-xs text-red-300" onClick={() => setImages((curr) => curr.filter((_, i) => i !== idx))}>Hapus</button></div>)}</div>
    </div>
    <div className="space-y-1.5"><label className="text-sm">Ringkasan Pembuka</label><textarea className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2" rows={3} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
    <div className="space-y-1.5"><label className="text-sm">Konten Wawasan</label><textarea className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2" rows={14} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> Publikasikan Wawasan</label>
    {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
    {error ? <p className="text-sm text-red-300">{error}</p> : null}
    <div className="flex gap-3"><button type="submit" disabled={loading || generating} className="rounded-lg bg-[#E5A900] px-4 py-2 text-sm text-black disabled:opacity-60">{loading ? 'Menyimpan...' : insight ? 'Simpan Perubahan' : 'Simpan Draft'}</button><button type="button" onClick={generateDraft} disabled={!canGenerate || loading || generating} className="rounded-lg border border-white/20 px-4 py-2 text-sm disabled:opacity-60">{generating ? 'Memproses AI...' : 'Bangun / Perbaiki dengan AI'}</button></div>
  </form>);
}
