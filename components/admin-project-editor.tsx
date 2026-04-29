'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import type { Project, ProjectImage } from '@/lib/types';
import ProjectForm from './project-form';

type ProjectWithImages = Project & { project_images?: ProjectImage[] };

type Props = {
  id: string;
};

export default function AdminProjectEditor({ id }: Props) {
  const [project, setProject] = useState<ProjectWithImages | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadProject() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data, error } = await supabase
          .from('projects')
          .select('*, project_images(*)')
          .eq('id', id)
          .single();

        if (error) throw error;
        setProject(data as ProjectWithImages);
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
