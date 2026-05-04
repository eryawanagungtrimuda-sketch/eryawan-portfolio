'use client';

import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, Sparkles, Star, X } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { createUniqueStorageFileName, getProjectImagesBucketName, getStoragePathFromPublicUrl } from '@/lib/storage';
import type { Project, ProjectImage } from '@/lib/types';

type Props = { project?: Project };
type AiNarrativeResponse = { konteks?: string; konflik?: string; keputusan_desain?: string; pendekatan?: string; dampak?: string; insight_kunci?: string; error?: string };
type CustomSelectState = { choice: string; custom: string };

const maxImageSize = 2 * 1024 * 1024;
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const customValue = '__custom__';
const projectImagesBucket = getProjectImagesBucketName();
const bucketSetupMessage = 'Bucket project-images belum dibuat di Supabase Storage. Buat bucket public bernama project-images terlebih dahulu.';

const legacyCategoryOptions = [
  'Residential Interior',
  'Commercial Interior',
  'Workspace Interior',
  'Retail Interior',
  'Hospitality Interior',
  'Architecture',
  'Renovation',
  'Furniture / Built-in',
];

const designCategoryOptions = ['Interior', 'Architecture', 'Interior & Architecture', 'Furniture / Built-in'];
const designStyleOptions = ['Modern', 'Minimalist', 'Contemporary', 'Japandi', 'Industrial', 'Classic', 'Tropical', 'Luxury', 'Custom'];
const areaTypeOptions = [
  'Living Room',
  'Bedroom',
  'Kitchen',
  'Dining Area',
  'Bathroom',
  'Office',
  'Cafe',
  'Clinic',
  'Retail',
  'Full House',
  'Residential',
  'Commercial',
  'Facade',
  'Landscape',
  'Building Renovation',
];

function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, ' ');
}

function normalizeOption(value: string, options: string[]) {
  const normalized = normalizeText(value);
  const matched = options.find((option) => option.toLowerCase() === normalized.toLowerCase());
  return matched || normalized;
}

function getInitialSelectState(value: string | null | undefined, options: string[]): CustomSelectState {
  const normalized = normalizeOption(value || '', options);
  if (!normalized) return { choice: '', custom: '' };
  if (options.includes(normalized)) return { choice: normalized, custom: '' };
  return { choice: customValue, custom: normalized };
}

function getSelectedValue(state: CustomSelectState, options: string[]) {
  return normalizeOption(state.choice === customValue ? state.custom : state.choice, options);
}

function validateImage(file: File) {
  if (!allowedImageTypes.includes(file.type)) return 'Format gambar harus JPG, PNG, atau WEBP.';
  if (file.size > maxImageSize) return 'Ukuran gambar maksimal 2MB per file.';
  return '';
}

function isBucketMissingError(message?: string) {
  const normalized = (message || '').toLowerCase();
  return normalized.includes('bucket not found') || normalized.includes('bucket') && normalized.includes('not found');
}

function getStorageErrorMessage(message?: string) {
  if (isBucketMissingError(message)) return bucketSetupMessage;
  return message || 'Upload storage gagal. Periksa Supabase Storage dan coba lagi.';
}

function TaxonomySelect({
  label,
  state,
  setState,
  options,
  placeholder,
  customPlaceholder,
  required = false,
}: {
  label: string;
  state: CustomSelectState;
  setState: (state: CustomSelectState) => void;
  options: string[];
  placeholder: string;
  customPlaceholder: string;
  required?: boolean;
}) {
  return (
    <div>
      <label>{label}</label>
      <select
        value={state.choice}
        onChange={(event) => {
          const choice = event.target.value;
          setState({ choice, custom: choice === customValue ? state.custom : '' });
        }}
        required={required}
        className="mt-2 w-full rounded-sm border border-white/10 bg-[#0b0b0a] px-4 py-3 text-sm text-white/78 outline-none transition duration-300 hover:border-[#D4AF37]/35 focus:border-[#D4AF37]/45"
      >
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
        <option value={customValue}>+ Tambah baru</option>
      </select>
      {state.choice === customValue ? (
        <input
          value={state.custom}
          onChange={(event) => setState({ ...state, custom: event.target.value })}
          placeholder={customPlaceholder}
          required={required}
          className="mt-3"
        />
      ) : null}
    </div>
  );
}

