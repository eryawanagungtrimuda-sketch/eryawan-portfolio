'use client';

import { ChangeEvent, FormEvent, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, Sparkles, Star, X } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import { createUniqueStorageFileName, getProjectImagesBucketName, getStoragePathFromPublicUrl } from '@/lib/storage';
import { getAreaTagLabel } from '@/lib/area-tags';
import { DEFAULT_CROP_X, DEFAULT_CROP_Y, DEFAULT_CROP_ZOOM, DisplayRatio, getDisplayRatioNumber, getGalleryImageFrameStyle, getGalleryImageStyle, normalizeCropX, normalizeCropY, normalizeCropZoom, ObjectPosition } from '@/lib/project-image-display';
import type { Project, ProjectImage } from '@/lib/types';

type Props = { project?: Project };
type AiNarrativeResponse = { konteks?: string; konflik?: string; keputusan_desain?: string; pendekatan?: string; dampak?: string; insight_kunci?: string; error?: string };
type CustomSelectState = { choice: string; custom: string };
type ApiJsonResult = { id?: string; error?: string };
type UploadQueueStatus = 'pending' | 'uploading' | 'saved' | 'failed';
type UploadQueueItem = { key: string; name: string; status: UploadQueueStatus; error?: string };
type GalleryCropDraft = { imageId: string; display_ratio: DisplayRatio; crop_x: number; crop_y: number; crop_zoom: number };

const maxImageSize = 2 * 1024 * 1024;
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
const customValue = '__custom__';
const projectImagesBucket = getProjectImagesBucketName();
const bucketSetupMessage = 'Bucket project-images belum dibuat di Supabase Storage. Buat bucket public bernama project-images terlebih dahulu.';
const storagePolicyMessage = 'Tidak punya izin upload ke Supabase Storage. Kemungkinan storage policy belum dijalankan di schema.sql atau session admin tidak valid.';
const authSessionMessage = 'Session admin tidak aktif atau sudah expired. Login ulang ke /admin/login lalu coba upload lagi.';
const adminEmailMismatchMessage = 'Akun yang login bukan email admin yang diizinkan. Logout lalu login dengan email admin yang terdaftar di NEXT_PUBLIC_ADMIN_EMAIL.';

const legacyCategoryOptions = [
  'Residential Interior',
  'Commercial Interior',
  'Office / Workspace Interior',
  'Hospitality Interior',
  'Retail Interior',
  'Healthcare / Clinic Interior',
  'Public / Government Interior',
  'Education Interior',
  'Mixed-Use Interior',
  'Furniture / Built-in',
  'Renovation',
  'Architecture',
  'Concept Design',
  'Custom',
];

const designCategoryOptions = ['Interior', 'Architecture', 'Interior & Architecture', 'Furniture / Built-in'];
const designStyleOptions = ['Modern', 'Minimalist', 'Contemporary', 'Japandi', 'Industrial', 'Classic', 'Tropical', 'Luxury', 'Custom'];
const projectStatusOptions = [
  { value: 'konsep', label: 'Konsep' },
  { value: 'berjalan', label: 'Berjalan' },
  { value: 'selesai', label: 'Selesai' },
] as const;
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
const areaTagOptions = [
  'Lobby', 'Reception', 'Waiting Area', 'Living Room', 'Dining Area', 'Kitchen', 'Bedroom', 'Bathroom', 'Workspace',
  'Meeting Room', 'Consultation Room', 'Treatment Room', 'Retail Area', 'Display Area', 'Cafe Area', 'Pantry', 'Corridor',
  'Facade', 'Outdoor Area', 'Public Service Area', 'Furniture / Built-in', 'Other',
];
const displayRatioOptions = [
  { value: 'landscape', label: 'Landscape' },
  { value: 'wide', label: 'Wide' },
  { value: 'square', label: 'Square' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'tall', label: 'Tall' },
] as const;

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

