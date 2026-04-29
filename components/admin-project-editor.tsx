'use client';

import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';
import type { Project } from '@/lib/types';
import ProjectForm from './project-form';

type Props = {
  id: string;
};

export default function AdminProjectEditor({ id }: Props) {
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadProject() {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase
          .from('projects')
          .select('id,title,slug,category,cover_image,problem,solution,impact,created_at,project_images(id,project_id,image_url,alt_text,sort_order,created_at)')
          .eq('id', id)
          .order('sort_order', { referencedTable: 'project_images', ascending: true })
          .single();

        if (error) throw error;
        setProject(data as Project);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Project tidak ditemukan.');
      } finally {
        setLoading(false);
      }
    }

    loadProject();
  }, [id]);

  if (loading) return <p className="py-10 text-white/50">Memuat project...</p>;
  if (message) return <p className="py-10 text-red-300">{message}</p>;
  if (!project) return <p className="py-10 text-white/50">Project tidak ditemukan.</p>;

  return <ProjectForm project={project} />;
}
