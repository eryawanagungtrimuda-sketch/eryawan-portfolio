'use client';

import { ChangeEvent, FormEvent, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ImagePlus, X } from 'lucide-react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import type { Project } from '@/lib/types';

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

  return `${baseName || 'cover'}-${Date.now()}.${extension}`;
}

export default function ProjectForm({ project }: Props) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const isEditing = Boolean(project?.id);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState(Boolean(project?.cover_image));
  const [selectedFileName, setSelectedFileName] = useState('');
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

  function openFilePicker() {
    if (uploading || loading) return;
    fileInputRef.current?.click();
  }

  function removeCoverImage() {
    setCoverImage('');
    setSelectedFileName('');
    setUploadError('');
    setUploadSuccess(false);
    setMessage('Cover image dihapus dari form. Simpan project untuk menyimpan perubahan.');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleCoverUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setMessage('');
    setUploadSuccess(false);
    setSelectedFileName(file.name);

    if (!allowedImageTypes.includes(file.type)) {
      setUploadError('Format gambar harus JPG, PNG, atau WEBP.');
      setSelectedFileName('');
      event.target.value = '';
      return;
    }

    if (file.size > maxImageSize) {
      setUploadError('Ukuran gambar maksimal 2MB.');
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
        console.error('[ProjectForm] Cover image upload failed', {
          bucket: 'project-images',
          path: filePath,
          message: error.message,
        });
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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleCoverUpload}
            disabled={uploading || loading}
            className="hidden"
          />
          <button
            type="button"
            onClick={openFilePicker}
            disabled={uploading || loading}
            className="group w-full rounded-sm border border-dashed border-white/14 bg-white/[0.018] p-5 text-left transition duration-300 hover:border-[#D4AF37]/45 hover:bg-white/[0.03] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-sm border border-white/10 bg-black/20 text-white/48 transition duration-300 group-hover:border-[#D4AF37]/35 group-hover:text-[#D4AF37]">
                {uploadSuccess ? <CheckCircle2 size={20} /> : <ImagePlus size={20} />}
              </span>
              <span className="block min-w-0">
                <span className="block text-sm font-semibold uppercase tracking-[0.12em] text-white/82">
                  {uploading ? 'Uploading Cover Image' : coverImage ? 'Replace Cover Image' : 'Upload Cover Image'}
                </span>
                <span className="mt-2 block text-sm leading-6 text-white/45">
                  Drag & drop atau klik untuk memilih file
                </span>
                <span className="mt-2 block text-xs leading-5 text-white/34">
                  JPG, PNG, atau WEBP. Maksimal 2MB.
                </span>
              </span>
            </div>
          </button>

          {uploading ? (
            <div className="mt-3 flex items-center gap-3 text-sm text-[#D4AF37]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#D4AF37]" />
              <span>Uploading image...</span>
            </div>
          ) : null}
          {uploadSuccess && !uploading ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-[#D4AF37]">
              <CheckCircle2 size={16} />
              <span>Cover image siap digunakan.</span>
            </div>
          ) : null}
          {uploadError ? <p className="mt-3 text-sm leading-6 text-red-300">{uploadError}</p> : null}
        </div>
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

      {coverImage ? (
        <div className="rounded-sm border border-white/10 bg-white/[0.025] p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <label>Cover Preview</label>
              {selectedFileName ? <p className="mt-1 text-xs leading-5 text-white/38">{selectedFileName}</p> : null}
            </div>
            <button
              type="button"
              onClick={removeCoverImage}
              disabled={loading || uploading}
              className="inline-flex items-center gap-2 self-start rounded-sm border border-white/10 px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white/52 transition duration-300 hover:border-red-400/30 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-50 md:self-auto"
            >
              <X size={14} />
              Remove
            </button>
          </div>
          <img src={coverImage} alt={title || 'Cover preview'} className="mt-4 aspect-[16/9] w-full rounded-sm object-cover" />
          <p className="mt-3 break-all text-xs leading-5 text-white/32">{coverImage}</p>
        </div>
      ) : null}

      {message ? <p className="text-sm leading-6 text-white/70">{message}</p> : null}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <button disabled={loading || uploading} type="submit" className="rounded-[4px] bg-[#D4AF37] px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#080807] transition hover:bg-[#E2C866] disabled:opacity-60">
          {loading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Buat Project'}
        </button>
        {isEditing ? (
          <button disabled={loading || uploading} type="button" onClick={handleDelete} className="rounded-[4px] border border-red-400/30 px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-red-200 transition hover:bg-red-500/10 disabled:opacity-60">
            Hapus Project
          </button>
        ) : null}
      </div>
    </form>
  );
}
