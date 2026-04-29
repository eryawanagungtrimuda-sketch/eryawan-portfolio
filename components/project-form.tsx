'use client';

import { ChangeEvent, FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
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
  const isEditing = Boolean(project?.id);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [uploadError, setUploadError] = useState('');
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

  async function handleCoverUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setMessage('');

    if (!allowedImageTypes.includes(file.type)) {
      setUploadError('Format gambar harus JPG, PNG, atau WEBP.');
      event.target.value = '';
      return;
    }

    if (file.size > maxImageSize) {
      setUploadError('Ukuran gambar maksimal 2MB.');
      event.target.value = '';
      return;
    }

    const currentSlug = slug || slugify(title);
    if (!currentSlug) {
      setUploadError('Isi title atau slug terlebih dahulu sebelum upload cover image.');
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
      setMessage('Cover image berhasil diupload. Simpan project untuk menyimpan perubahan.');
    } catch (error) {
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
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleCoverUpload} disabled={uploading || loading} />
          <p className="mt-2 text-xs leading-5 text-white/38">JPG, PNG, atau WEBP. Maksimal 2MB.</p>
          {uploading ? <p className="mt-2 text-sm text-[#D4AF37]">Uploading image...</p> : null}
          {uploadError ? <p className="mt-2 text-sm leading-6 text-red-300">{uploadError}</p> : null}
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
          <label>Cover Preview</label>
          <img src={coverImage} alt={title || 'Cover preview'} className="mt-4 aspect-[16/9] w-full rounded-sm object-cover" />
          <p className="mt-3 break-all text-xs leading-5 text-white/35">{coverImage}</p>
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
