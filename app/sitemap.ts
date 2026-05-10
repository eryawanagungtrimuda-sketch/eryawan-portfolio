import type { MetadataRoute } from 'next';
import { getPublishedProjects } from '@/lib/projects';
import { getPublishedInsights } from '@/lib/insights';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://eryawanagung.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, insights] = await Promise.all([getPublishedProjects(), getPublishedInsights()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    '/',
    '/karya',
    '/wawasan',
    '/kontak',
    '/tentang',
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: path === '/' ? 1 : 0.8,
  }));

  const projectRoutes: MetadataRoute.Sitemap = projects.map((project) => ({
    url: `${SITE_URL}/karya/${project.slug}`,
    lastModified: project.created_at ? new Date(project.created_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const insightRoutes: MetadataRoute.Sitemap = insights.map((insight) => ({
    url: `${SITE_URL}/wawasan/${insight.slug}`,
    lastModified: insight.updated_at ? new Date(insight.updated_at) : new Date(insight.created_at || Date.now()),
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes, ...insightRoutes];
}
