'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { createUniqueStorageFileName } from '@/lib/storage';
import type { Insight, InsightImage, InsightSourceType } from '@/lib/types';

type ContentType = 'artikel' | 'review_karya';
type InsightFormValues = {
  title: string;
  slug: string;
  category: string;
  content_type: ContentType;
  source_type: InsightSourceType;
  source_project_id: string;
  cover_image: string;
  excerpt: string;
  content: string;
  is_published: boolean;
};

type LocalImage = { id: string; image_url: string; sort_order: number; file?: File; isLocal?: boolean };
const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGE = 4;
const MAX_SIZE = 5 * 1024 * 1024;
const BUCKET = process.env.NEXT_PUBLIC_INSIGHT_IMAGES_BUCKET || 'insight-images';

const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');

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

  useEffect(() => () => {
    images.forEach((img) => { if (img.isLocal) URL.revokeObjectURL(img.image_url); });
  }, [images]);

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

  async function uploadFilesIfNeeded(insightId: string, targetImages: LocalImage[]) {
    const supabase = getSupabaseClient();
    const resolved: LocalImage[] = [];
    for (const item of targetImages.slice(0, MAX_IMAGE)) {
      if (!item.file) {
        resolved.push({ ...item, file: undefined, isLocal: false });
        continue;
      }
      const filePath = `insights/${insightId}/${createUniqueStorageFileName(item.file.name)}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(filePath, item.file, { upsert: false });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
      resolved.push({ id: item.id, image_url: data.publicUrl, sort_order: item.sort_order, isLocal: false });
    }
    return resolved.map((img, idx) => ({ ...img, sort_order: idx }));
  }

  async function persistInsightImages(insightId: string, targetImages: LocalImage[]) {
    const supabase = getSupabaseClient();
    const resolved = await uploadFilesIfNeeded(insightId, targetImages);
    await supabase.from('insight_images').delete().eq('insight_id', insightId);
    if (resolved.length > 0) {
      const { error: imageError } = await supabase.from('insight_images').insert(resolved.map((img) => ({ insight_id: insightId, image_url: img.image_url, sort_order: img.sort_order })));
      if (imageError) throw imageError;
    }
    return resolved;
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      const supabase = getSupabaseClient();
      const payload = {
        title: form.title, slug: form.slug || slugify(form.title), category: form.category || null, content_type: form.content_type,
        source_type: form.content_type === 'review_karya' ? 'image_review' : form.source_type,
        source_project_id: form.source_type === 'project' ? form.source_project_id || null : null,
        cover_image: form.cover_image || null, excerpt: form.excerpt || null, content: form.content || null, is_published: form.is_published, updated_at: new Date().toISOString(),
      };
      let insightId = insight?.id;
      if (insightId) {
        const { error: updateError } = await supabase.from('insights').update(payload).eq('id', insightId);
        if (updateError) throw updateError;
      } else {
        const { data, error: insertError } = await supabase.from('insights').insert(payload).select('id').single();
        if (insertError) throw insertError;
        insightId = data.id;
      }
      const finalImages = await persistInsightImages(insightId as string, images);
      if (!form.cover_image && finalImages[0]?.image_url) await supabase.from('insights').update({ cover_image: finalImages[0].image_url }).eq('id', insightId as string);
      setImages(finalImages);
      setMessage(insightId === insight?.id ? 'Wawasan berhasil diperbarui.' : 'Draft wawasan berhasil dibuat.');
      if (!insight?.id) router.push(`/admin/insights/${insightId}/edit`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan wawasan.');
    } finally { setLoading(false); }
  }

  async function generateDraft() {
    setGenerating(true); setError(''); setMessage('');
    try {
      if (!insight?.id && images.some((img) => img.file)) {
        setError('Simpan draft dulu agar gambar dapat dianalisis AI.');
        return;
      }
      let currentImages = images;
      if (insight?.id) {
        currentImages = await persistInsightImages(insight.id, images);
        setImages(currentImages);
      }
      const response = await fetch('/api/generate-insight-draft', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_type: form.content_type === 'review_karya' ? 'image_review' : form.source_type,
          source_project_id: form.source_project_id || undefined, title: form.title, category: form.category, excerpt: form.excerpt, context: form.content,
          imageUrls: currentImages.map((img) => img.image_url).filter((url) => url.startsWith('http')),
        }),
      });
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
      <div className="space-y-1.5"><label className="text-sm">Kategori</label><input className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
      <div className="space-y-1.5"><label className="text-sm">Tipe Konten</label><select className="w-full rounded-lg border border-white/15 bg-[#111] px-3 py-2" value={form.content_type} onChange={(e) => { const next = e.target.value as ContentType; setForm((prev) => ({ ...prev, content_type: next, source_type: next === 'review_karya' ? 'image_review' : prev.source_type === 'image_review' ? 'manual' : prev.source_type })); }}><option value="artikel">Artikel</option><option value="review_karya">Review Karya</option></select></div>
      <div className="space-y-1.5"><label className="text-sm">Jenis Sumber</label><select className="w-full rounded-lg border border-white/15 bg-[#111] px-3 py-2" value={form.source_type} disabled={form.content_type === 'review_karya'} onChange={(e) => setForm({ ...form, source_type: e.target.value as InsightSourceType })}><option value="manual">manual</option><option value="project">project</option><option value="image_review">image_review</option></select></div>
    </div>
    {form.source_type === 'project' ? <div className="space-y-1.5"><label className="text-sm">Project Sumber</label><select className="w-full rounded-lg border border-white/15 bg-[#111] px-3 py-2" value={form.source_project_id} onChange={(e) => setForm({ ...form, source_project_id: e.target.value })}><option value="">Pilih project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</select></div> : null}
    <div className="space-y-1.5"><label className="text-sm">Cover Image URL (manual override)</label><input className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2" value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} /></div>
    {form.content_type === 'review_karya' || form.source_type === 'image_review' ? <div className="space-y-1.5"><label className="text-sm">Upload Gambar Review (max 4)</label><input type="file" multiple accept="image/jpeg,image/jpg,image/png,image/webp" onChange={(e) => { const err = validateFiles(e.target.files); if (err) { setError(err); return; } const next = Array.from(e.target.files || []).map((file, idx) => ({ id: `${Date.now()}-${idx}`, image_url: URL.createObjectURL(file), sort_order: images.length + idx, file, isLocal: true })); setImages((prev) => [...prev, ...next].slice(0, MAX_IMAGE)); setError(''); }} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{images.map((img, idx) => <div key={img.id} className="rounded-lg border border-white/10 p-2"><Image src={img.image_url} alt={`Preview ${idx + 1}`} width={180} height={120} className="h-24 w-full rounded object-cover" /><button type="button" className="mt-2 text-xs text-red-300" onClick={() => setImages((curr) => { const target = curr[idx]; if (target?.isLocal) URL.revokeObjectURL(target.image_url); return curr.filter((_, i) => i !== idx); })}>Hapus</button></div>)}</div>
    </div> : null}
    <div className="space-y-1.5"><label className="text-sm">Ringkasan Pembuka</label><textarea className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2" rows={3} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
    <div className="space-y-1.5"><label className="text-sm">Konten Wawasan</label><textarea className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2" rows={14} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /> Publikasikan Wawasan</label>
    <div className="rounded-lg border border-white/10 bg-black/20 p-4"><h3 className="text-sm">Preview Ringkas</h3><p className="mt-2 text-lg">{form.title || 'Judul wawasan belum diisi'}</p><p className="text-xs text-white/60">Kategori: {form.category || '-'}</p><p className="mt-2 text-sm text-white/80">{form.excerpt || 'Ringkasan pembuka akan tampil di sini.'}</p></div>
    {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
    {error ? <p className="text-sm text-red-300">{error}</p> : null}
    <div className="flex gap-3"><button type="submit" disabled={loading || generating} className="rounded-lg bg-[#E5A900] px-4 py-2 text-sm text-black disabled:opacity-60">{loading ? 'Menyimpan...' : insight ? 'Simpan Perubahan' : 'Simpan Draft'}</button><button type="button" onClick={generateDraft} disabled={!canGenerate || loading || generating} className="rounded-lg border border-white/20 px-4 py-2 text-sm disabled:opacity-60">{generating ? 'Memproses AI...' : 'Bangun / Perbaiki dengan AI'}</button></div>
  </form>);
}
