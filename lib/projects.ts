import { createSupabaseServerClient, isSupabaseConfigured } from './supabase';
import type { Project } from './types';

export const fallbackProjects: Project[] = [
  {
    id: 'fallback-residential',
    title: 'Project 01 — Residential Interior',
    slug: 'residential-interior',
    category: 'Residential Interior',
    cover_image: null,
    problem: 'Sirkulasi harian tidak efisien dan area publik belum bekerja sebagai penghubung aktivitas.',
    solution: 'Flow ruang disusun ulang dengan prioritas pada zoning, titik aktivitas, dan kemudahan bergerak.',
    impact: 'Ruang menjadi lebih efisien, aktivitas harian lebih lancar, keputusan klien lebih cepat, dan revisi layout dapat dikurangi sejak fase awal.',
    created_at: new Date().toISOString(),
    project_images: [],
  },
  {
    id: 'fallback-workspace',
    title: 'Project 02 — Workspace Interior',
    slug: 'workspace-interior',
    category: 'Workspace Interior',
    cover_image: null,
    problem: 'Area kerja belum membagi fokus, kolaborasi, dan privasi secara jelas.',
    solution: 'Ruang dibagi berdasarkan intensitas aktivitas, kebutuhan privasi, dan alur kerja pengguna ruang.',
    impact: 'Ritme kerja lebih terarah, pengalaman ruang meningkat, dan keputusan desain lebih mudah dipahami.',
    created_at: new Date().toISOString(),
    project_images: [],
  },
];

export async function getPublishedProjects() {
  if (!isSupabaseConfigured) return fallbackProjects;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('projects')
    .select('id,title,slug,category,cover_image,problem,solution,impact,created_at')
    .order('created_at', { ascending: false });

  if (error || !data) return fallbackProjects;
  return data as Project[];
}

export async function getPublishedProjectBySlug(slug: string) {
  if (!isSupabaseConfigured) {
    return fallbackProjects.find((project) => project.slug === slug) || null;
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('projects')
    .select('id,title,slug,category,cover_image,problem,solution,impact,created_at,project_images(id,project_id,image_url,alt_text,sort_order,created_at)')
    .eq('slug', slug)
    .order('sort_order', { referencedTable: 'project_images', ascending: true })
    .single();

  if (error || !data) return null;
  return data as Project;
}