function normalizeImageUrl(url?: string | null) {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    parsed.hash = '';
    parsed.search = '';
    return parsed.toString().replace(/\/$/, '');
  } catch {
    return trimmed.replace(/[?#].*$/, '').replace(/\/$/, '');
  }
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
  if (!allowedImageTypes.includes(file.type)) return 'Format gambar tidak didukung. Gunakan JPG, PNG, atau WEBP.';
  if (file.size > maxImageSize) return 'Ukuran gambar terlalu besar. Maksimal 2MB per file.';
  return '';
}

function getFileDuplicateKey(file: File) {
  return `${file.name}__${file.size}__${file.lastModified}`;
}

function isBucketMissingError(message?: string) {
  const normalized = (message || '').toLowerCase();
  return normalized.includes('bucket not found') || normalized.includes('bucket') && normalized.includes('not found');
}

function getStorageErrorMessage(message?: string) {
  const normalized = (message || '').toLowerCase();
  if (isBucketMissingError(message)) return bucketSetupMessage;
  if (normalized.includes('permission denied') || normalized.includes('not allowed') || normalized.includes('row-level security') || normalized.includes('rls')) {
    return storagePolicyMessage;
  }
  return message || 'Upload storage gagal. Periksa Supabase Storage dan coba lagi.';
}

function getProjectImageInsertErrorMessage(message?: string) {
  const normalized = (message || '').toLowerCase();
  if (normalized.includes('row-level security') || normalized.includes('rls') || normalized.includes('permission denied')) {
    return 'File sudah masuk ke Storage, tetapi insert ke tabel project_images ditolak (RLS/policy). Jalankan ulang schema.sql agar policy project_images aktif.';
  }
  return `File sudah masuk ke Storage, tetapi gagal membuat record project_images: ${message || 'unknown database error'}`;
}

async function readJsonSafely(response: Response): Promise<{ isJson: boolean; data: ApiJsonResult | null }> {
  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  if (!contentType.includes('application/json')) return { isJson: false, data: null };

  const bodyText = await response.text();
  if (!bodyText.trim()) return { isJson: true, data: null };

  try {
    return { isJson: true, data: JSON.parse(bodyText) as ApiJsonResult };
  } catch {
    return { isJson: true, data: null };
  }
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
        <option value={customValue}>Custom</option>
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

function toSentenceCase(value: string) {
  const normalized = normalizeText(value);
  if (!normalized) return '';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1).toLowerCase();
}

function buildGalleryAltText({
  projectTitle,
  imageAreaTags,
  projectCategory,
  designCategory,
  designStyle,
}: {
  projectTitle: string;
  imageAreaTags: string[];
  projectCategory?: string;
  designCategory?: string;
  designStyle?: string;
}) {
  const cleanedTitle = normalizeText(projectTitle) || 'project ini';
  const style = toSentenceCase(designStyle || '') || 'modern';
  const tags = Array.from(new Set((imageAreaTags || []).map((tag) => normalizeText(getAreaTagLabel(tag))).filter(Boolean)));
  const primaryArea = tags[0] ? toSentenceCase(tags[0]) : '';
  const secondaryArea = tags[1] ? toSentenceCase(tags[1]) : '';
  const categoryHint = toSentenceCase(designCategory || projectCategory || '');

  if (primaryArea && secondaryArea) {
    return `Area ${primaryArea} dan ${secondaryArea} ${cleanedTitle} dengan pendekatan interior ${style}.`;
  }
  if (primaryArea) {
    return `${primaryArea} ${cleanedTitle} dengan nuansa interior ${style} dan tata ruang yang rapi.`;
  }
  if (categoryHint) {
    return `Visual ${categoryHint.toLowerCase()} ${cleanedTitle} dengan suasana ruang ${style.toLowerCase()} yang nyaman.`;
  }
  return `Visual interior ${cleanedTitle} dengan suasana ruang ${style.toLowerCase()} yang nyaman.`;
}

export default function ProjectForm({ project }: Props) {
  const router = useRouter();
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [savedProjectId, setSavedProjectId] = useState(project?.id || '');
  const isEditing = Boolean(savedProjectId);
  const [loading, setLoading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [coverUpdatingId, setCoverUpdatingId] = useState('');
  const [deletingImageId, setDeletingImageId] = useState('');
  const [reorderingImageId, setReorderingImageId] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [galleryError, setGalleryError] = useState('');
  const [aiError, setAiError] = useState('');
  const [formError, setFormError] = useState('');
  const [pendingGalleryFiles, setPendingGalleryFiles] = useState<File[]>([]);
  const [uploadQueueItems, setUploadQueueItems] = useState<UploadQueueItem[]>([]);
  const [galleryImages, setGalleryImages] = useState<ProjectImage[]>([...(project?.project_images || [])].map((image) => ({ ...image, display_ratio: image.display_ratio || 'landscape', object_position: image.object_position || 'center', crop_x: normalizeCropX(image.crop_x), crop_y: normalizeCropY(image.crop_y), crop_zoom: normalizeCropZoom(image.crop_zoom) })).sort((a, b) => a.sort_order - b.sort_order));
  const [activeCropEditor, setActiveCropEditor] = useState<GalleryCropDraft | null>(null);
  const [cropSaving, setCropSaving] = useState(false);

  const [title, setTitle] = useState(project?.title || '');
  const [slug, setSlug] = useState(project?.slug || slugify(project?.title || ''));
  const [slugEditedManually, setSlugEditedManually] = useState(false);
  const [legacyCategory, setLegacyCategory] = useState<CustomSelectState>(getInitialSelectState(project?.category, legacyCategoryOptions));
  const [designCategory, setDesignCategory] = useState<CustomSelectState>(getInitialSelectState(project?.design_category, designCategoryOptions));
  const [designStyle, setDesignStyle] = useState<CustomSelectState>(getInitialSelectState(project?.design_style, designStyleOptions));
  const [areaType, setAreaType] = useState<CustomSelectState>(getInitialSelectState(project?.area_type, areaTypeOptions));
  const [areaTags, setAreaTags] = useState<string[]>(
    project?.area_tags && project.area_tags.length > 0
      ? project.area_tags
      : project?.area_type
        ? [project.area_type]
        : [],
  );
  const [customAreaTag, setCustomAreaTag] = useState('');
  const [coverImage, setCoverImage] = useState(project?.cover_image || '');
  const [customImageAreaTags, setCustomImageAreaTags] = useState<Record<string, string>>({});
  const [expandedImageTagPanels, setExpandedImageTagPanels] = useState<Record<string, boolean>>({});
  const [bulkAltUpdating, setBulkAltUpdating] = useState(false);

  const [clientProblemRaw, setClientProblemRaw] = useState(project?.client_problem_raw || '');
  const [designReference, setDesignReference] = useState(project?.design_reference || '');
  const [areaScope, setAreaScope] = useState(project?.area_scope || '');
  const [projectSize, setProjectSize] = useState(project?.project_size || '');
  const [problem, setProblem] = useState(project?.problem || '');
  const [solution, setSolution] = useState(project?.solution || '');
  const [impact, setImpact] = useState(project?.impact || '');
  const [konteks, setKonteks] = useState(project?.konteks || '');
  const [konflik, setKonflik] = useState(project?.konflik || '');
  const [keputusanDesain, setKeputusanDesain] = useState(project?.keputusan_desain || '');
  const [pendekatan, setPendekatan] = useState(project?.pendekatan || '');
  const [dampak, setDampak] = useState(project?.dampak || project?.impact || '');
  const [insightKunci, setInsightKunci] = useState(project?.insight_kunci || '');
  const [projectStatus, setProjectStatus] = useState<'konsep' | 'berjalan' | 'selesai' | ''>(project?.project_status || '');
  const [completionYear, setCompletionYear] = useState(project?.completion_year?.toString() || '');


  useEffect(() => {
    if (!savedProjectId || !coverImage || coverUpdatingId || galleryImages.length === 0) return;
    const normalizedCover = normalizeImageUrl(coverImage);
    const coverStillExists = galleryImages.some((image) => normalizeImageUrl(image.image_url) === normalizedCover);
    if (coverStillExists) return;

    const nextCover = galleryImages[0]?.image_url || '';
    if (!nextCover) return;

    setCoverImage(nextCover);
    setMessage('Cover sebelumnya tidak ditemukan. Cover otomatis dipindahkan ke gambar gallery pertama.');

    (async () => {
      try {
        const supabase = getSupabaseClient();
        const { error } = await supabase.from('projects').update({ cover_image: nextCover }).eq('id', savedProjectId);
        if (error) throw error;
      } catch (error) {
        console.error('[ProjectForm] Auto-fix cover failed', error);
        setGalleryError('Cover image tidak ditemukan dan gagal diperbarui otomatis. Silakan pilih ulang cover.');
      }
    })();
  }, [coverImage, coverUpdatingId, galleryImages, savedProjectId]);

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
    const normalizedAreaTags = Array.from(new Set(areaTags.map((tag) => normalizeText(tag)).filter(Boolean)));
    const nextAreaType = normalizedAreaTags[0] || selectedAreaType || project?.area_type || '';

    if (!normalizeText(title)) throw new Error('Title wajib diisi.');
    if (!finalSlug) throw new Error('Slug wajib diisi.');
    if (!selectedCategory) throw new Error('Category wajib diisi.');
    if (!selectedDesignCategory) throw new Error('Kategori Desain wajib diisi.');
    if (!selectedDesignStyle) throw new Error('Gaya Desain wajib diisi.');
    if (!selectedAreaType && normalizedAreaTags.length === 0) throw new Error('Area/Ruang Tags wajib diisi.');

    return {
      title: normalizeText(title),
      slug: finalSlug,
      category: selectedCategory,
      design_category: selectedDesignCategory,
      design_style: selectedDesignStyle,
      area_type: nextAreaType,
      area_tags: normalizedAreaTags,
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
      project_status: projectStatus || null,
      completion_year: completionYear.trim() ? Number.parseInt(completionYear.trim(), 10) || null : null,
      client_problem_raw: clientProblemRaw || null,
      design_reference: designReference || null,
      area_scope: areaScope || null,
      project_size: projectSize || null,
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
    if (!error) return;

    if (isBucketMissingError(error.message)) {
      console.error('[ProjectForm] Storage bucket preflight failed', { bucket: projectImagesBucket, message: error.message });
      throw new Error(getStorageErrorMessage(error.message));
    }

    console.warn('[ProjectForm] Storage bucket preflight skipped due to policy/permission', {
      bucket: projectImagesBucket,
      message: error.message,
    });
  }

  function openGalleryPicker() {
    if (galleryUploading || loading || aiGenerating) return;
    galleryInputRef.current?.click();
  }

  async function setExistingGalleryImageAsCover(image: ProjectImage) {
    if (!image.image_url || coverUpdatingId || deletingImageId) return;
    const nextCover = normalizeImageUrl(image.image_url);
    const previousCover = coverImage;
    if (!nextCover || normalizeImageUrl(coverImage) === nextCover) return;
    setGalleryError('');
    setCoverUpdatingId(image.id);
    setCoverImage(image.image_url);
    setMessage('Cover project diperbarui dari gallery.');
    if (!savedProjectId) {
      setCoverUpdatingId('');
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('projects').update({ cover_image: image.image_url }).eq('id', savedProjectId);
      if (error) throw error;
    } catch (error) {
      console.error('[ProjectForm] Set cover failed', error);
      setCoverImage(previousCover);
      setGalleryError('Cover belum berhasil diperbarui. Silakan coba lagi.');
    } finally {
      setCoverUpdatingId('');
    }
  }

  async function clearCover() {
    if (coverUpdatingId) return;
    setGalleryError('');
    setCoverUpdatingId('__clear__');
    setCoverImage('');
    setMessage('Cover image dihapus. Simpan project untuk menyimpan perubahan.');
    if (!savedProjectId) {
      setCoverUpdatingId('');
      return;
    }

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('projects').update({ cover_image: null }).eq('id', savedProjectId);
      if (error) throw error;
      setMessage('Cover image berhasil dihapus.');
    } catch (error) {
      console.error('[ProjectForm] Clear cover failed', error);
      setGalleryError(error instanceof Error ? error.message : 'Gagal menghapus cover image.');
    } finally {
      setCoverUpdatingId('');
    }
  }

  async function validateAdminSessionForUpload() {
    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw new Error(authSessionMessage);

    const activeEmail = data.user.email?.trim().toLowerCase();
    const allowedAdminEmail = (process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'eryawanagungtrimuda@gmail.com').trim().toLowerCase();
    if (!activeEmail || activeEmail !== allowedAdminEmail) throw new Error(adminEmailMismatchMessage);
  }

  async function uploadGalleryFiles(files: File[]) {
    if (galleryUploading || files.length === 0) return;

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
    setUploadQueueItems(files.map((file) => ({ key: getFileDuplicateKey(file), name: file.name, status: 'pending' })));
    try {
      await validateAdminSessionForUpload();
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
        const fileKey = getFileDuplicateKey(file);

        try {
          setUploadQueueItems((current) => current.map((item) => (item.key === fileKey ? { ...item, status: 'uploading', error: '' } : item)));
          const filePath = `${currentSlug}/${createUniqueStorageFileName(file.name)}`;
          const { error: uploadError } = await supabase.storage.from(projectImagesBucket).upload(filePath, file, {
            cacheControl: '3600',
            upsert: false,
            contentType: file.type,
          });

          if (uploadError) {
            console.error('[ProjectForm] Gallery storage upload failed', { path: filePath, message: uploadError.message });
            throw new Error(getStorageErrorMessage(uploadError.message));
          }

          const { data: publicUrl } = supabase.storage.from(projectImagesBucket).getPublicUrl(filePath);
          const { data, error: insertError } = await supabase
            .from('project_images')
            .insert({ project_id: projectId, image_url: publicUrl.publicUrl, alt_text: title || null, sort_order: startOrder + uploadedImages.length, area_tags: [], display_ratio: 'landscape', object_position: 'center', crop_x: DEFAULT_CROP_X, crop_y: DEFAULT_CROP_Y, crop_zoom: DEFAULT_CROP_ZOOM })
            .select('id,project_id,image_url,alt_text,sort_order,area_tags,display_ratio,object_position,crop_x,crop_y,crop_zoom,created_at')
            .single();

          if (insertError) {
            console.error('[ProjectForm] Gallery database insert failed', { projectId, imageUrl: publicUrl.publicUrl, message: insertError.message });
            const { error: rollbackError } = await supabase.storage.from(projectImagesBucket).remove([filePath]);
            if (rollbackError) {
              console.error('[ProjectForm] Gallery rollback remove failed', { path: filePath, message: rollbackError.message });
              throw new Error('Upload gagal dan file sementara mungkin perlu dibersihkan manual.');
            }
            throw new Error(getProjectImageInsertErrorMessage(insertError.message));
          }

          uploadedImages.push(data as ProjectImage);
          setUploadQueueItems((current) => current.map((item) => (item.key === fileKey ? { ...item, status: 'saved', error: '' } : item)));
        } catch (error) {
          console.error(error);
          failedFiles.push(file);
          const itemError = error instanceof Error ? error.message : 'Upload gagal.';
          failureMessages.push(`${file.name}: ${itemError}`);
          setUploadQueueItems((current) => current.map((item) => (item.key === fileKey ? { ...item, status: 'failed', error: itemError } : item)));
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
      console.error(error);
      setPendingGalleryFiles(files);
      setGalleryError(errorMessage);
      setMessage(`Data form tetap aman dan tidak ada redirect. ${errorMessage}`);
    } finally {
      setGalleryUploading(false);
    }
  }

  async function handleGalleryUpload(event: ChangeEvent<HTMLInputElement>) {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length === 0) {
      event.target.value = '';
      return;
    }

    const existingPendingKeys = new Set(pendingGalleryFiles.map((file) => getFileDuplicateKey(file)));
    const processedKeys = new Set<string>();
    const dedupedFiles: File[] = [];
    let hasDuplicate = false;

    selectedFiles.forEach((file) => {
      const key = getFileDuplicateKey(file);
      if (processedKeys.has(key) || existingPendingKeys.has(key)) {
        hasDuplicate = true;
        return;
      }
      processedKeys.add(key);
      dedupedFiles.push(file);
    });

    if (hasDuplicate) {
      setMessage('Beberapa gambar duplikat dilewati.');
    }

    if (dedupedFiles.length === 0) {
      setGalleryError('Tidak ada file baru untuk diupload.');
      event.target.value = '';
      return;
    }

    await uploadGalleryFiles(dedupedFiles);
    event.target.value = '';
  }

  async function retryGalleryUpload() {
    await uploadGalleryFiles(pendingGalleryFiles);
  }

  async function updateGalleryImageMeta(imageId: string, updates: { alt_text?: string | null; area_tags?: string[]; display_ratio?: DisplayRatio; object_position?: ObjectPosition }) {
    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('project_images').update(updates).eq('id', imageId);
      if (error) throw error;
    } catch (error) {
      console.error('[ProjectForm] Update gallery image meta failed', error);
      setGalleryError(error instanceof Error ? error.message : 'Gagal menyimpan metadata gambar.');
      throw error;
    }
  }

  async function updateGalleryAltText(imageId: string, altText: string) {
    setGalleryImages((current) => current.map((image) => (image.id === imageId ? { ...image, alt_text: altText } : image)));
    await updateGalleryImageMeta(imageId, { alt_text: altText || null });
  }

  async function updateGalleryImageAreaTags(imageId: string, tags: string[]) {
    const normalizedTags = Array.from(new Set(tags.map((tag) => normalizeText(tag)).filter(Boolean)));
    setGalleryImages((current) => current.map((image) => (image.id === imageId ? { ...image, area_tags: normalizedTags } : image)));
    await updateGalleryImageMeta(imageId, { area_tags: normalizedTags });
  }

  async function handleGenerateGalleryAltText(mode: 'fill-empty' | 'overwrite-all') {
    if (bulkAltUpdating || galleryUploading || loading || aiGenerating) return;
    if (galleryImages.length === 0) {
      setGalleryError('Belum ada gallery images.');
      return;
    }
    if (mode === 'overwrite-all' && !window.confirm('Timpa semua alt text gambar gallery?')) return;

    const projectTitle = normalizeText(title);
    const projectCategory = getSelectedValue(legacyCategory, legacyCategoryOptions);
    const selectedDesignCategory = getSelectedValue(designCategory, designCategoryOptions);
    const selectedDesignStyle = getSelectedValue(designStyle, designStyleOptions);
    const shouldUpdate = (image: ProjectImage) => {
      if (mode === 'overwrite-all') return true;
      const currentAlt = normalizeText(image.alt_text || '');
      return !currentAlt || (projectTitle && currentAlt === projectTitle);
    };

    const targets = galleryImages.filter(shouldUpdate);
    if (targets.length === 0) {
      setMessage('Tidak ada alt text yang perlu diperbarui.');
      return;
    }

    const snapshot = galleryImages;
    const generatedAltById = new Map(targets.map((image) => [image.id, buildGalleryAltText({
      projectTitle,
      imageAreaTags: image.area_tags || [],
      projectCategory,
      designCategory: selectedDesignCategory,
      designStyle: selectedDesignStyle,
    })]));

    const nextImages = galleryImages.map((image) => (
      generatedAltById.has(image.id)
        ? { ...image, alt_text: generatedAltById.get(image.id) || image.alt_text }
        : image
    ));

    setGalleryError('');
    setMessage('');
    setBulkAltUpdating(true);
    setGalleryImages(nextImages);

    try {
      const supabase = getSupabaseClient();
      const results = await Promise.all(
        targets.map((image) => supabase.from('project_images').update({ alt_text: generatedAltById.get(image.id) || null }).eq('id', image.id)),
      );
      const updateError = results.find((result) => result.error)?.error;
      if (updateError) throw updateError;
      setMessage('Alt text gallery berhasil diperbarui.');
    } catch (error) {
      console.error('[ProjectForm] Bulk generate alt text failed', error);
      setGalleryImages(snapshot);
      setGalleryError('Alt text gagal diperbarui. Silakan coba lagi.');
    } finally {
      setBulkAltUpdating(false);
    }
  }
  async function updateGalleryDisplaySettings(imageId: string, updates: { display_ratio?: DisplayRatio; object_position?: ObjectPosition; crop_x?: number; crop_y?: number; crop_zoom?: number }) {
    setGalleryError('');
    const previousImage = galleryImages.find((image) => image.id === imageId);
    setGalleryImages((current) => current.map((image) => (image.id === imageId ? { ...image, ...updates } : image)));
    try {
      await updateGalleryImageMeta(imageId, updates);
      setMessage('Tampilan gambar tersimpan.');
    } catch (error) {
      setGalleryImages((current) => current.map((image) => (image.id === imageId ? { ...image, display_ratio: previousImage?.display_ratio || 'landscape', object_position: previousImage?.object_position || 'center', crop_x: normalizeCropX(previousImage?.crop_x), crop_y: normalizeCropY(previousImage?.crop_y), crop_zoom: normalizeCropZoom(previousImage?.crop_zoom) } : image)));
      setGalleryError('Tampilan gambar gagal disimpan. Silakan coba lagi.');
    }
  }

  async function saveCropSettings() {
    if (!activeCropEditor || cropSaving) return;
    const nextPayload = {
      display_ratio: activeCropEditor.display_ratio,
      crop_x: normalizeCropX(activeCropEditor.crop_x),
      crop_y: normalizeCropY(activeCropEditor.crop_y),
      crop_zoom: normalizeCropZoom(activeCropEditor.crop_zoom),
      object_position: 'center' as ObjectPosition,
    };
    setCropSaving(true);
    setGalleryError('');
    try {
      await updateGalleryDisplaySettings(activeCropEditor.imageId, nextPayload);
      setMessage('Crop gambar berhasil disimpan.');
      setActiveCropEditor(null);
    } catch {
      setGalleryError('Crop gambar gagal disimpan. Silakan coba lagi.');
    } finally {
      setCropSaving(false);
    }
  }


  function normalizeGalleryOrder(images: ProjectImage[]) {
    return images.map((image, index) => ({ ...image, sort_order: index }));
  }

  async function reorderGalleryImage(imageId: string, direction: 'previous' | 'next') {
    if (reorderingImageId || galleryImages.length <= 1) return;

    const currentImages = normalizeGalleryOrder(galleryImages);
    const currentIndex = currentImages.findIndex((image) => image.id === imageId);
    if (currentIndex === -1) return;

    const swapIndex = direction === 'previous' ? currentIndex - 1 : currentIndex + 1;
    if (swapIndex < 0 || swapIndex >= currentImages.length) return;

    const nextImages = [...currentImages];
    [nextImages[currentIndex], nextImages[swapIndex]] = [nextImages[swapIndex], nextImages[currentIndex]];
    const normalizedNextImages = normalizeGalleryOrder(nextImages);
    const movedImage = normalizedNextImages[swapIndex];
    const swappedImage = normalizedNextImages[currentIndex];

    setGalleryError('');
    setReorderingImageId(imageId);
    setGalleryImages(normalizedNextImages);

    try {
      const supabase = getSupabaseClient();
      const updates = [
        { id: movedImage.id, sort_order: movedImage.sort_order },
        { id: swappedImage.id, sort_order: swappedImage.sort_order },
      ];

      const updateTasks = updates.map((update) => supabase.from('project_images').update({ sort_order: update.sort_order }).eq('id', update.id));
      const updateResults = await Promise.all(updateTasks);
      const updateError = updateResults.find((result) => result.error)?.error;
      if (updateError) throw updateError;

      setMessage('Urutan gallery tersimpan.');
    } catch (error) {
      console.error('[ProjectForm] Reorder gallery image failed', error);
      setGalleryImages(currentImages);
      setGalleryError('Urutan gallery gagal disimpan. Silakan coba lagi.');
    } finally {
      setReorderingImageId('');
    }
  }

  async function removeGalleryImage(image: ProjectImage) {
    if (!window.confirm(`Hapus gambar gallery ini? Tindakan ini tidak dapat dibatalkan.\n${image.alt_text ? `Alt: ${image.alt_text}` : ''}`.trim())) return;
    setGalleryError('');
    setAiError('');
    setDeletingImageId(image.id);

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

      if (normalizeImageUrl(coverImage) === normalizeImageUrl(image.image_url)) {
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
    } finally {
      setDeletingImageId('');
    }
  }

  async function handleGenerateNarrative() {
    setAiError('');
    setMessage('');
    const uniqueGalleryImages = Array.from(new Set(galleryImages.map((image) => image.image_url).filter(Boolean)));
    const imageUrls = coverImage && coverImage.startsWith('http')
      ? [coverImage, ...uniqueGalleryImages.filter((url) => url !== coverImage)].slice(0, 3)
      : uniqueGalleryImages.slice(0, 3);
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
      const allNarrativeFieldsFilled = Boolean(
        konteks.trim() &&
        konflik.trim() &&
        keputusanDesain.trim() &&
        pendekatan.trim() &&
        dampak.trim() &&
        insightKunci.trim(),
      );
      if (allNarrativeFieldsFilled && !window.confirm('Enam field case study sudah terisi. Timpa dengan hasil AI baru?')) return;

      const hasManualEdits = Boolean(konteks.trim() || konflik.trim() || keputusanDesain.trim() || pendekatan.trim() || dampak.trim() || insightKunci.trim());
      if (!allNarrativeFieldsFilled && hasManualEdits && !window.confirm('Sebagian field case study sudah berisi konten. Timpa dengan hasil AI?')) return;
      setKonteks(data.konteks);
      setKonflik(data.konflik);
      setKeputusanDesain(data.keputusan_desain);
      setPendekatan(data.pendekatan);
      setDampak(data.dampak);
      setInsightKunci(data.insight_kunci);
      setImpact((current) => current || data.dampak || '');
      setMessage('Draft case study berhasil dibuat. Review dan edit sebelum menyimpan.');
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


  async function handleBuildInsightFromProject() {
    if (!savedProjectId) return;
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session?.access_token) {
        throw sessionError || new Error('Session admin tidak aktif atau sudah expired. Login ulang lalu coba lagi.');
      }

      const response = await fetch('/api/insights/from-project', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
        body: JSON.stringify({ projectId: savedProjectId }),
      });
      const { isJson, data } = await readJsonSafely(response);
      if (!response.ok) {
        if (isJson && data?.error) throw new Error(data.error);
        throw new Error('Gagal membuat draft wawasan. Periksa session admin atau policy Supabase insights.');
      }
      if (!isJson || !data?.id) {
        throw new Error('Server mengembalikan respons tidak valid saat membuat draft wawasan.');
      }
      router.push(`/admin/insights/${data.id}/edit`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal membuat draft wawasan. Periksa session admin atau policy Supabase insights.');
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

  const isAiButtonDisabled = (aiGenerating || galleryUploading || loading) || (!galleryImages.length && !(clientProblemRaw.trim() || designReference.trim() || areaScope.trim() || projectSize.trim()));

  function addAreaTag(tag: string) {
    const normalized = normalizeText(tag);
    if (!normalized || areaTags.includes(normalized)) return;
    setAreaTags((current) => [...current, normalized]);
  }

  function removeAreaTag(tag: string) {
    setAreaTags((current) => current.filter((item) => item !== tag));
  }

  function addCustomAreaTag() {
    addAreaTag(customAreaTag);
    setCustomAreaTag('');
  }

  function handleCustomAreaTagEnter(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    addCustomAreaTag();
  }

  function addImageAreaTag(imageId: string, tag: string) {
    const normalized = normalizeText(tag);
    if (!normalized) return;
    const image = galleryImages.find((item) => item.id === imageId);
    const nextTags = Array.from(new Set([...(image?.area_tags || []), normalized]));
    void updateGalleryImageAreaTags(imageId, nextTags);
  }

  function removeImageAreaTag(imageId: string, tag: string) {
    const image = galleryImages.find((item) => item.id === imageId);
    const nextTags = (image?.area_tags || []).filter((item) => item !== tag);
    void updateGalleryImageAreaTags(imageId, nextTags);
  }

  function addCustomImageAreaTag(imageId: string, value: string) {
    addImageAreaTag(imageId, value);
  }

  function getUploadStatusLabel(status: UploadQueueStatus) {
    if (status === 'uploading') return 'Mengunggah';
    if (status === 'saved') return 'Tersimpan';
    if (status === 'failed') return 'Gagal';
    return 'Menunggu';
  }

  const coverExistsInGallery = Boolean(coverImage && galleryImages.some((image) => normalizeImageUrl(image.image_url) === normalizeImageUrl(coverImage)));

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
        <div>
          <label>Status Proyek</label>
          <select value={projectStatus} onChange={(event) => setProjectStatus(event.target.value as 'konsep' | 'berjalan' | 'selesai' | '')} className="mt-2 w-full rounded-sm border border-white/10 bg-[#0b0b0a] px-4 py-3 text-sm text-white/78 outline-none transition duration-300 hover:border-[#D4AF37]/35 focus:border-[#D4AF37]/45">
            <option value="">Pilih status proyek (opsional)</option>
            {projectStatusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        </div>
        <div>
          <label>Tahun Selesai</label>
          <input type="number" inputMode="numeric" min={1900} max={3000} placeholder="2026" value={completionYear} onChange={(event) => setCompletionYear(event.target.value)} />
        </div>
        <div className="md:col-span-2">
          <label>Area/Ruang Tags</label>
          <p className="mt-2 text-xs leading-5 text-white/42">Pilih satu atau lebih area/ruang yang termasuk dalam project ini. Tags ini akan dipakai untuk filter referensi visual pada tahap berikutnya.</p>
          <div className="mt-3 flex flex-col gap-3 rounded-sm border border-white/10 bg-[#0b0b0a] p-4">
            <div className="flex flex-wrap gap-2">
              {areaTagOptions.map((option) => {
                const isSelected = areaTags.includes(option);
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => (isSelected ? removeAreaTag(option) : addAreaTag(option))}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] leading-4 transition ${
                      isSelected
                        ? 'border-[#D4AF37]/45 bg-[#D4AF37]/15 text-[#D4AF37]'
                        : 'border-white/20 bg-white/[0.02] text-white/75 hover:border-[#D4AF37]/40 hover:text-[#D4AF37]'
                    }`}
                  >
                    {getAreaTagLabel(option)}
                    {isSelected ? <X size={12} /> : null}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                value={customAreaTag}
                onChange={(event) => setCustomAreaTag(event.target.value)}
                onKeyDown={handleCustomAreaTagEnter}
                placeholder="Tambah area custom"
                className="flex-1"
              />
              <button type="button" onClick={addCustomAreaTag} className="rounded-sm border border-white/10 px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white/68 transition hover:border-[#D4AF37]/35 hover:text-[#D4AF37]">Add</button>
            </div>
            {areaTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {areaTags.map((tag) => (
                  <button key={tag} type="button" onClick={() => removeAreaTag(tag)} className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-3 py-1 text-xs text-[#D4AF37]">
                    {getAreaTagLabel(tag)} <X size={12} />
                  </button>
                ))}
              </div>
            ) : <p className="text-xs text-white/40">Belum ada tags dipilih.</p>}
          </div>
        </div>
        {formError ? <p className="md:col-span-2 text-sm leading-6 text-red-300">{formError}</p> : null}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 font-sans md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2.5">
            <label>Project Gallery</label>
            <p className="max-w-2xl text-sm leading-6 text-white/70">Upload multiple images untuk halaman detail project. Pilih salah satu gambar dari gallery sebagai cover thumbnail.</p>
            <p className="max-w-xl text-xs leading-5 text-white/45">Format: JPG, PNG, atau WEBP. Maksimal 2MB per file. Pilih gambar yang sudah terkurasi agar gallery tetap ringan.</p>
          </div>
          <div className="w-full max-w-sm rounded-xl border border-white/10 bg-black/20 p-3.5 md:w-auto">
            <input ref={galleryInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleGalleryUpload} disabled={galleryUploading || loading || aiGenerating} className="hidden" />
            <button type="button" onClick={openGalleryPicker} disabled={galleryUploading || loading || aiGenerating || bulkAltUpdating} className="inline-flex h-10 w-full items-center justify-center gap-2.5 rounded-full border border-white/12 bg-white/[0.02] px-5 text-xs font-semibold uppercase tracking-[0.1em] text-white/70 transition duration-300 hover:border-[#D4AF37]/35 hover:text-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50 md:w-auto">
              <ImagePlus size={16} /> {galleryUploading ? 'Uploading...' : 'Upload Gallery'}
            </button>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <button type="button" onClick={() => { void handleGenerateGalleryAltText('fill-empty'); }} disabled={galleryUploading || loading || aiGenerating || bulkAltUpdating} className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-3 text-[10px] font-bold uppercase tracking-[0.1em] text-[#D4AF37] transition hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/15 disabled:cursor-not-allowed disabled:opacity-50">
                {bulkAltUpdating ? 'Memproses...' : 'Isi Alt Kosong'}
              </button>
              <button type="button" onClick={() => { void handleGenerateGalleryAltText('overwrite-all'); }} disabled={galleryUploading || loading || aiGenerating || bulkAltUpdating} className="inline-flex h-9 items-center justify-center gap-2 rounded-full border border-white/15 px-3 text-[10px] font-bold uppercase tracking-[0.1em] text-white/70 transition hover:border-[#D4AF37]/35 hover:text-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50">
                Timpa Semua Alt
              </button>
            </div>
            <p className="mt-2 text-xs leading-5 text-white/45">Alt text dibuat otomatis dari judul project dan tag area gambar, tanpa menggunakan AI.</p>
          </div>
        </div>
        {coverImage ? (
          <div className="mt-6 flex flex-col gap-3 rounded-xl border border-[#D4AF37]/25 bg-[#D4AF37]/[0.04] p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3 text-sm text-[#D4AF37]"><Star size={16} /><span>{coverExistsInGallery ? 'Cover image sudah dipilih dari gallery.' : 'Cover image aktif, tetapi belum ada di daftar gallery saat ini.'}</span></div>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" onClick={clearCover} disabled={Boolean(coverUpdatingId)} className="self-start font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white/50 transition hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50 md:self-auto">Clear Cover</button>
            </div>
          </div>
        ) : <div className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/45">Belum ada cover. Upload gallery lalu pilih satu gambar sebagai cover.</div>}
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
        {uploadQueueItems.length > 0 ? (
          <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-white/45">Status Upload</p>
            <div className="mt-2 space-y-2">
              {uploadQueueItems.map((item) => (
                <div key={item.key} className="rounded-lg border border-white/10 bg-white/[0.015] px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-white/75">{item.name}</p>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] ${
                      item.status === 'failed'
                        ? 'border-red-300/30 bg-red-400/10 text-red-200'
                        : item.status === 'saved'
                          ? 'border-emerald-300/30 bg-emerald-400/10 text-emerald-200'
                          : item.status === 'uploading'
                            ? 'border-[#D4AF37]/40 bg-[#D4AF37]/15 text-[#D4AF37]'
                            : 'border-white/20 bg-white/[0.03] text-white/60'
                    }`}
                    >
                      {getUploadStatusLabel(item.status)}
                    </span>
                  </div>
                  {item.error ? <p className="mt-1 text-[11px] leading-5 text-red-200/90">{item.error}</p> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}
        {galleryUploading ? <p className="mt-4 text-sm text-[#D4AF37]">Uploading gallery images...</p> : null}
        {galleryImages.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {galleryImages.map((image, index) => {
              const isCover = normalizeImageUrl(coverImage) === normalizeImageUrl(image.image_url);
              const hasImageUrl = Boolean(image.image_url);
              const isDeleting = deletingImageId === image.id;
              const isReordering = Boolean(reorderingImageId);
              const isCurrentReordering = reorderingImageId === image.id;
              const isFirstImage = index === 0;
              const isLastImage = index === galleryImages.length - 1;
              return (
                <div key={image.id} className={`rounded-2xl border bg-black/20 transition duration-300 ${isCover ? 'border-[#D4AF37]/45 shadow-[0_16px_36px_rgba(212,175,55,0.06)]' : 'border-white/10 bg-white/[0.015] hover:border-[#D4AF37]/25'}`}>
                  <button
                    type="button"
                    onClick={() => { if (!isCover) void setExistingGalleryImageAsCover(image); }}
                    disabled={!hasImageUrl || isCover || Boolean(coverUpdatingId) || isDeleting}
                    aria-label={isCover ? 'Gambar ini adalah cover aktif' : 'Pilih gambar ini sebagai cover'}
                    className={`relative block w-full rounded-t-2xl text-left ${!isCover ? 'cursor-pointer' : 'cursor-default'} disabled:cursor-not-allowed`}
                  >
                    <div className="relative w-full overflow-hidden rounded-t-2xl bg-black/30" style={getGalleryImageFrameStyle(image)}>
                      <img src={image.image_url} alt={image.alt_text || title || 'Project gallery'} className="absolute inset-0 h-full w-full" style={getGalleryImageStyle(image)} />
                      {isCover ? <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37]/95 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#080807]"><Star size={11} /> Cover</div> : null}
                      {!isCover ? <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full border border-[#D4AF37]/30 bg-black/50 px-3 py-1 text-center text-[9px] font-bold uppercase tracking-[0.1em] text-[#D4AF37]">Klik untuk jadikan cover</div> : null}
                    </div>
                  </button>
                  <div className="flex h-full flex-col gap-3 p-4">
                    <div><label>Alt Text</label><input value={image.alt_text || ''} onChange={(event) => updateGalleryAltText(image.id, event.target.value)} placeholder="Caption / alt text" className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3.5 py-2.5 text-sm text-white/85 outline-none transition placeholder:text-white/35 focus:border-[#D4AF37]/40" /></div>
                    <div className="space-y-2 pt-1">
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => setActiveCropEditor({ imageId: image.id, display_ratio: (image.display_ratio || 'landscape') as DisplayRatio, crop_x: normalizeCropX(image.crop_x), crop_y: normalizeCropY(image.crop_y), crop_zoom: normalizeCropZoom(image.crop_zoom) })} className="inline-flex h-8 items-center gap-2 rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-3.5 font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-[#D4AF37] transition duration-300 hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/15">Atur Crop</button>
                        <button
                          type="button"
                          onClick={() => setExpandedImageTagPanels((current) => ({ ...current, [image.id]: !current[image.id] }))}
                          className="inline-flex h-8 items-center gap-2 rounded-full border border-white/15 bg-white/[0.01] px-3.5 font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-white/70 transition duration-300 hover:border-[#D4AF37]/35 hover:text-[#D4AF37]"
                        >
                          Kelola Tag
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => removeGalleryImage(image)} disabled={isDeleting || Boolean(coverUpdatingId)} className="inline-flex h-8 items-center gap-2 rounded-full border border-red-300/25 bg-red-400/[0.04] px-3.5 font-sans text-[10px] font-bold uppercase tracking-[0.1em] text-red-200/85 transition duration-300 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"><X size={13} /> {isDeleting ? 'Menghapus...' : 'Hapus Gambar'}</button>
                      </div>
                    </div>
                    <div>
                      <label>Image Area Tags</label>
                      <div className="mt-2 space-y-2.5">
                        {(image.area_tags || []).length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {(image.area_tags || []).map((tag) => (
                              <button key={`${image.id}-${tag}`} type="button" onClick={() => removeImageAreaTag(image.id, tag)} className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-3 py-1 text-xs text-[#D4AF37]">{getAreaTagLabel(tag)} <X size={12} /></button>
                            ))}
                          </div>
                        ) : <p className="text-xs text-white/40">Belum ada tag area gambar.</p>}
                        {expandedImageTagPanels[image.id] ? (
                          <div className="space-y-2.5 rounded-xl border border-white/10 bg-black/30 p-3">
                            <div className="max-h-56 overflow-y-auto pr-1">
                              <div className="flex flex-wrap gap-1.5">
                              {areaTagOptions.map((option) => {
                                const isSelected = (image.area_tags || []).includes(option);
                                return (
                                  <button
                                    key={`${image.id}-${option}`}
                                    type="button"
                                    onClick={() => (isSelected ? removeImageAreaTag(image.id, option) : addImageAreaTag(image.id, option))}
                                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] leading-4 transition ${
                                      isSelected
                                        ? 'border-[#D4AF37]/45 bg-[#D4AF37]/15 text-[#D4AF37]'
                                        : 'border-white/20 bg-white/[0.02] text-white/75 hover:border-[#D4AF37]/40 hover:text-[#D4AF37]'
                                    }`}
                                  >
                                    {getAreaTagLabel(option)}
                                    {isSelected ? <X size={12} /> : null}
                                  </button>
                                );
                              })}
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1.5 sm:flex-nowrap">
                              <input
                                value={customImageAreaTags[image.id] || ''}
                                onChange={(event) => setCustomImageAreaTags((current) => ({ ...current, [image.id]: event.target.value }))}
                                onKeyDown={(event) => {
                                  if (event.key !== 'Enter') return;
                                  event.preventDefault();
                                  addCustomImageAreaTag(image.id, customImageAreaTags[image.id] || '');
                                  setCustomImageAreaTags((current) => ({ ...current, [image.id]: '' }));
                                }}
                                placeholder="Tambah area custom"
                                className="min-w-[180px] flex-1"
                              />
                              <button type="button" onClick={() => { addCustomImageAreaTag(image.id, customImageAreaTags[image.id] || ''); setCustomImageAreaTags((current) => ({ ...current, [image.id]: '' })); }} className="rounded-sm border border-white/10 px-2.5 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white/68 transition hover:border-[#D4AF37]/35 hover:text-[#D4AF37]">Add</button>
                            </div>
                            <button
                              type="button"
                              onClick={() => setExpandedImageTagPanels((current) => ({ ...current, [image.id]: false }))}
                              className="rounded-sm border border-white/12 px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white/68 transition hover:border-[#D4AF37]/40 hover:text-[#D4AF37]"
                            >
                              Selesai
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/8 bg-black/25 px-3 py-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/55">Urutan {String(index + 1).padStart(2, '0')}</span>
                        <div className="flex items-center gap-1.5">
                          <button type="button" onClick={() => reorderGalleryImage(image.id, 'previous')} disabled={isFirstImage || isDeleting || isReordering || Boolean(coverUpdatingId)} className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/60 transition hover:border-[#D4AF37]/35 hover:text-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-40">Sebelumnya</button>
                          <button type="button" onClick={() => reorderGalleryImage(image.id, 'next')} disabled={isLastImage || isDeleting || isReordering || Boolean(coverUpdatingId)} className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/60 transition hover:border-[#D4AF37]/35 hover:text-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-40">Berikutnya</button>
                        </div>
                      </div>
                      {isCurrentReordering ? <p className="mt-2 text-[11px] text-[#D4AF37]">Menyimpan urutan...</p> : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : <div className="mt-8 rounded-sm border border-dashed border-white/10 p-8 text-center text-sm leading-6 text-white/42">Belum ada gallery images.</div>}
      </div>

      <div className="rounded-sm border border-white/10 bg-white/[0.025] p-6 md:p-8">
        <div className="mb-6"><label>Structured Input for AI</label><p className="mt-1 max-w-2xl text-sm leading-6 text-white/42">Input ini disimpan sebagai riwayat brief internal dan membantu AI menyusun narasi yang lebih akurat. Tidak ditampilkan di halaman publik.</p></div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="md:col-span-2"><label>Client Problem Raw</label><textarea maxLength={500} value={clientProblemRaw} onChange={(event) => setClientProblemRaw(event.target.value)} placeholder="Tuliskan problem awal dari klien secara mentah, misalnya: ruang terasa sempit, flow tidak nyaman, storage kurang, dsb." /></div>
          <div><label>Design Reference</label><textarea maxLength={500} value={designReference} onChange={(event) => setDesignReference(event.target.value)} placeholder="Arah referensi desain, mood, style, material, atau benchmark yang diinginkan." /></div>
          <div><label>Area Scope</label><textarea maxLength={300} value={areaScope} onChange={(event) => setAreaScope(event.target.value)} placeholder="Area yang didesain, misalnya living room, pantry, bedroom, workspace, lobby, dsb." /></div>
          <div className="md:col-span-2"><label>Project Size</label><input maxLength={100} value={projectSize} onChange={(event) => setProjectSize(event.target.value)} placeholder="Contoh: 36 m², 120 m², tipe 45, 2 lantai" /></div>
        </div>
      </div>

      <div className="rounded-sm border border-[#D4AF37]/20 bg-[#D4AF37]/[0.035] p-6 md:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <label>AI Narrative Generator</label>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-white/50">AI menggabungkan brief, reference, scope, ukuran project, dan gallery untuk menyusun 6 section case study.</p>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">Gunakan AI hanya setelah foto utama dan konteks project siap. Hasil AI bisa diedit manual sebelum disimpan.</p>
            <p className="mt-1 text-xs leading-5 text-[#D4AF37]">Setiap klik Generate memakai quota API.</p>
          </div>
          <button type="button" onClick={handleGenerateNarrative} disabled={isAiButtonDisabled} className="inline-flex items-center justify-center gap-3 rounded-[4px] bg-[#D4AF37] px-6 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#080807] transition hover:bg-[#E2C866] disabled:cursor-not-allowed disabled:opacity-60"><Sparkles size={17} />{aiGenerating ? 'Generating...' : 'Generate Case Study dengan AI'}</button>
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
        <div><label>Ringkasan Pembuka Publik</label><textarea value={problem} onChange={(event) => setProblem(event.target.value)} placeholder="Ringkasan singkat yang tampil di bagian atas halaman detail project. Gunakan 1–2 kalimat yang menjelaskan nilai utama project." /></div>
      </div>

      {message ? <p className="text-sm leading-6 text-white/70">{message}</p> : null}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <button disabled={loading || galleryUploading || aiGenerating} type="submit" className="rounded-[4px] bg-[#D4AF37] px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#080807] transition hover:bg-[#E2C866] disabled:opacity-60">{loading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Buat Project'}</button>
        {isEditing ? <button disabled={loading || galleryUploading || aiGenerating} type="button" onClick={handleBuildInsightFromProject} className="rounded-[4px] border border-[#D4AF37]/40 px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#D4AF37] transition hover:bg-[#D4AF37]/10 disabled:opacity-60">Bangun Wawasan dari Project Ini</button> : null}
        {isEditing ? <button disabled={loading || galleryUploading || aiGenerating} type="button" onClick={handleDelete} className="rounded-[4px] border border-red-400/30 px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-red-200 transition hover:bg-red-500/10 disabled:opacity-60">Hapus Project</button> : null}
      </div>
      {activeCropEditor ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 md:p-4" onClick={() => setActiveCropEditor(null)}>
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-[#D4AF37]/25 bg-[#0b0b0a]" onClick={(event) => event.stopPropagation()}>
            <div className="shrink-0 border-b border-white/10 p-5">
              <h3 className="text-lg font-semibold text-[#D4AF37]">Atur Crop Gambar</h3>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)] lg:items-start">
                <div className="flex min-h-[220px] items-center justify-center rounded-2xl bg-black/60 p-3">
                  <div
                    className="relative mx-auto overflow-hidden rounded-2xl bg-black"
                    style={{
                      ...getGalleryImageFrameStyle(activeCropEditor),
                      width: `min(100%, calc(34vh * ${getDisplayRatioNumber(activeCropEditor.display_ratio)}))`,
                      maxHeight: '34vh',
                    }}
                  >
                    <img src={galleryImages.find((item) => item.id === activeCropEditor.imageId)?.image_url || ''} alt="Preview crop" className="absolute inset-0 h-full w-full" style={getGalleryImageStyle(activeCropEditor)} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div><p className="mb-2 text-xs text-white/70">Rasio</p><div className="flex flex-wrap gap-2">{displayRatioOptions.map((option) => <button key={option.value} type="button" onClick={() => setActiveCropEditor((cur) => cur ? { ...cur, display_ratio: option.value } : cur)} className={`rounded-full border px-3 py-1 text-xs ${activeCropEditor.display_ratio === option.value ? 'border-[#D4AF37]/50 bg-[#D4AF37]/15 text-[#D4AF37]' : 'border-white/15 text-white/70'}`}>{option.label}</button>)}</div></div>
                  <div><p className="text-xs text-white/70">Zoom ({activeCropEditor.crop_zoom.toFixed(2)}x)</p><input type="range" min={1} max={2.5} step={0.05} value={activeCropEditor.crop_zoom} onChange={(event) => setActiveCropEditor((cur) => cur ? { ...cur, crop_zoom: Number(event.target.value) } : cur)} className="w-full" /></div>
                  <div><p className="text-xs text-white/70">Geser Horizontal ({Math.round(activeCropEditor.crop_x)}%)</p><input type="range" min={0} max={100} step={1} value={activeCropEditor.crop_x} onChange={(event) => setActiveCropEditor((cur) => cur ? { ...cur, crop_x: Number(event.target.value) } : cur)} className="w-full" /></div>
                  <div><p className="text-xs text-white/70">Geser Vertikal ({Math.round(activeCropEditor.crop_y)}%)</p><input type="range" min={0} max={100} step={1} value={activeCropEditor.crop_y} onChange={(event) => setActiveCropEditor((cur) => cur ? { ...cur, crop_y: Number(event.target.value) } : cur)} className="w-full" /></div>
                </div>
              </div>
            </div>
            <div className="shrink-0 border-t border-white/10 bg-[#0b0b0a]/95 p-4 backdrop-blur">
              <div className="flex flex-wrap justify-end gap-2">
                <button type="button" onClick={() => setActiveCropEditor((cur) => cur ? { ...cur, display_ratio: 'landscape', crop_x: 50, crop_y: 50, crop_zoom: 1 } : cur)} className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/70">Reset</button>
                <button type="button" onClick={() => setActiveCropEditor(null)} className="rounded-full border border-white/20 px-4 py-2 text-xs text-white/70">Batal</button>
                <button type="button" disabled={cropSaving} onClick={saveCropSettings} className="rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/15 px-4 py-2 text-xs font-semibold text-[#D4AF37]">{cropSaving ? 'Menyimpan...' : 'Simpan Crop'}</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}
