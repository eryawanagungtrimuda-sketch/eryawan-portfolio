import { createSupabaseServerClient, isSupabaseConfigured } from './supabase';
import type { Project } from './types';
import { unstable_noStore as noStore } from 'next/cache';

const projectColumns = 'id,title,slug,category,design_category,design_style,area_type,area_tags,cover_image,problem,solution,impact,konteks,konflik,keputusan_desain,pendekatan,dampak,insight_kunci,is_published,created_at';

const internalBriefFallbackFields = {
  client_problem_raw: null,
  design_reference: null,
  area_scope: null,
  project_size: null,
} as const;

export const fallbackProjects: Project[] = [
  {
    id: 'fallback-residential',
    title: 'Project 01 — Residential Interior',
    slug: 'residential-interior',
    category: 'Residential Interior',
    design_category: 'Interior',
    design_style: 'Modern',
    area_type: 'Full House',
    area_tags: [],
    cover_image: null,
    problem: 'Sirkulasi harian tidak efisien dan area publik belum bekerja sebagai penghubung aktivitas.',
    solution: 'Flow ruang disusun ulang dengan prioritas pada zoning, titik aktivitas, dan kemudahan bergerak.',
    impact: 'Ruang menjadi lebih efisien, aktivitas harian lebih lancar, keputusan klien lebih cepat, dan revisi layout dapat dikurangi sejak fase awal.',
    konteks: 'Konteks proyek fallback belum tersedia.',
    konflik: 'Konflik proyek fallback belum tersedia.',
    keputusan_desain: 'Keputusan desain proyek fallback belum tersedia.',
    pendekatan: 'Pendekatan proyek fallback belum tersedia.',
    dampak: 'Dampak proyek fallback belum tersedia.',
    insight_kunci: 'Insight kunci proyek fallback belum tersedia.',
    ...internalBriefFallbackFields,
    is_published: true,
    created_at: new Date().toISOString(),
    project_images: [],
  },
  {
    id: 'fallback-workspace',
    title: 'Project 02 — Workspace Interior',
    slug: 'workspace-interior',
    category: 'Workspace Interior',
    design_category: 'Interior',
    design_style: 'Contemporary',
    area_type: 'Office',
    area_tags: [],
    cover_image: null,
    problem: 'Area kerja belum membagi fokus, kolaborasi, dan privasi secara jelas.',
    solution: 'Ruang dibagi berdasarkan intensitas aktivitas, kebutuhan privasi, dan alur kerja pengguna ruang.',
    impact: 'Ritme kerja lebih terarah, pengalaman ruang meningkat, dan keputusan desain lebih mudah dipahami.',
    konteks: 'Konteks proyek fallback belum tersedia.',
    konflik: 'Konflik proyek fallback belum tersedia.',
    keputusan_desain: 'Keputusan desain proyek fallback belum tersedia.',
    pendekatan: 'Pendekatan proyek fallback belum tersedia.',
    dampak: 'Dampak proyek fallback belum tersedia.',
    insight_kunci: 'Insight kunci proyek fallback belum tersedia.',
    ...internalBriefFallbackFields,
    is_published: true,
    created_at: new Date().toISOString(),
    project_images: [],
  },
];

export async function getPublishedProjects() {
  noStore();
  if (!isSupabaseConfigured) return fallbackProjects;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('projects')
    .select(projectColumns)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  if (error || !data) return fallbackProjects;
  return data as Project[];
}

export async function getPublishedProjectBySlug(slug: string) {
  noStore();
  if (!isSupabaseConfigured) {
    return fallbackProjects.find((project) => project.slug === slug) || null;
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('projects')
    .select(`${projectColumns},project_images(id,project_id,image_url,alt_text,sort_order,area_tags,display_ratio,object_position,created_at)`)
    .eq('slug', slug)
    .eq('is_published', true)
    .order('sort_order', { referencedTable: 'project_images', ascending: true })
    .single();

  if (error || !data) return null;
  return data as Project;
}
