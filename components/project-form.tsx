'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import type { Project, ProjectImage } from '@/lib/types';

type Props = {
  project?: Project & { project_images?: ProjectImage[] };
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export default function ProjectForm({ project }: Props) {
  const router = useRouter();
  const isEditing = Boolean(project?.id);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState(project?.title || '');
  const [slug, setSlug] = useState(project?.slug || '');
  const [category, setCategory] = useState(project?.category || '');
  const [location, setLocation] = useState(project?.location || '');
  const [year, setYear] = useState(project?.year || '');
  const [clientName, setClientName] = useState(project?.client_name || '');
  const [areaSize, setAreaSize] = useState(project?.area_size || '');
  const [designStyle, setDesignStyle] = useState(project?.design_style || '');
  const [shortDescription, setShortDescription] = useState(project?.short_description || '');
  const [context, setContext] = useState(project?.context || '');
  const [problem, setProblem] = useState(project?.problem || '');
  const [strategicDecision, setStrategicDecision] = useState(project?.strategic_decision || '');
  const [execution, setExecution] = useState(project?.execution || '');
  const [impact, setImpact] = useState(project?.impact || '');
  const [status, setStatus] = useState(project?.status || 'draft');
  const [featured, setFeatured] = useState(project?.featured || false);
  const [coverImageUrl, setCoverImageUrl] = useState(project?.cover_image_url || '');
  const [images, setImages] = useState<ProjectImage[]>(project?.project_images || []);

  const sortedImages = useMemo(() => [...images].sort((a, b) => a.sort_order - b.sort_order), [images]);

  function syncSlug(nextTitle: string) {
    setTitle(nextTitle);
    if (!isEditing && !slug) setSlug(slugify(nextTitle));
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (!project?.id) {
      setMessage('Simpan project dulu sebelum upload gambar.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const supabase = createSupabaseBrowserClient();
      const uploaded: ProjectImage[] = [];

      for (const file of Array.from(files)) {
        const path = `${project.id}/${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
        const { error: uploadError } = await supabase.storage.from('project-images').upload(path, file, {
          cacheControl: '3600',
          upsert: false,
        });

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage.from('project-images').getPublicUrl(path);
        const imageUrl = publicUrl.publicUrl;

        const { data, error } = await supabase
          .from('project_images')
          .insert({
            project_id: project.id,
            image_url: imageUrl,
            alt_text: title,
            sort_order: images.length + uploaded.length,
            is_cover: false,
          })
          .select('*')
          .single();

        if (error) throw error;
        uploaded.push(data as ProjectImage);
      }

      setImages((current) => [...current, ...uploaded]);
      if (!coverImageUrl && uploaded[0]) setCoverImageUrl(uploaded[0].image_url);
      setMessage('Gambar berhasil diupload.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Upload gagal.');
    } finally {
      setLoading(false);
    }
  }

  async function setAsCover(image: ProjectImage) {
    setCoverImageUrl(image.image_url);
    setImages((current) => current.map((item) => ({ ...item, is_cover: item.id === image.id })));
  }

  async function deleteImage(image: ProjectImage) {
    const confirmed = window.confirm('Hapus gambar ini?');
    if (!confirmed) return;

    setLoading(true);
    setMessage('');

    try {
      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.from('project_images').delete().eq('id', image.id);
      if (error) throw error;
      setImages((current) => current.filter((item) => item.id !== image.id));
      if (coverImageUrl === image.image_url) setCoverImageUrl('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Gagal menghapus gambar.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const supabase = createSupabaseBrowserClient();
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) throw userError || new Error('Session admin tidak ditemukan.');

      const payload = {
        title,
        slug: slug || slugify(title),
        category,
        location,
        year,
        client_name: clientName || null,
        area_size: areaSize || null,
        design_style: designStyle || null,
        short_description: shortDescription,
        context,
        problem,
        strategic_decision: strategicDecision,
        execution,
        impact,
        status,
        featured,
        cover_image_url: coverImageUrl || null,
        updated_by: userData.user.id,
      };

      if (isEditing && project?.id) {
        const { error } = await supabase.from('projects').update(payload).eq('id', project.id);
        if (error) throw error;

        for (const image of images) {
          await supabase.from('project_images').update({ is_cover: image.image_url === coverImageUrl }).eq('id', image.id);
        }

        setMessage('Project berhasil diperbarui.');
        router.refresh();
      } else {
        const { data, error } = await supabase
          .from('projects')
          .insert({ ...payload, created_by: userData.user.id })
          .select('id')
          .single();
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
      const supabase = createSupabaseBrowserClient();
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
          <input value={category} onChange={(event) => setCategory(event.target.value)} />
        </div>
        <div>
          <label>Location</label>
          <input value={location} onChange={(event) => setLocation(event.target.value)} />
        </div>
        <div>
          <label>Year</label>
          <input value={year} onChange={(event) => setYear(event.target.value)} />
        </div>
        <div>
          <label>Client Name Optional</label>
          <input value={clientName} onChange={(event) => setClientName(event.target.value)} />
        </div>
        <div>
          <label>Area Size Optional</label>
          <input value={areaSize} onChange={(event) => setAreaSize(event.target.value)} />
        </div>
        <div>
          <label>Design Style Optional</label>
          <input value={designStyle} onChange={(event) => setDesignStyle(event.target.value)} />
        </div>
        <div>
          <label>Status</label>
          <select value={status} onChange={(event) => setStatus(event.target.value as 'draft' | 'published')}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
        <div className="flex items-center gap-3 pt-7">
          <input id="featured" type="checkbox" checked={featured} onChange={(event) => setFeatured(event.target.checked)} className="h-4 w-4" />
          <label htmlFor="featured" className="!mb-0">Featured Project</label>
        </div>
      </div>

      <div className="grid gap-6 rounded-sm border border-white/10 bg-white/[0.025] p-6 md:p-8">
        <div>
          <label>Short Description</label>
          <textarea value={shortDescription} onChange={(event) => setShortDescription(event.target.value)} />
        </div>
        <div>
          <label>Context</label>
          <textarea value={context} onChange={(event) => setContext(event.target.value)} />
        </div>
        <div>
          <label>Problem</label>
          <textarea value={problem} onChange={(event) => setProblem(event.target.value)} />
        </div>
        <div>
          <label>Strategic Decision</label>
          <textarea value={strategicDecision} onChange={(event) => setStrategicDecision(event.target.value)} />
        </div>
        <div>
          <label>Execution</label>
          <textarea value={execution} onChange={(event) => setExecution(event.target.value)} />
        </div>
        <div>
          <label>Impact</label>
          <textarea value={impact} onChange={(event) => setImpact(event.target.value)} />
        </div>
      </div>

      {isEditing ? (
        <div className="rounded-sm border border-white/10 bg-white/[0.025] p-6 md:p-8">
          <label>Upload Images</label>
          <input type="file" multiple accept="image/*" onChange={(event) => handleUpload(event.target.files)} />
          <input type="hidden" value={coverImageUrl} readOnly />
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {sortedImages.map((image) => (
              <div key={image.id} className="overflow-hidden rounded-sm border border-white/10 bg-black/20">
                <img src={image.image_url} alt={image.alt_text || title} className="aspect-[4/3] w-full object-cover" />
                <div className="flex gap-2 p-3">
                  <button type="button" onClick={() => setAsCover(image)} className="flex-1 rounded bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.12em] text-white/70">
                    {coverImageUrl === image.image_url ? 'Cover' : 'Set Cover'}
                  </button>
                  <button type="button" onClick={() => deleteImage(image)} className="rounded bg-red-500/20 px-3 py-2 text-xs uppercase tracking-[0.12em] text-red-200">
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {message ? <p className="text-sm leading-6 text-white/70">{message}</p> : null}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <button disabled={loading} type="submit" className="rounded-[4px] bg-[#D4AF37] px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#080807] transition hover:bg-[#E2C866] disabled:opacity-60">
          {loading ? 'Menyimpan...' : isEditing ? 'Simpan Perubahan' : 'Buat Project'}
        </button>
        {isEditing ? (
          <button disabled={loading} type="button" onClick={handleDelete} className="rounded-[4px] border border-red-400/30 px-7 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-red-200 transition hover:bg-red-500/10">
            Hapus Project
          </button>
        ) : null}
      </div>
    </form>
  );
}
