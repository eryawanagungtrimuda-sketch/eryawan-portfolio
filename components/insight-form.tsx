'use client';

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
type GenerateErrorResponse = { error?: string; code?: string };

const ACCEPTED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_IMAGE = 4;
const MAX_SIZE = 5 * 1024 * 1024;
const BUCKET = process.env.NEXT_PUBLIC_INSIGHT_IMAGES_BUCKET || 'insight-images';
const CATEGORY_OPTIONS = ['Review Karya', 'Strategi Desain', 'Interior', 'Hospitality & Commercial', 'Residential', 'Material & Detail', 'Lighting & Atmosphere', 'Arsitektur & Ruang'];
const NEW_CATEGORY_VALUE = '__new__';
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');

export default function InsightForm({ insight, projects = [], initialImages = [] }: { insight?: Insight | null; projects?: { id: string; title: string }[]; initialImages?: InsightImage[] }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [draftId, setDraftId] = useState<string | null>(insight?.id || null);
  const isDirectReviewFlow = !insight;
  const [form, setForm] = useState<InsightFormValues>({
    title: insight?.title || '', slug: insight?.slug || '', category: insight?.category || '', content_type: insight?.content_type || (isDirectReviewFlow ? 'review_karya' : 'artikel'), source_type: insight?.source_type || (isDirectReviewFlow ? 'image_review' : 'manual'),
    source_project_id: insight?.source_project_id || '', cover_image: insight?.cover_image || '', excerpt: insight?.excerpt || '', content: insight?.content || '', is_published: insight?.is_published || false,
  });
  const [images, setImages] = useState<LocalImage[]>(initialImages.map((img) => ({ id: img.id, image_url: img.image_url, sort_order: img.sort_order })));
  const categoryOptions = useMemo(() => {
    const currentCategory = insight?.category?.trim();
    if (!currentCategory || CATEGORY_OPTIONS.includes(currentCategory)) return CATEGORY_OPTIONS;
    return [...CATEGORY_OPTIONS, currentCategory];
  }, [insight?.category]);
  const initialCategoryPreset = categoryOptions.includes(insight?.category || '') ? insight?.category || '' : '';
  const [categoryMode, setCategoryMode] = useState<'preset' | 'custom'>(insight?.category && !initialCategoryPreset ? 'custom' : 'preset');
  const [selectedCategory, setSelectedCategory] = useState(initialCategoryPreset);
  const [customCategory, setCustomCategory] = useState(insight?.category && !initialCategoryPreset ? insight.category : '');
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(Boolean(insight?.slug));
  const [isSlugEditable, setIsSlugEditable] = useState(Boolean(insight?.slug));

  useEffect(() => () => {
    images.forEach((img) => { if (img.isLocal) URL.revokeObjectURL(img.image_url); });
  }, []);

  useEffect(() => {
    if (categoryMode === 'custom') {
      setForm((prev) => ({ ...prev, category: customCategory }));
      return;
    }
    setForm((prev) => ({ ...prev, category: selectedCategory }));
  }, [categoryMode, selectedCategory, customCategory]);

  useEffect(() => {
    if (isSlugManuallyEdited) return;
    setForm((prev) => ({ ...prev, slug: slugify(prev.title) }));
  }, [form.title, isSlugManuallyEdited]);

  const isReviewFlow = form.content_type === 'review_karya' || form.source_type === 'image_review';
  const isProjectFlow = form.source_type === 'project';
  const isNewReviewKarya = !insight && isReviewFlow;
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



  async function getUniqueInsightSlug(baseSlug: string, currentInsightId?: string) {
    const supabase = getSupabaseClient();
    const normalizedBase = slugify(baseSlug || 'draft-wawasan-baru') || 'draft-wawasan-baru';
    for (let attempt = 1; attempt <= 50; attempt += 1) {
      const candidate = attempt === 1 ? normalizedBase : `${normalizedBase}-${attempt}`;
      const { data, error: slugError } = await supabase.from('insights').select('id,slug').eq('slug', candidate).maybeSingle();
      if (slugError) throw slugError;
      if (!data || data.id === currentInsightId) return candidate;
    }
    throw new Error('Gagal menghasilkan slug unik. Silakan ubah judul atau slug.');
  }

  async function ensureManualSlugAvailable(candidateSlug: string, currentInsightId?: string) {
    const supabase = getSupabaseClient();
    const { data, error: slugError } = await supabase.from('insights').select('id,slug').eq('slug', candidateSlug).maybeSingle();
    if (slugError) throw slugError;
    if (data && data.id !== currentInsightId) throw new Error('Slug sudah digunakan. Silakan gunakan slug lain.');
  }
  async function ensureDraftId() {
    if (draftId) return draftId;
    const supabase = getSupabaseClient();
    const baseSlug = form.slug || slugify(form.title || `draft-${Date.now()}`);
    const manualSlug = slugify(form.slug);
    const draftSlug = isSlugEditable
      ? (manualSlug || await getUniqueInsightSlug(baseSlug, insight?.id))
      : await getUniqueInsightSlug(baseSlug, insight?.id);
    if (isSlugEditable && manualSlug) await ensureManualSlugAvailable(manualSlug, insight?.id);
    const payload = {
      title: form.title || 'Draft Wawasan Baru', slug: draftSlug, category: form.category || null, content_type: form.content_type,
      source_type: form.content_type === 'review_karya' ? 'image_review' : form.source_type,
      source_project_id: isProjectFlow ? form.source_project_id || null : null,
      cover_image: form.cover_image || null, excerpt: form.excerpt || null, content: form.content || null, is_published: false,
    };
    const { data, error: insertError } = await supabase.from('insights').insert(payload).select('id').single();
    if (insertError) throw insertError;
    setDraftId(data.id);
    return data.id as string;
  }

  async function uploadAndPersistImages(insightId: string, targetImages: LocalImage[]) {
    const supabase = getSupabaseClient();
    const resolved: LocalImage[] = [];
    for (const item of targetImages.slice(0, MAX_IMAGE)) {
      if (!item.file) {
        resolved.push({ ...item, file: undefined, isLocal: false });
        continue;
      }
      const path = `insights/${insightId}/${createUniqueStorageFileName(item.file.name)}`;
      const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, item.file, { upsert: false });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      resolved.push({ id: item.id, image_url: data.publicUrl, sort_order: item.sort_order, isLocal: false });
    }
    const ordered = resolved.map((img, idx) => ({ ...img, sort_order: idx }));
    await supabase.from('insight_images').delete().eq('insight_id', insightId);
    if (ordered.length) {
      const { error: imageError } = await supabase.from('insight_images').insert(ordered.map((img) => ({ insight_id: insightId, image_url: img.image_url, sort_order: img.sort_order })));
      if (imageError) throw imageError;
    }
    return ordered;
  }

  async function resolveAiImageUrls(targetImages: LocalImage[]) {
    const supabase = getSupabaseClient();
    const urls: string[] = [];
    for (const item of targetImages.slice(0, MAX_IMAGE)) {
      if (!item.image_url.startsWith('http')) continue;
      urls.push(item.image_url);
    }
    if (!urls.length) return [];
    const { data: bucketData } = await supabase.storage.getBucket(BUCKET);
    if (bucketData?.public) return urls;
    const signedUrls = await Promise.all(urls.map(async (url) => {
      const marker = `/storage/v1/object/public/${BUCKET}/`;
      const index = url.indexOf(marker);
      if (index === -1) return null;
      const path = decodeURIComponent(url.slice(index + marker.length));
      const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 30);
      if (error || !data?.signedUrl) return null;
      return data.signedUrl;
    }));
    return signedUrls.filter((url): url is string => Boolean(url));
  }

  async function saveInsight(insightId: string) {
    const supabase = getSupabaseClient();
    const baseSlug = form.slug || slugify(form.title);
    const manualSlug = slugify(form.slug);
    const nextSlug = isSlugEditable
      ? (manualSlug || await getUniqueInsightSlug(baseSlug, insightId))
      : await getUniqueInsightSlug(baseSlug, insightId);
    if (isSlugEditable && manualSlug) await ensureManualSlugAvailable(manualSlug, insightId);
    const payload = {
      title: form.title, slug: nextSlug, category: form.category || null, content_type: form.content_type,
      source_type: form.content_type === 'review_karya' ? 'image_review' : form.source_type,
      source_project_id: isProjectFlow ? form.source_project_id || null : null,
      cover_image: form.cover_image || null, excerpt: form.excerpt || null, content: form.content || null, is_published: form.is_published, updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('insights').update(payload).eq('id', insightId);
    if (error) throw error;
    setForm((prev) => ({ ...prev, slug: nextSlug }));
    const finalImages = await uploadAndPersistImages(insightId, images);
    if (!form.cover_image && finalImages[0]?.image_url) await supabase.from('insights').update({ cover_image: finalImages[0].image_url }).eq('id', insightId);
    setImages(finalImages);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true); setError(''); setMessage('');
    try {
      const wasNew = !draftId;
      const id = await ensureDraftId();
      await saveInsight(id);
      if (wasNew) router.replace(`/admin/insights/${id}/edit`);
      setMessage('Review Karya berhasil disimpan.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan wawasan.');
    } finally { setLoading(false); }
  }

  async function generateDraft() {
    setGenerating(true); setError(''); setErrorCode(''); setMessage('');
    try {
      const id = await ensureDraftId();
      const currentImages = isReviewFlow ? await uploadAndPersistImages(id, images) : images;
      if (isReviewFlow) setImages(currentImages);
      const aiImageUrls = isReviewFlow ? await resolveAiImageUrls(currentImages) : [];
      if (isReviewFlow && aiImageUrls.length === 0) {
        throw new Error('Gambar belum memiliki URL publik untuk dianalisis AI.');
      }
      const response = await fetch('/api/generate-insight-draft', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_type: form.content_type === 'review_karya' ? 'image_review' : form.source_type, source_project_id: form.source_project_id || undefined, title: form.title, category: form.category, excerpt: form.excerpt, context: form.content, imageUrls: aiImageUrls }),
      });
      const data = (await response.json()) as GenerateErrorResponse & Record<string, string>;
      if (!response.ok) {
        if (data.code) setErrorCode(data.code);
        throw new Error(data.error || 'Gagal generate draft AI.');
      }
      const generatedTitle = data.title || form.title;
      const baseGeneratedSlug = form.slug || slugify(generatedTitle || form.title);
      const manualSlug = slugify(form.slug);
      const generatedSlug = isSlugEditable
        ? (manualSlug || await getUniqueInsightSlug(baseGeneratedSlug, id))
        : await getUniqueInsightSlug(baseGeneratedSlug, id);
      if (isSlugEditable && manualSlug) await ensureManualSlugAvailable(manualSlug, id);
      const generatedPayload = {
        title: generatedTitle,
        slug: generatedSlug,
        category: data.category || form.category || null,
        excerpt: data.excerpt || form.excerpt || null,
        content: data.content || form.content || null,
        updated_at: new Date().toISOString(),
      };
      setForm((prev) => ({ ...prev, title: generatedPayload.title, slug: generatedPayload.slug, category: generatedPayload.category || '', excerpt: generatedPayload.excerpt || '', content: generatedPayload.content || '' }));
      await getSupabaseClient().from('insights').update(generatedPayload).eq('id', id);
      setMessage('Draft AI berhasil dimuat. Review sebelum menyimpan/publish.');
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err && typeof err.code === 'string') setErrorCode(err.code);
      setError(err instanceof Error ? err.message : 'Gagal generate draft AI.');
    } finally { setGenerating(false); }
  }

  return (<form onSubmit={onSubmit} className="font-sans space-y-6 rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 md:p-8">
    <div className="grid gap-5 md:grid-cols-2">
      <div className="space-y-1.5"><label className="text-sm font-medium tracking-normal text-white/88">{isReviewFlow ? 'Judul Review' : 'Judul Wawasan'}</label><input className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
      <div className="space-y-1.5"><div className="flex items-center justify-between gap-2"><label className="text-sm font-medium tracking-normal text-white/88">Slug URL</label><button type="button" className="text-xs text-white/70 underline underline-offset-2 hover:text-white" onClick={() => { setIsSlugEditable((prev) => !prev); if (!isSlugEditable) setIsSlugManuallyEdited(true); }}>{isSlugEditable ? 'Gunakan slug otomatis' : 'Edit slug'}</button></div><input className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 disabled:cursor-not-allowed disabled:text-white/60" value={form.slug} readOnly={!isSlugEditable} onChange={(e) => { setIsSlugManuallyEdited(true); setForm({ ...form, slug: slugify(e.target.value) }); }} /><p className="text-xs text-white/60">Slug dibuat otomatis dari judul review. Aktifkan Edit slug jika ingin ubah manual.</p></div>
      <div className="space-y-1.5"><label className="text-sm font-medium tracking-normal text-white/88">Kategori</label><select className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2" value={categoryMode === 'preset' ? selectedCategory : NEW_CATEGORY_VALUE} onChange={(e) => { if (e.target.value === NEW_CATEGORY_VALUE) { setCategoryMode('custom'); return; } setCategoryMode('preset'); setSelectedCategory(e.target.value); }}><option value="">Pilih kategori</option>{categoryOptions.map((category) => <option key={category} value={category}>{category}</option>)}<option value={NEW_CATEGORY_VALUE}>Tambah kategori baru</option></select><p className="text-xs text-white/60">Kategori berfungsi sebagai rubrik utama wawasan. Detail seperti tipe ruang, gaya, atau topik teknis sebaiknya ditulis di judul, ringkasan, atau konten.</p>{categoryMode === 'custom' ? <input className="mt-2 w-full rounded-lg border border-white/15 bg-transparent px-3 py-2" placeholder="Masukkan kategori baru" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} /> : null}</div>
      {isProjectFlow ? <div className="space-y-1.5"><label className="text-sm font-medium tracking-normal text-white/88">Sumber Wawasan</label><input value="Project-based artikel" disabled className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white/70" /></div> : null}
    </div>
    {isProjectFlow ? <div className="space-y-1.5"><label className="text-sm font-medium tracking-normal text-white/88">Project Sumber</label><select disabled className="w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-white/70" value={form.source_project_id} onChange={(e) => setForm({ ...form, source_project_id: e.target.value })}><option value="">Pilih project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.title}</option>)}</select></div> : null}
    <div className="space-y-1.5"><label className="text-sm font-medium tracking-normal text-white/88">Cover Image URL (manual override)</label><input className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2" value={form.cover_image} onChange={(e) => setForm({ ...form, cover_image: e.target.value })} /></div>
    {isReviewFlow ? <div className="space-y-3"><label className="text-sm font-medium tracking-normal text-white/88">Upload Gambar Review</label><label className="block cursor-pointer rounded-xl border border-dashed border-white/25 bg-white/[0.02] p-4 transition hover:border-[#E5A900]/70 hover:bg-white/[0.04]"><input type="file" className="sr-only" multiple accept="image/jpeg,image/jpg,image/png,image/webp" onChange={(e) => { const err = validateFiles(e.target.files); if (err) { setError(err); return; } const next = Array.from(e.target.files || []).map((file, idx) => ({ id: `${Date.now()}-${idx}`, image_url: URL.createObjectURL(file), sort_order: images.length + idx, file, isLocal: true })); setImages((prev) => [...prev, ...next].slice(0, MAX_IMAGE)); setError(''); }} /><div className="space-y-1"><p className="text-sm font-semibold text-white">Upload Gambar Review</p><p className="text-xs text-white/70">Pilih hingga 4 gambar untuk dianalisis AI</p><p className="text-xs text-white/60">JPG, PNG, WEBP · Maks 5MB per gambar</p></div></label><div className="grid grid-cols-2 gap-3 md:grid-cols-4">{images.map((img, idx) => <div key={img.id} className="rounded-xl border border-white/10 bg-black/15 p-2"><img src={img.image_url} alt={`Preview ${idx + 1}`} className="h-28 w-full rounded-md object-cover" /><button type="button" className="mt-2 text-xs font-medium text-red-300 hover:text-red-200" onClick={() => setImages((curr) => { const target = curr[idx]; if (target?.isLocal) URL.revokeObjectURL(target.image_url); return curr.filter((_, i) => i !== idx); })}>Hapus gambar</button></div>)}</div></div> : null}
    <div className="space-y-1.5"><label className="text-sm font-medium tracking-normal text-white/88">Ringkasan Pembuka</label><textarea className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2" rows={3} value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} /></div>
    <div className="space-y-1.5"><label className="text-sm font-medium tracking-normal text-white/88">{isReviewFlow ? 'Konten Review' : 'Konten Wawasan'}</label><textarea className="w-full rounded-lg border border-white/15 bg-transparent px-3 py-2" rows={14} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />{isReviewFlow ? <p className="text-xs text-white/60">Konten menggunakan format Markdown dan bisa diedit sebelum dipublikasikan.</p> : null}</div>
    <label className="flex items-start justify-start gap-3 rounded-xl border border-white/15 bg-white/[0.02] p-4 text-left"><input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 self-start rounded border-white/30 bg-transparent accent-[#E5A900]" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} /><span><span className="block text-sm font-semibold text-white">Publikasikan Wawasan</span><span className="mt-1 block text-xs text-white/70">Jika aktif, konten akan tampil di halaman publik.</span></span></label>
    <div className="rounded-lg border border-white/10 bg-black/20 p-4"><h3 className="text-sm">Preview Ringkas</h3><p className="mt-2 text-lg">{form.title || 'Judul wawasan belum diisi'}</p><p className="text-xs text-white/60">Kategori: {form.category || '-'}</p><p className="mt-2 text-sm text-white/80">{form.excerpt || 'Ringkasan pembuka akan tampil di sini.'}</p></div>
    {message ? <p className="text-sm text-emerald-300">{message}</p> : null}
    {error ? <p className="text-sm text-red-300">{error}</p> : null}
    {errorCode ? <p className="text-xs text-red-200/80">Kode teknis: {errorCode}</p> : null}
    <div className="flex gap-3"><button type="submit" disabled={loading || generating} className="rounded-lg bg-[#E5A900] px-4 py-2 text-sm text-black disabled:opacity-60">{loading ? 'Menyimpan...' : isNewReviewKarya ? 'Simpan Draft Review' : 'Simpan Perubahan'}</button><button type="button" onClick={generateDraft} disabled={!canGenerate || loading || generating} className="rounded-lg border border-white/20 px-4 py-2 text-sm disabled:opacity-60">{generating ? 'Memproses AI...' : isReviewFlow ? 'Buat Narasi Review dari Gambar' : 'Bangun / Perbaiki dengan AI'}</button></div>
  </form>);
}
