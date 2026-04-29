export type ProjectStatus = 'draft' | 'published';

export type Project = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  location: string | null;
  year: string | null;
  client_name: string | null;
  area_size: string | null;
  design_style: string | null;
  short_description: string | null;
  context: string | null;
  problem: string | null;
  strategic_decision: string | null;
  execution: string | null;
  impact: string | null;
  status: ProjectStatus;
  featured: boolean;
  cover_image_url: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectImage = {
  id: string;
  project_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  is_cover: boolean;
  created_at: string;
};

export type ProjectWithImages = Project & {
  project_images?: ProjectImage[];
};

export type ProjectFormState = {
  error?: string;
  success?: string;
};
