import { unstable_noStore as noStore } from 'next/cache';
import { createSupabaseServerClient, isSupabaseConfigured } from './supabase';
import type { Insight, InsightSourceProject, InsightSourceType } from './types';
import type { SupabaseClient } from '@supabase/supabase-js';

const insightColumns = 'id,title,slug,category,content_type,source_type,source_project_id,cover_image,excerpt,content,ai_prompt_source,is_published,created_at,updated_at';
const publicInsightListColumns = 'id,title,slug,category,content_type,source_type,cover_image,excerpt,is_published,created_at,updated_at';

export type PublicInsightListItem = Omit<Insight, 'source_project_id' | 'content' | 'ai_prompt_source'>;

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

function normalizeLegacyText(value?: string | null) {
  return (value || '').toLowerCase().trim().replace(/\s+/g, ' ');
}

function normalizeLegacySlug(value?: string | null) {
  return normalizeLegacyText(value).replace(/&/g, ' ').replace(/[^a-z0-9\s-]/g, ' ').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '');
}

function includesToken(text: string, token: string) {
  return Boolean(token) && text.includes(token);
}

export async function findRelatedInsightForProject(
  project: { id: string; slug?: string | null; title?: string | null },
  options?: { supabase?: SupabaseClient },
) {
  const supabase = options?.supabase || createSupabaseServerClient();
  const { data, error } = await supabase
    .from('insights')
    .select('id,slug,source_project_id,ai_prompt_source,title,excerpt,content')
    .order('created_at', { ascending: false });
  if (error) throw error;

  const projectId = (project.id || '').trim();
  const projectSlug = normalizeLegacySlug(project.slug);
  const projectTitle = normalizeLegacyText(project.title);

  const rows = (data || []) as Pick<Insight, 'id' | 'slug' | 'source_project_id' | 'title' | 'excerpt' | 'content' | 'ai_prompt_source'>[];

  for (const row of rows) {
    if ((row.source_project_id || '').trim() === projectId) return row;
  }

  for (const row of rows) {
    if (row.source_project_id) continue;
    const haystack = normalizeLegacyText([row.ai_prompt_source, row.excerpt, row.content].filter(Boolean).join(' '));
    if (projectSlug && includesToken(haystack, projectSlug)) return row;
  }

  for (const row of rows) {
    if (row.source_project_id) continue;
    const haystack = normalizeLegacyText([row.ai_prompt_source, row.excerpt, row.content, row.title].filter(Boolean).join(' '));
    if (projectTitle && includesToken(haystack, projectTitle)) return row;
  }

  return null;
}

export async function getPublishedInsights(): Promise<PublicInsightListItem[]> {
  noStore();
  if (!isSupabaseConfigured) return [] as PublicInsightListItem[];
  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from('insights')
    .select(`${publicInsightListColumns},insight_images(image_url,sort_order)`)
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  const insights = ((data || []) as PublicInsightListItem[]).map((insight) => {
    if (insight.cover_image || insight.content_type !== 'review_karya') return insight;
    const fallbackImage = insight.insight_images?.slice().sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url || null;
    return { ...insight, cover_image: fallbackImage };
  });

  return insights;
}

export async function getPublishedInsightBySlug(slug: string) {
  noStore();
  if (!isSupabaseConfigured) return null;
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from('insights').select(insightColumns).eq('slug', slug).eq('is_published', true).maybeSingle();
  return (data as Insight) || null;
}

export async function getPublishedInsightDetailBySlug(slug: string) {
  noStore();
  const insight = await getPublishedInsightBySlug(slug);
  if (!insight) return null;

  const supabase = createSupabaseServerClient();
  const { data: images } = await supabase.from('insight_images').select('image_url,sort_order').eq('insight_id', insight.id).order('sort_order');

  if (insight.source_type !== 'project' || !insight.source_project_id) {
    return { insight, sourceProject: null as InsightSourceProject | null, images: (images || []) as { image_url: string; sort_order: number }[] };
  }

  const { data: sourceProject } = await supabase
    .from('projects')
    .select('id,title,slug,category,cover_image')
    .eq('id', insight.source_project_id)
    .eq('is_published', true)
    .maybeSingle();

  return { insight, sourceProject: (sourceProject as InsightSourceProject | null) || null, images: (images || []) as { image_url: string; sort_order: number }[] };
}

export async function getInsightById(id: string) {
  if (!isSupabaseConfigured) return null;
  const supabase = createSupabaseServerClient();
  const { data } = await supabase.from('insights').select(insightColumns).eq('id', id).maybeSingle();
  return (data as Insight) || null;
}

export async function createInsight(payload: Partial<Insight>, options?: { supabase?: SupabaseClient }) {
  const supabase = options?.supabase || createSupabaseServerClient();
  const { data, error } = await supabase.from('insights').insert(payload).select(insightColumns).single();
  if (error) throw error;
  return data as Insight;
}

export async function updateInsight(id: string, payload: Partial<Insight>) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from('insights').update(payload).eq('id', id).select(insightColumns).single();
  if (error) throw error;
  return data as Insight;
}

export async function createInsightDraftFromProject(projectId: string, options?: { supabase?: SupabaseClient }) {
  const supabase = options?.supabase || createSupabaseServerClient();
  const { data: project, error } = await supabase.from('projects').select('*').eq('id', projectId).single();
  if (error || !project) throw error || new Error('Project tidak ditemukan.');
  const existingInsight = await findRelatedInsightForProject(project, { supabase });
  if (existingInsight) {
    return existingInsight as Insight;
  }
  const title = `Pelajaran Desain dari ${project.title}`;
  const excerpt = `Wawasan ini membaca keputusan ruang, masalah utama, dan dampak desain dari project ${project.title}.`;
  const content = [
    `# ${title}`,
    '',
    `## Konteks\n${project.konteks || '-'}`,
    `\n## Masalah Utama\n${project.problem || '-'}`,
    `\n## Konflik\n${project.konflik || '-'}`,
    `\n## Solusi\n${project.solution || '-'}`,
    `\n## Keputusan Desain\n${project.keputusan_desain || '-'}`,
    `\n## Pendekatan\n${project.pendekatan || '-'}`,
    `\n## Dampak\n${project.dampak || project.impact || '-'}`,
    `\n## Insight Kunci\n${project.insight_kunci || '-'}`,
  ].join('\n');

  return createInsight({
    title,
    slug: `${slugify(title)}-${Date.now()}`,
    category: project.category,
    source_type: 'project' as InsightSourceType,
    source_project_id: project.id,
    cover_image: project.cover_image,
    excerpt,
    content,
    ai_prompt_source: `project:${project.id}`,
    is_published: false,
  }, { supabase });
}
