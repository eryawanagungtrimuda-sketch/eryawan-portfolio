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
};

export type ProjectFormState = {
  error?: string;
  success?: string;
};
