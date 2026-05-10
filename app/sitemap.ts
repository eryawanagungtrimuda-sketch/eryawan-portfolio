import type { MetadataRoute } from 'next';
import { getPublishedProjects } from '@/lib/projects';
import { getPublishedInsights } from '@/lib/insights';

const baseUrl = 'https://eryawanagung.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [projects, insights] = await Promise.all([getPublishedProjects(), getPublishedInsights()]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/karya`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/wawasan`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/tentang`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/kontak`, changeFrequency: 'monthly', priority: 0.6 },
  ];

  const projectRoutes = projects.map((project) => ({
    url: `${baseUrl}/karya/${project.slug}`,
    lastModified: project.updated_at || project.published_at || project.created_at,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const insightRoutes = insights.map((insight) => ({
    url: `${baseUrl}/wawasan/${insight.slug}`,
    lastModified: insight.updated_at || insight.published_at || insight.created_at,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  return [...staticRoutes, ...projectRoutes, ...insightRoutes];
}
