import { createSupabaseServerClient, isSupabaseConfigured } from './supabase';
import type { ProjectWithImages } from './types';

export const fallbackProjects: ProjectWithImages[] = [
  {
    id: 'fallback-residential',
    title: 'Project 01 — Residential Interior',
    slug: 'residential-interior',
    category: 'Residential Interior',
    location: null,
    year: null,
    client_name: null,
    area_size: null,
    design_style: null,
    short_description: 'Sirkulasi harian tidak efisien dan area publik belum bekerja sebagai penghubung aktivitas.',
    context: 'Hunian dengan kebutuhan aktivitas harian yang padat, namun alur ruang belum terbaca jelas oleh pengguna ruang.',
    problem: 'Sirkulasi terasa terputus, area publik belum bekerja sebagai penghubung, dan keputusan layout berisiko membuat ruang terasa kurang efisien.',
    strategic_decision: 'Flow ruang disusun ulang dengan prioritas pada zoning, titik aktivitas, dan kemudahan bergerak.',
    execution: 'Area aktivitas utama diperjelas, transisi antar-ruang dibuat lebih logis, dan elemen visual diposisikan sebagai pendukung fungsi.',
    impact: 'Ruang menjadi lebih efisien, aktivitas harian lebih lancar, keputusan klien lebih cepat, dan revisi layout dapat dikurangi sejak fase awal.',
    status: 'published',
    featured: true,
    cover_image_url: null,
    created_by: null,
    updated_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    project_images: [],
  },
  {
    id: 'fallback-workspace',
    title: 'Project 02 — Workspace Interior',
    slug: 'workspace-interior',
    category: 'Workspace Interior',
    location: null,
    year: null,
    client_name: null,
    area_size: null,
    design_style: null,
    short_description: 'Area kerja belum membagi fokus, kolaborasi, dan privasi secara jelas.',
    context: 'Area kerja membutuhkan ruang yang mampu menampung fokus, kolaborasi, dan ritme aktivitas yang berubah sepanjang hari.',
    problem: 'Fungsi ruang belum terbagi dengan jelas, sehingga aktivitas fokus dan interaksi berpotensi saling mengganggu.',
    strategic_decision: 'Ruang dibagi berdasarkan intensitas aktivitas, kebutuhan privasi, dan alur kerja pengguna ruang.',
    execution: 'Zoning kerja disusun lebih tegas, area transisi dibuat lebih terbaca, dan komposisi visual dipakai untuk memperkuat orientasi.',
    impact: 'Pengalaman ruang meningkat, ritme kerja lebih terarah, aktivitas lebih lancar, dan keputusan desain lebih mudah dipahami.',
    status: 'published',
    featured: true,
    cover_image_url: null,
    created_by: null,
    updated_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    project_images: [],
  },
];

export async function getPublishedProjects() {
  if (!isSupabaseConfigured) return fallbackProjects;

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*, project_images(*)')
    .eq('status', 'published')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error || !data) return fallbackProjects;
  return data as ProjectWithImages[];
}

export async function getPublishedProjectBySlug(slug: string) {
  if (!isSupabaseConfigured) {
    return fallbackProjects.find((project) => project.slug === slug) || null;
  }

  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from('projects')
    .select('*, project_images(*)')
    .eq('status', 'published')
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as ProjectWithImages;
}
