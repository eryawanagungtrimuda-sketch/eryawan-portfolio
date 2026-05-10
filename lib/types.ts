export type ProjectImage = {
  id: string;
  project_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  area_tags: string[] | null;
  created_at: string;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  design_category: string | null;
  design_style: string | null;
  area_type: string | null;
  area_tags: string[] | null;
  cover_image: string | null;
  problem: string | null;
  solution: string | null;
  impact: string | null;
  konteks: string | null;
  konflik: string | null;
  keputusan_desain: string | null;
  pendekatan: string | null;
  dampak: string | null;
  insight_kunci: string | null;
  client_problem_raw: string | null;
  design_reference: string | null;
  area_scope: string | null;
  project_size: string | null;
  is_published: boolean;
  created_at: string;
  project_images?: ProjectImage[];
};

export type ProjectFormState = {
  error?: string;
  success?: string;
};

export type InsightSourceType = 'project' | 'image_review' | 'manual';

export type Insight = {
  insight_images?: Pick<InsightImage, 'image_url' | 'sort_order'>[];
  content_type: 'artikel' | 'review_karya';
  id: string;
  title: string;
  slug: string;
  category: string | null;
  source_type: InsightSourceType;
  source_project_id: string | null;
  cover_image: string | null;
  excerpt: string | null;
  content: string | null;
  ai_prompt_source: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type InsightSourceProject = Pick<Project, 'id' | 'title' | 'slug' | 'category' | 'cover_image'>;

export type InsightImage = {
  id: string;
  insight_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
};


export type ProjectInquiryStatus = 'baru' | 'ditinjau' | 'dihubungi' | 'selesai' | 'arsip';

export type ProjectInquiry = {
  id: string;
  nama: string;
  perusahaan: string | null;
  email: string | null;
  whatsapp: string | null;
  jenis_kebutuhan: string;
  lokasi_project: string | null;
  estimasi_luas: string | null;
  tahap_project: string | null;
  timeline: string | null;
  budget_range: string | null;
  kebutuhan_utama: string;
  status_file: string | null;
  message_preview: string;
  status: ProjectInquiryStatus;
  source: string;
  created_at: string;
  updated_at: string;
};