export default function ProjectForm({ project }: Props) {
  const router = useRouter();
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [savedProjectId, setSavedProjectId] = useState(project?.id || '');
  const isEditing = Boolean(savedProjectId);
  const [loading, setLoading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [galleryError, setGalleryError] = useState('');
  const [aiError, setAiError] = useState('');
  const [formError, setFormError] = useState('');
  const [pendingGalleryFiles, setPendingGalleryFiles] = useState<File[]>([]);
  const [galleryImages, setGalleryImages] = useState<ProjectImage[]>([...(project?.project_images || [])].sort((a, b) => a.sort_order - b.sort_order));

  const [title, setTitle] = useState(project?.title || '');
  const [slug, setSlug] = useState(project?.slug || slugify(project?.title || ''));
  const [slugEditedManually, setSlugEditedManually] = useState(false);
  const [legacyCategory, setLegacyCategory] = useState<CustomSelectState>(getInitialSelectState(project?.category, legacyCategoryOptions));
  const [designCategory, setDesignCategory] = useState<CustomSelectState>(getInitialSelectState(project?.design_category, designCategoryOptions));
  const [designStyle, setDesignStyle] = useState<CustomSelectState>(getInitialSelectState(project?.design_style, designStyleOptions));
  const [areaType, setAreaType] = useState<CustomSelectState>(getInitialSelectState(project?.area_type, areaTypeOptions));
  const [coverImage, setCoverImage] = useState(project?.cover_image || '');

  const [clientProblemRaw, setClientProblemRaw] = useState('');
  const [designReference, setDesignReference] = useState('');
  const [areaScope, setAreaScope] = useState('');
  const [projectSize, setProjectSize] = useState('');
  const [problem, setProblem] = useState(project?.problem || '');
  const [solution, setSolution] = useState(project?.solution || '');
  const [impact, setImpact] = useState(project?.impact || '');
  const [konteks, setKonteks] = useState(project?.konteks || '');
  const [konflik, setKonflik] = useState(project?.konflik || '');
  const [keputusanDesain, setKeputusanDesain] = useState(project?.keputusan_desain || '');
  const [pendekatan, setPendekatan] = useState(project?.pendekatan || '');
  const [dampak, setDampak] = useState(project?.dampak || project?.impact || '');
  const [insightKunci, setInsightKunci] = useState(project?.insight_kunci || '');

  function syncSlug(nextTitle: string) {
    setTitle(nextTitle);
    if (!slugEditedManually) setSlug(slugify(nextTitle));
  }

  function handleSlugChange(value: string) {
    setSlugEditedManually(true);
    setSlug(slugify(value));
  }

  function getPayload(coverOverride?: string | null) {
    const finalSlug = slug || slugify(title);
    const selectedCategory = getSelectedValue(legacyCategory, legacyCategoryOptions);
    const selectedDesignCategory = getSelectedValue(designCategory, designCategoryOptions);
    const selectedDesignStyle = getSelectedValue(designStyle, designStyleOptions);
    const selectedAreaType = getSelectedValue(areaType, areaTypeOptions);

    if (!normalizeText(title)) throw new Error('Title wajib diisi.');
    if (!finalSlug) throw new Error('Slug wajib diisi.');
    if (!selectedCategory) throw new Error('Category wajib diisi.');
    if (!selectedDesignCategory) throw new Error('Kategori Desain wajib diisi.');
    if (!selectedDesignStyle) throw new Error('Gaya Desain wajib diisi.');
    if (!selectedAreaType) throw new Error('Area/Ruang wajib diisi.');

    return {
      title: normalizeText(title),
      slug: finalSlug,
      category: selectedCategory,
      design_category: selectedDesignCategory,
      design_style: selectedDesignStyle,
      area_type: selectedAreaType,
      cover_image: coverOverride !== undefined ? coverOverride : coverImage || null,
      problem,
      solution,
      impact,
      konteks,
      konflik,
      keputusan_desain: keputusanDesain,
      pendekatan,
      dampak,
      insight_kunci: insightKunci,
    };
  }

  async function ensureProjectExists(coverOverride?: string | null) {
    const supabase = getSupabaseClient();
    const payload = getPayload(coverOverride);

    if (savedProjectId) {
      const { error } = await supabase.from('projects').update(payload).eq('id', savedProjectId);
      if (error) throw error;
      return savedProjectId;
    }

    const { data, error } = await supabase.from('projects').insert(payload).select('id').single();
    if (error) throw error;
    setSavedProjectId(data.id as string);
    setMessage('Project tersimpan. Anda tetap di halaman ini; lanjutkan upload gallery atau klik Simpan Perubahan untuk membuka halaman edit.');
    return data.id as string;
  }

  async function checkProjectImagesBucket() {
    const supabase = getSupabaseClient();
    const { error } = await supabase.storage.from(projectImagesBucket).list('', { limit: 1 });
    if (error) {
      console.error('[ProjectForm] Storage bucket preflight failed', { bucket: projectImagesBucket, message: error.message });
      throw new Error(getStorageErrorMessage(error.message));
    }
  }

  function openGalleryPicker() {
    if (galleryUploading || loading || aiGenerating) return;
    galleryInputRef.current?.click();
  }

  async function setAsCover(imageUrl: string) {
    setCoverImage(imageUrl);
    setMessage('Cover image dipilih dari gallery. Simpan project untuk menyimpan perubahan.');
    if (!savedProjectId) return;

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('projects').update({ cover_image: imageUrl }).eq('id', savedProjectId);
      if (error) throw error;
      setMessage('Cover image berhasil diperbarui.');
    } catch (error) {
      console.error('[ProjectForm] Set cover failed', error);
      setGalleryError(error instanceof Error ? error.message : 'Gagal menyimpan cover image.');
    }
  }

  async function clearCover() {
    setCoverImage('');
    setMessage('Cover image dihapus. Simpan project untuk menyimpan perubahan.');
    if (!savedProjectId) return;

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('projects').update({ cover_image: null }).eq('id', savedProjectId);
      if (error) throw error;
      setMessage('Cover image berhasil dihapus.');
    } catch (error) {
      console.error('[ProjectForm] Clear cover failed', error);
      setGalleryError(error instanceof Error ? error.message : 'Gagal menghapus cover image.');
    }
  }

  async function uploadGalleryFiles(files: File[]) {
    if (files.length === 0) return;

    setGalleryError('');
    setAiError('');
    setFormError('');
    setMessage('');

    const invalidFile = files.find((file) => validateImage(file));
    if (invalidFile) {
      setGalleryError(`${invalidFile.name}: ${validateImage(invalidFile)}`);
      setPendingGalleryFiles(files);
      return;
    }

    const currentSlug = slug || slugify(title);
    if (!currentSlug) {
      setGalleryError('Isi title atau slug terlebih dahulu sebelum upload gallery.');
      setPendingGalleryFiles(files);
      return;
    }

    setGalleryUploading(true);
    try {
      await checkProjectImagesBucket();

      const supabase = getSupabaseClient();
      const projectId = await ensureProjectExists();
      const uploadedImages: ProjectImage[] = [];
      const failedFiles: File[] = [];
      const failureMessages: string[] = [];
      const startOrder = galleryImages.length;

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        if (!file) continue;

        try {
          const filePath = `${currentSlug}/gallery/${createUniqueStorageFileName(file.name)}`;
          const { error: uploadError } = await supabase.storage.from(projectImagesBucket).upload(filePath, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type,
          });

          if (uploadError) {
            console.error('[ProjectForm] Gallery storage upload failed', { path: filePath, message: uploadError.message });
            throw new Error(getStorageErrorMessage(uploadError.message));
          }

          const { data: publicUrl } = supabase.storage.from(projectImagesBucket).getPublicUrl(filePath);
          const { data, error: insertError } = await supabase
            .from('project_images')
            .insert({ project_id: projectId, image_url: publicUrl.publicUrl, alt_text: title || null, sort_order: startOrder + uploadedImages.length })
            .select('id,project_id,image_url,alt_text,sort_order,created_at')
            .single();

          if (insertError) {
            console.error('[ProjectForm] Gallery database insert failed', { projectId, imageUrl: publicUrl.publicUrl, message: insertError.message });
            throw new Error(`Gambar berhasil diupload, tapi gagal disimpan ke database: ${insertError.message}`);
          }

          uploadedImages.push(data as ProjectImage);
        } catch (error) {
          failedFiles.push(file);
          failureMessages.push(`${file.name}: ${error instanceof Error ? error.message : 'Upload gagal.'}`);
        }
      }

      if (uploadedImages.length > 0) {
        setGalleryImages((current) => [...current, ...uploadedImages].sort((a, b) => a.sort_order - b.sort_order));
      }

      if (!coverImage && uploadedImages[0]) {
        setCoverImage(uploadedImages[0].image_url);
        const { error } = await supabase.from('projects').update({ cover_image: uploadedImages[0].image_url }).eq('id', projectId);
        if (error) throw error;
      }

      setPendingGalleryFiles(failedFiles);

      if (failedFiles.length > 0) {
        setGalleryError(failureMessages.join('\n'));
        setMessage(`${uploadedImages.length} gambar berhasil diupload. ${failedFiles.length} gambar gagal. Project dan data form tetap aman.`);
      } else {
        setGalleryError('');
        setMessage(uploadedImages.length > 0 ? 'Gallery images berhasil diupload. Gambar pertama otomatis dipilih sebagai cover jika belum ada cover.' : 'Tidak ada gambar baru yang diupload.');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload gallery gagal.';
      console.error('[ProjectForm] Upload gallery failed', error);
      setPendingGalleryFiles(files);
      setGalleryError(errorMessage);
      setMessage(`Data form tetap aman dan tidak ada redirect. ${errorMessage}`);
    } finally {
      setGalleryUploading(false);
    }
  }

  async function handleGalleryUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    await uploadGalleryFiles(files);
    event.target.value = '';
  }

  async function retryGalleryUpload() {
    await uploadGalleryFiles(pendingGalleryFiles);
  }

  async function updateGalleryAltText(imageId: string, altText: string) {
    setGalleryImages((current) => current.map((image) => (image.id === imageId ? { ...image, alt_text: altText } : image)));
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('project_images').update({ alt_text: altText || null }).eq('id', imageId);
      if (error) throw error;
    } catch (error) {
      console.error('[ProjectForm] Update gallery alt text failed', error);
      setGalleryError(error instanceof Error ? error.message : 'Gagal menyimpan alt text.');
    }
  }

  async function removeGalleryImage(image: ProjectImage) {
    if (!window.confirm('Hapus gambar gallery ini?')) return;
    setGalleryError('');
    setAiError('');

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('project_images').delete().eq('id', image.id);
      if (error) throw error;
      const storagePath = getStoragePathFromPublicUrl(image.image_url, projectImagesBucket);
      if (storagePath) {
        const { error: storageError } = await supabase.storage.from(projectImagesBucket).remove([storagePath]);
        if (storageError) {
          console.error('[ProjectForm] Gallery storage delete failed', { storagePath, message: storageError.message });
          throw new Error(`Database terhapus, tapi gagal hapus file storage: ${storageError.message}`);
        }
      }
      const remainingImages = galleryImages.filter((item) => item.id !== image.id);
      setGalleryImages(remainingImages);

      if (coverImage === image.image_url) {
        const nextCover = remainingImages[0]?.image_url || null;
        setCoverImage(nextCover || '');
        if (savedProjectId) {
          const { error: coverError } = await supabase.from('projects').update({ cover_image: nextCover }).eq('id', savedProjectId);
          if (coverError) throw coverError;
        }
      }
    } catch (error) {
      console.error('[ProjectForm] Remove gallery image failed', error);
      setGalleryError(error instanceof Error ? error.message : 'Gagal menghapus gambar gallery.');
    }
  }

  async function handleGenerateNarrative() {
    setAiError('');
    setMessage('');
    const imageUrls = galleryImages.map((image) => image.image_url).filter(Boolean).slice(0, 4);
    const hasStructuredInput = Boolean(clientProblemRaw.trim() || designReference.trim() || areaScope.trim() || projectSize.trim());
    if (imageUrls.length === 0 && !hasStructuredInput) {
      setAiError('Tambahkan gambar atau konteks project terlebih dahulu.');
      return;
    }

    setAiGenerating(true);
    try {
      const response = await fetch('/api/generate-project-narrative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrls,
          coverImage,
          title,
          category: getSelectedValue(legacyCategory, legacyCategoryOptions),
          client_problem_raw: clientProblemRaw,
          design_reference: designReference,
          area_scope: areaScope,
          project_size: projectSize,
        }),
      });
      const data = (await response.json()) as AiNarrativeResponse;
      if (!response.ok) throw new Error(data.error || 'AI gagal membuat narasi.');
      if (!data.konteks || !data.konflik || !data.keputusan_desain || !data.pendekatan || !data.dampak || !data.insight_kunci) throw new Error('AI menghasilkan data yang tidak lengkap. Coba lagi.');
      const hasManualEdits = Boolean(konteks.trim() || konflik.trim() || keputusanDesain.trim() || pendekatan.trim() || dampak.trim() || insightKunci.trim());
      if (hasManualEdits && !window.confirm('Field case study sudah berisi konten. Timpa dengan hasil AI?')) return;
      setKonteks(data.konteks);
      setKonflik(data.konflik);
      setKeputusanDesain(data.keputusan_desain);
      setPendekatan(data.pendekatan);
      setDampak(data.dampak);
      setInsightKunci(data.insight_kunci);
      setImpact((current) => current || data.dampak || '');
      setMessage('Case study AI berhasil dibuat. Silakan review dan edit sebelum menyimpan.');
    } catch (error) {
      setAiError(error instanceof Error ? error.message : 'AI gagal membuat narasi.');
    } finally {
      setAiGenerating(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setFormError('');

    try {
      const supabase = getSupabaseClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw userError || new Error('Session admin tidak ditemukan.');
      const payload = getPayload();

      if (savedProjectId) {
        const { error } = await supabase.from('projects').update(payload).eq('id', savedProjectId);
        if (error) throw error;
        setMessage('Project berhasil diperbarui.');
        router.push(`/admin/projects/${savedProjectId}/edit`);
      } else {
        const { data, error } = await supabase.from('projects').insert(payload).select('id').single();
        if (error) throw error;
        setSavedProjectId(data.id as string);
        router.push(`/admin/projects/${data.id}/edit`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Gagal menyimpan project.';
      setFormError(errorMessage);
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!savedProjectId || !window.confirm('Hapus project ini? Tindakan ini tidak bisa dibatalkan.')) return;
    setLoading(true);
    setMessage('');
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('projects').delete().eq('id', savedProjectId);
      if (error) throw error;
      router.push('/admin/projects');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal menghapus project.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="grid gap-6 rounded-sm border border-white/10 bg-white/[0.025] p-6 md:grid-cols-2 md:p-8">
        <div>
          <label>Title</label>
          <input value={title} onChange={(event) => syncSlug(event.target.value)} required />
        </div>
        <div>
          <label>Slug</label>
          <input value={slug} onChange={(event) => handleSlugChange(event.target.value)} required />
          <p className="mt-2 text-xs leading-5 text-white/38">Slug otomatis dibuat dari title dan digunakan sebagai URL project.</p>
        </div>
        <TaxonomySelect label="Category" state={legacyCategory} setState={setLegacyCategory} options={legacyCategoryOptions} placeholder="Pilih kategori project" customPlaceholder="Contoh: Clinic Interior" required />
        <TaxonomySelect label="Kategori Desain" state={designCategory} setState={setDesignCategory} options={designCategoryOptions} placeholder="Pilih kategori desain" customPlaceholder="Contoh: Interior Branding" required />
        <TaxonomySelect label="Gaya Desain" state={designStyle} setState={setDesignStyle} options={designStyleOptions} placeholder="Pilih gaya desain" customPlaceholder="Contoh: Scandinavian" required />
        <TaxonomySelect label="Area/Ruang" state={areaType} setState={setAreaType} options={areaTypeOptions} placeholder="Pilih area/ruang" customPlaceholder="Contoh: Beauty Treatment Room" required />
        {formError ? <p className="md:col-span-2 text-sm leading-6 text-red-300">{formError}</p> : null}
      </div>

      <div className="rounded-sm border border-white/10 bg-white/[0.025] p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <label>Project Gallery</label>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-white/42">Upload multiple images untuk halaman detail project. Pilih salah satu gambar dari gallery sebagai cover thumbnail.</p>
          </div>
          <div>
            <input ref={galleryInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleGalleryUpload} disabled={galleryUploading || loading || aiGenerating} className="hidden" />
            <button type="button" onClick={openGalleryPicker} disabled={galleryUploading || loading || aiGenerating} className="inline-flex items-center gap-3 rounded-[4px] border border-white/12 bg-white/[0.02] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/68 transition duration-300 hover:border-[#D4AF37]/40 hover:text-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50">
              <ImagePlus size={16} /> {galleryUploading ? 'Uploading...' : 'Upload Gallery'}
            </button>
          </div>
        </div>
        {coverImage ? (
          <div className="mt-6 flex flex-col gap-3 rounded-sm border border-[#D4AF37]/20 bg-[#D4AF37]/[0.035] p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 text-sm text-[#D4AF37]"><Star size={16} /><span>Cover image sudah dipilih dari gallery.</span></div>
            <button type="button" onClick={clearCover} className="self-start font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white/50 transition hover:text-red-200 md:self-auto">Clear Cover</button>
          </div>
        ) : <div className="mt-6 rounded-sm border border-white/10 bg-black/10 p-4 text-sm leading-6 text-white/42">Belum ada cover. Upload gallery lalu pilih satu gambar sebagai cover.</div>}
        {galleryError ? (
          <div className="mt-4 rounded-sm border border-red-400/20 bg-red-500/10 p-4">
            <p className="whitespace-pre-line text-sm leading-6 text-red-200">{galleryError}</p>
            {pendingGalleryFiles.length > 0 ? (
              <button
                type="button"
                onClick={retryGalleryUpload}
                disabled={galleryUploading || loading || aiGenerating}
                className="mt-4 inline-flex items-center justify-center rounded-sm border border-red-300/25 px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-red-100 transition duration-300 hover:border-[#D4AF37]/40 hover:text-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Coba Upload Lagi
              </button>
            ) : null}
          </div>
        ) : null}
        {galleryUploading ? <p className="mt-4 text-sm text-[#D4AF37]">Uploading gallery images...</p> : null}
        {galleryImages.length > 0 ? (
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {galleryImages.map((image) => {
              const isCover = coverImage === image.image_url;
              return (
                <div key={image.id} className={`overflow-hidden rounded-sm border bg-black/20 transition duration-300 ${isCover ? 'border-[#D4AF37]/70 shadow-[0_18px_44px_rgba(212,175,55,0.08)]' : 'border-white/10 hover:border-[#D4AF37]/25'}`}>
                  <div className="relative">
                    <img src={image.image_url} alt={image.alt_text || title || 'Project gallery'} className="aspect-[4/3] w-full object-cover" />
                    {isCover ? <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#080807]"><Star size={12} /> Cover</div> : null}
                  </div>
                  <div className="space-y-3 p-4">
                    <div><label>Alt Text</label><input value={image.alt_text || ''} onChange={(event) => updateGalleryAltText(image.id, event.target.value)} placeholder="Caption / alt text" /></div>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => setAsCover(image.image_url)} className={`inline-flex items-center gap-2 rounded-sm border px-3 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] transition duration-300 ${isCover ? 'border-[#D4AF37]/40 text-[#D4AF37]' : 'border-white/10 text-white/52 hover:border-[#D4AF37]/35 hover:text-[#D4AF37]'}`}><Star size={13} /> {isCover ? 'Selected Cover' : 'Set as Cover'}</button>
                      <button type="button" onClick={() => removeGalleryImage(image)} className="inline-flex items-center gap-2 rounded-sm border border-white/10 px-3 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white/52 transition duration-300 hover:border-red-400/30 hover:text-red-200"><X size={13} /> Remove</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <div className="mt-8 rounded-sm border border-dashed border-white/10 p-8 text-center text-sm leading-6 text-white/42">Belum ada gallery images.</div>}
      </div>

      <div className="rounded-sm border border-white/10 bg-white/[0.025] p-6 md:p-8">
        <div className="mb-6"><label>Structured Input for AI</label><p className="mt-1 max-w-2xl text-sm leading-6 text-white/42">Input ini tidak disimpan ke database. Dipakai hanya untuk membantu AI menyusun narasi yang lebih akurat.</p></div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2"><label>Client Problem Raw</label><textarea value={clientProblemRaw} onChange={(event) => setClientProblemRaw(event.target.value)} placeholder="Tuliskan problem awal dari klien secara mentah, misalnya: ruang terasa sempit, flow tidak nyaman, storage kurang, dsb." /></div>
          <div><label>Design Reference</label><textarea value={designReference} onChange={(event) => setDesignReference(event.target.value)} placeholder="Arah referensi desain, mood, style, material, atau benchmark yang diinginkan." /></div>
          <div><label>Area Scope</label><textarea value={areaScope} onChange={(event) => setAreaScope(event.target.value)} placeholder="Area yang didesain, misalnya living room, pantry, bedroom, workspace, lobby, dsb." /></div>
          <div className="md:col-span-2"><label>Project Size</label><input value={projectSize} onChange={(event) => setProjectSize(event.target.value)} placeholder="Contoh: 36 m², 120 m², tipe 45, 2 lantai" /></div>
        </div>
      </div>

      <div className="rounded-sm border border-[#D4AF37]/20 bg-[#D4AF37]/[0.035] p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div><label>AI Narrative Generator</label><p className="mt-1 max-w-2xl text-sm leading-6 text-white/50">AI menggabungkan brief, reference, scope, ukuran project, dan gallery untuk menyusun 6 section case study.</p></div>
          <button type="button" onClick={handleGenerateNarrative} disabled={aiGenerating || galleryUploading || loading} className="inline-flex items-center justify-center gap-3 rounded-[4px] bg-[#D4AF37] px-6 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#080807] transition hover:bg-[#E2C866] disabled:cursor-not-allowed disabled:opacity-60"><Sparkles size={17} />{aiGenerating ? 'Generating...' : 'Generate Case Study dengan AI'}</button>
        </div>
        {aiGenerating ? <p className="mt-5 text-sm leading-6 text-[#D4AF37]">AI sedang membaca input dan menyusun narasi...</p> : null}
        {aiError ? <p className="mt-5 text-sm leading-6 text-red-300">{aiError}</p> : null}
      </div>

      <div className="grid gap-6 rounded-sm border border-white/10 bg-white/[0.025] p-6 md:p-8">
        <div><label>Konteks</label><textarea maxLength={800} value={konteks} onChange={(event) => setKonteks(event.target.value)} placeholder="Latar belakang project, batasan, dan konteks awal." /></div>
        <div><label>Konflik</label><textarea maxLength={800} value={konflik} onChange={(event) => setKonflik(event.target.value)} placeholder="Konflik utama yang menghambat performa ruang." /></div>
        <div><label>Keputusan Desain</label><textarea maxLength={1200} value={keputusanDesain} onChange={(event) => setKeputusanDesain(event.target.value)} placeholder="Keputusan desain yang dipilih dan alasan strategisnya." /></div>
        <div><label>Pendekatan</label><textarea maxLength={1200} value={pendekatan} onChange={(event) => setPendekatan(event.target.value)} placeholder="Pendekatan implementasi dari analisis hingga eksekusi." /></div>
        <div><label>Dampak</label><textarea maxLength={800} value={dampak} onChange={(event) => setDampak(event.target.value)} placeholder="Dampak nyata untuk pengguna/operasional." /></div>
        <div><label>Insight Kunci</label><textarea maxLength={500} value={insightKunci} onChange={(event) => setInsightKunci(event.target.value)} placeholder="Pelajaran utama dan prinsip yang bisa direplikasi." /></div>
        <div><label>Problem (Legacy)</label><textarea value={problem} onChange={(event) => setProblem(event.target.value)} placeholder="Masalah utama project secara ringkas dan jelas." /></div>
        <div><label>Solution (Legacy)</label><textarea value={solution} onChange={(event) => setSolution(event.target.value)} placeholder="Keputusan desain / solusi strategis yang diambil." /></div>
        <div><label>Impact (Legacy)</label><textarea value={impact} onChange={(event) => setImpact(event.target.value)} placeholder="Dampak legacy untuk kompatibilitas data lama." /></div>
      </div>

      {message ? <p className="text-sm leading-6 text-white/70">{message}</p> : null}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <button disabled={loading || galleryUploading || aiGenerating} type="submit" className="rounded-[4px] bg-[#D4AF37] px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#080807] transition hover:bg-[#E2C866] disabled:opacity-60">{loading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Buat Project'}</button>
        {isEditing ? <button disabled={loading || galleryUploading || aiGenerating} type="button" onClick={handleDelete} className="rounded-[4px] border border-red-400/30 px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-red-200 transition hover:bg-red-500/10 disabled:opacity-60">Hapus Project</button> : null}
      </div>
    </form>
  );
}
