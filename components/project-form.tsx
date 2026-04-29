'use client';

import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ImagePlus, X } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import type { Project, ProjectImage } from '@/lib/types';

type Props = {
  project?: Project;
};

const maxImageSize = 2 * 1024 * 1024;
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function safeFileName(name: string) {
  const extension = name.split('.').pop()?.toLowerCase() || 'jpg';
  const baseName = name
    .replace(/\.[^/.]+$/, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

  return `${baseName || 'image'}-${Date.now()}.${extension}`;
}

function validateImage(file: File) {
  if (!allowedImageTypes.includes(file.type)) return 'Format gambar harus JPG, PNG, atau WEBP.';
  if (file.size > maxImageSize) return 'Ukuran gambar maksimal 2MB per file.';
  return '';
}

export default function ProjectForm({ project }: Props) {
  const router = useRouter();
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const isEditing = Boolean(project?.id);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [galleryError, setGalleryError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(Boolean(project?.cover_image));
  const [selectedFileName, setSelectedFileName] = useState('');
  const [galleryImages, setGalleryImages] = useState<ProjectImage[]>([...(project?.project_images || [])].sort((a, b) => a.sort_order - b.sort_order));
  const [title, setTitle] = useState(project?.title || '');
  const [slug, setSlug] = useState(project?.slug || '');
  const [category, setCategory] = useState(project?.category || '');
  const [coverImage, setCoverImage] = useState(project?.cover_image || '');
  const [problem, setProblem] = useState(project?.problem || '');
  const [solution, setSolution] = useState(project?.solution || '');
  const [impact, setImpact] = useState(project?.impact || '');

  function syncSlug(nextTitle: string) {
    setTitle(nextTitle);
    if (!isEditing && !slug) setSlug(slugify(nextTitle));
  }

  function openCoverPicker() {
    if (uploading || loading) return;
    coverInputRef.current?.click();
  }

  function openGalleryPicker() {
    if (galleryUploading || loading) return;
    galleryInputRef.current?.click();
  }

  function removeCoverImage() {
    setCoverImage('');
    setSelectedFileName('');
    setUploadError('');
    setUploadSuccess(false);
    setMessage('Cover image dihapus dari form. Simpan project untuk menyimpan perubahan.');
    if (coverInputRef.current) coverInputRef.current.value = '';
  }

  async function handleCoverUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setMessage('');
    setUploadSuccess(false);
    setSelectedFileName(file.name);

    const validationError = validateImage(file);
    if (validationError) {
      setUploadError(validationError);
      setSelectedFileName('');
      event.target.value = '';
      return;
    }

    const currentSlug = slug || slugify(title);
    if (!currentSlug) {
      setUploadError('Isi title atau slug terlebih dahulu sebelum upload cover image.');
      setSelectedFileName('');
      event.target.value = '';
      return;
    }

    setUploading(true);

    try {
      const supabase = getSupabaseClient();
      const filePath = `${currentSlug}/${safeFileName(file.name)}`;
      const { error } = await supabase.storage.from('project-images').upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      });

      if (error) {
        console.error('[ProjectForm] Cover image upload failed', { bucket: 'project-images', path: filePath, message: error.message });
        throw error;
      }

      const { data } = supabase.storage.from('project-images').getPublicUrl(filePath);
      setCoverImage(data.publicUrl);
      setUploadSuccess(true);
      setMessage('Cover image berhasil diupload. Simpan project untuk menyimpan perubahan.');
    } catch (error) {
      setUploadSuccess(false);
      setUploadError(error instanceof Error ? error.message : 'Upload gambar gagal.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  }

  async function ensureProjectExists() {
    const supabase = getSupabaseClient();
    const payload = {
      title,
      slug: slug || slugify(title),
      category: category || null,
      cover_image: coverImage || null,
      problem,
      solution,
      impact,
    };

    if (project?.id) {
      const { error } = await supabase.from('projects').update(payload).eq('id', project.id);
      if (error) throw error;
      return project.id;
    }

    const { data, error } = await supabase.from('projects').insert(payload).select('id').single();
    if (error) throw error;
    router.replace(`/admin/projects/${data.id}/edit`);
    return data.id as string;
  }

  async function handleGalleryUpload(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    setGalleryError('');
    setMessage('');

    const invalidFile = files.find((file) => validateImage(file));
    if (invalidFile) {
      setGalleryError(`${invalidFile.name}: ${validateImage(invalidFile)}`);
      event.target.value = '';
      return;
    }

    const currentSlug = slug || slugify(title);
    if (!currentSlug) {
      setGalleryError('Isi title atau slug terlebih dahulu sebelum upload gallery.');
      event.target.value = '';
      return;
    }

    setGalleryUploading(true);

    try {
      const supabase = getSupabaseClient();
      const projectId = await ensureProjectExists();
      const uploadedImages: ProjectImage[] = [];
      const startOrder = galleryImages.length;

      for (let index = 0; index < files.length; index += 1) {
        const file = files[index];
        if (!file) continue;

        const filePath = `${currentSlug}/gallery/${safeFileName(file.name)}`;
        const { error: uploadError } = await supabase.storage.from('project-images').upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type,
        });

        if (uploadError) {
          console.error('[ProjectForm] Gallery image upload failed', { bucket: 'project-images', path: filePath, message: uploadError.message });
          throw uploadError;
        }

        const { data: publicUrl } = supabase.storage.from('project-images').getPublicUrl(filePath);
        const { data, error: insertError } = await supabase
          .from('project_images')
          .insert({
            project_id: projectId,
            image_url: publicUrl.publicUrl,
            alt_text: title || null,
            sort_order: startOrder + index,
          })
          .select('id,project_id,image_url,alt_text,sort_order,created_at')
          .single();

        if (insertError) throw insertError;
        uploadedImages.push(data as ProjectImage);
      }

      setGalleryImages((current) => [...current, ...uploadedImages].sort((a, b) => a.sort_order - b.sort_order));
      setMessage('Gallery images berhasil diupload.');
    } catch (error) {
      setGalleryError(error instanceof Error ? error.message : 'Upload gallery gagal.');
    } finally {
      setGalleryUploading(false);
      event.target.value = '';
    }
  }

  async function updateGalleryAltText(imageId: string, altText: string) {
    setGalleryImages((current) => current.map((image) => (image.id === imageId ? { ...image, alt_text: altText } : image)));

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('project_images').update({ alt_text: altText || null }).eq('id', imageId);
      if (error) throw error;
    } catch (error) {
      setGalleryError(error instanceof Error ? error.message : 'Gagal menyimpan alt text.');
    }
  }

  async function removeGalleryImage(imageId: string) {
    const confirmed = window.confirm('Hapus gambar gallery ini?');
    if (!confirmed) return;

    setGalleryError('');

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('project_images').delete().eq('id', imageId);
      if (error) throw error;
      setGalleryImages((current) => current.filter((image) => image.id !== imageId));
    } catch (error) {
      setGalleryError(error instanceof Error ? error.message : 'Gagal menghapus gambar gallery.');
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const supabase = getSupabaseClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw userError || new Error('Session admin tidak ditemukan.');

      const payload = {
        title,
        slug: slug || slugify(title),
        category: category || null,
        cover_image: coverImage || null,
        problem,
        solution,
        impact,
      };

      if (isEditing && project?.id) {
        const { error } = await supabase.from('projects').update(payload).eq('id', project.id);
        if (error) throw error;
        setMessage('Project berhasil diperbarui.');
        router.refresh();
      } else {
        const { data, error } = await supabase.from('projects').insert(payload).select('id').single();
        if (error) throw error;
        router.push(`/admin/projects/${data.id}/edit`);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal menyimpan project.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!project?.id) return;
    const confirmed = window.confirm('Hapus project ini? Tindakan ini tidak bisa dibatalkan.');
    if (!confirmed) return;

    setLoading(true);
    setMessage('');

    try {
      const supabase = getSupabaseClient();
      const { error } = await supabase.from('projects').delete().eq('id', project.id);
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
          <input value={slug} onChange={(event) => setSlug(slugify(event.target.value))} required />
        </div>
        <div>
          <label>Category</label>
          <input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Residential Interior" />
        </div>
        <div>
          <label>Cover Image</label>
          <input ref={coverInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverUpload} disabled={uploading || loading} className="hidden" />
          <button type="button" onClick={openCoverPicker} disabled={uploading || loading} className="group w-full rounded-sm border border-dashed border-white/14 bg-white/[0.018] p-5 text-left transition duration-300 hover:border-[#D4AF37]/45 hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-60">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-white/10 bg-black/20 text-white/48 transition duration-300 group-hover:border-[#D4AF37]/35 group-hover:text-[#D4AF37]">
                {uploadSuccess ? <CheckCircle2 size={20} /> : <ImagePlus size={20} />}
              </span>
              <span className="block min-w-0">
                <span className="block text-sm font-semibold uppercase tracking-[0.12em] text-white/82">{uploading ? 'Uploading Cover Image' : coverImage ? 'Replace Cover Image' : 'Upload Cover Image'}</span>
                <span className="mt-2 block text-sm leading-6 text-white/45">Drag & drop atau klik untuk memilih file</span>
                <span className="mt-2 block text-xs leading-5 text-white/34">JPG, PNG, atau WEBP. Maksimal 2MB.</span>
              </span>
            </div>
          </button>
          {uploading ? <div className="mt-3 flex items-center gap-3 text-sm text-[#D4AF37]"><span className="h-2 w-2 animate-pulse rounded-full bg-[#D4AF37]" /><span>Uploading image...</span></div> : null}
          {uploadSuccess && !uploading ? <div className="mt-3 flex items-center gap-2 text-sm text-[#D4AF37]"><CheckCircle2 size={16} /><span>Cover image siap digunakan.</span></div> : null}
          {uploadError ? <p className="mt-3 text-sm leading-6 text-red-300">{uploadError}</p> : null}
        </div>
      </div>

      {coverImage ? (
        <div className="rounded-sm border border-white/10 bg-white/[0.025] p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <label>Cover Preview</label>
              {selectedFileName ? <p className="mt-1 text-xs leading-5 text-white/38">{selectedFileName}</p> : null}
            </div>
            <button type="button" onClick={removeCoverImage} disabled={loading || uploading} className="inline-flex items-center gap-2 self-start rounded-sm border border-white/10 px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white/52 transition duration-300 hover:border-red-400/30 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50 md:self-auto">
              <X size={14} /> Remove
            </button>
          </div>
          <img src={coverImage} alt={title || 'Cover preview'} className="mt-4 aspect-[16/9] w-full rounded-sm object-cover" />
        </div>
      ) : null}

      <div className="rounded-sm border border-white/10 bg-white/[0.025] p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <label>Project Gallery</label>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-white/42">Upload multiple images untuk halaman detail project. Cover image tetap terpisah sebagai thumbnail utama.</p>
          </div>
          <div>
            <input ref={galleryInputRef} type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={handleGalleryUpload} disabled={galleryUploading || loading} className="hidden" />
            <button type="button" onClick={openGalleryPicker} disabled={galleryUploading || loading} className="inline-flex items-center gap-3 rounded-[4px] border border-white/12 bg-white/[0.02] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/68 transition duration-300 hover:border-[#D4AF37]/40 hover:text-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50">
              <ImagePlus size={16} /> {galleryUploading ? 'Uploading...' : 'Upload Gallery'}
            </button>
          </div>
        </div>
        {galleryError ? <p className="mt-4 text-sm leading-6 text-red-300">{galleryError}</p> : null}
        {galleryUploading ? <p className="mt-4 text-sm text-[#D4AF37]">Uploading gallery images...</p> : null}

        {galleryImages.length > 0 ? (
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {galleryImages.map((image) => (
              <div key={image.id} className="overflow-hidden rounded-sm border border-white/10 bg-black/20">
                <img src={image.image_url} alt={image.alt_text || title || 'Project gallery'} className="aspect-[4/3] w-full object-cover" />
                <div className="space-y-3 p-4">
                  <div>
                    <label>Alt Text</label>
                    <input value={image.alt_text || ''} onChange={(event) => updateGalleryAltText(image.id, event.target.value)} placeholder="Caption / alt text" />
                  </div>
                  <button type="button" onClick={() => removeGalleryImage(image.id)} className="inline-flex items-center gap-2 rounded-sm border border-white/10 px-3 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white/52 transition duration-300 hover:border-red-400/30 hover:text-red-200">
                    <X size={13} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-sm border border-dashed border-white/10 p-8 text-center text-sm leading-6 text-white/42">Belum ada gallery images.</div>
        )}
      </div>

      <div className="grid gap-6 rounded-sm border border-white/10 bg-white/[0.025] p-6 md:p-8">
        <div>
          <label>Problem</label>
          <textarea value={problem} onChange={(event) => setProblem(event.target.value)} placeholder="Masalah utama project secara ringkas dan jelas." />
        </div>
        <div>
          <label>Solution</label>
          <textarea value={solution} onChange={(event) => setSolution(event.target.value)} placeholder="Keputusan desain / solusi strategis yang diambil." />
        </div>
        <div>
          <label>Impact</label>
          <textarea value={impact} onChange={(event) => setImpact(event.target.value)} placeholder="Dampak nyata yang dirasakan klien atau pengguna ruang." />
        </div>
      </div>

      {message ? <p className="text-sm leading-6 text-white/70">{message}</p> : null}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <button disabled={loading || uploading || galleryUploading} type="submit" className="rounded-[4px] bg-[#D4AF37] px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#080807] transition hover:bg-[#E2C866] disabled:opacity-60">
          {loading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Buat Project'}
        </button>
        {isEditing ? (
          <button disabled={loading || uploading || galleryUploading} type="button" onClick={handleDelete} className="rounded-[4px] border border-red-400/30 px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-red-200 transition hover:bg-red-500/10 disabled:opacity-60">Hapus Project</button>
        ) : null}
      </div>
    </form>
  );
}
