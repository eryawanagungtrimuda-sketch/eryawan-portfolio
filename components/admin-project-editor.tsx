'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import type { Project } from '@/lib/types';
import ProjectForm from './project-form';

type Props = {
  id: string;
};

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default function AdminProjectEditor({ id }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadProject() {
      setLoading(true);
      setMessage('');

      if (!id || !uuidPattern.test(id)) {
        setMessage(`Project id tidak valid: ${id || '(kosong)'}. Buka project dari tombol Edit di dashboard.`);
        setLoading(false);
        return;
      }

      try {
        const supabase = getSupabaseClient();
        const { data, error, status } = await supabase
          .from('projects')
          .select(
            'id,title,slug,category,design_category,design_style,area_type,area_tags,cover_image,problem,solution,impact,konteks,konflik,keputusan_desain,pendekatan,dampak,insight_kunci,client_problem_raw,design_reference,area_scope,project_size,is_published,created_at,project_images(id,project_id,image_url,alt_text,sort_order,created_at)'
          )
          .eq('id', id)
          .maybeSingle();

        if (error) {
          console.error('[AdminProjectEditor] Failed to fetch project by id', {
            id,
            status,
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          });
          throw new Error(`Gagal membaca project dari Supabase: ${error.message}`);
        }

        if (!data) {
          setMessage(`Project dengan id ${id} tidak ditemukan di table public.projects. Pastikan tombol Edit memakai project.id dari dashboard dan data belum terhapus.`);
          return;
        }

        const sortedImages = [...(data.project_images || [])].sort((a, b) => a.sort_order - b.sort_order);
        setProject({ ...(data as Project), project_images: sortedImages });
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Terjadi kesalahan saat memuat project.');
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [id]);

  if (loading) return <p className="py-10 text-white/50">Memuat project...</p>;
  if (message) return <p className="py-10 text-red-300">{message}</p>;
  if (!project) return <p className="py-10 text-white/50">Project belum tersedia.</p>;

  return <ProjectForm project={project} />;
}
