export type ProjectImage = {
  id: string;
  project_id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
  created_at: string;
};

export type Project = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  cover_image: string | null;
  problem: string | null;
  solution: string | null;
  impact: string | null;
  created_at: string;
  project_images?: ProjectImage[];
};

export type ProjectFormState = {
  error?: string;
  success?: string;
};
