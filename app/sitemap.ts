import type { MetadataRoute } from 'next';
import { getPublishedProjects } from '@/lib/projects';
import { getPublishedInsights } from '@/lib/insights';
import { absoluteUrl } from '@/lib/site-url';

const SITE_LAST_MODIFIED = new Date('2026-05-16');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, insights] = await Promise.all([getPublishedProjects(), getPublishedInsights()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    '/',
    '/karya',
    '/wawasan',
    '/kontak',
    '/tentang',
    '/mulai-project',
  ].map((path) => ({
    url: absoluteUrl(path),
    lastModified: SITE_LAST_MODIFIED,
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.8,
  }));

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => {
    const updatedAt = (project as { updated_at?: string | null }).updated_at;
    return {
      url: absoluteUrl(`/karya/${project.slug}`),
      lastModified: updatedAt ? new Date(updatedAt) : project.created_at ? new Date(project.created_at) : SITE_LAST_MODIFIED,
      changeFrequency: 'monthly',
      priority: 0.7,
    };
  });

  const insightRoutes: MetadataRoute.Sitemap = insights.map((insight) => ({
    url: absoluteUrl(`/wawasan/${insight.slug}`),
    lastModified: insight.updated_at
      ? new Date(insight.updated_at)
      : insight.created_at
        ? new Date(insight.created_at)
        : SITE_LAST_MODIFIED,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes, ...insightRoutes];
}
