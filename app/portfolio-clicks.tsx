'use client';

import { useEffect } from 'react';

type ApiProject = {
  title: string;
  slug: string;
  problem?: string | null;
  impact?: string | null;
  short_description?: string | null;
};

const fallbackProjects: ApiProject[] = [
  {
    title: 'Project 01 — Residential Interior',
    slug: 'residential-interior',
    problem: 'Sirkulasi harian tidak efisien dan area publik belum bekerja sebagai penghubung aktivitas.',
    impact: 'Ruang menjadi lebih terarah, aktivitas lebih lancar, dan keputusan layout lebih cepat disepakati.',
  },
  {
    title: 'Project 02 — Workspace Interior',
    slug: 'workspace-interior',
    problem: 'Area kerja belum membagi fokus, kolaborasi, dan privasi secara jelas.',
    impact: 'Ritme kerja lebih terarah, pengalaman ruang meningkat, dan keputusan desain lebih mudah dipahami.',
  },
];

function teaserMarkup(project: ApiProject) {
  const problem = project.problem || project.short_description || 'Masalah ruang dibaca sebagai dasar pengambilan keputusan desain.';
  const impact = project.impact || 'Ruang menjadi lebih terarah, efisien, dan mudah digunakan.';

  return `
    <div class="portfolio-db-teaser" aria-hidden="true">
      <p class="portfolio-db-teaser__label">Problem</p>
      <p class="portfolio-db-teaser__body">${problem}</p>
      <p class="portfolio-db-teaser__label">Impact</p>
      <p class="portfolio-db-teaser__body">${impact}</p>
      <p class="portfolio-db-teaser__cta">↗ Lihat Studi Kasus</p>
    </div>
  `;
}

export default function PortfolioClicks() {
  useEffect(() => {
    let cancelled = false;

    async function hydratePortfolioLinks() {
      const cards = Array.from(document.querySelectorAll<HTMLElement>('#portfolio article'));
      if (cards.length === 0) return;

      let projects = fallbackProjects;

      try {
        const response = await fetch('/api/projects', { cache: 'no-store' });
        if (response.ok) {
          const payload = (await response.json()) as { projects?: ApiProject[] };
          if (payload.projects && payload.projects.length > 0) projects = payload.projects;
        }
      } catch {
        projects = fallbackProjects;
      }

      if (cancelled) return;

      cards.forEach((card, index) => {
        const project = projects[index];
        if (!project) return;

        const href = `/karya/${project.slug}`;
        const title = card.querySelector('h3');
        const content = card.querySelector<HTMLElement>('.relative.z-10');

        if (title) title.textContent = project.title;
        if (content && !content.querySelector('.portfolio-db-teaser')) {
          content.insertAdjacentHTML('beforeend', teaserMarkup(project));
          card.classList.add('portfolio-hydrated');
        }

        const openCaseStudy = () => {
          window.location.href = href;
        };

        const handleKeyDown = (event: KeyboardEvent) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openCaseStudy();
          }
        };

        card.setAttribute('role', 'link');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-label', `Lihat studi kasus ${project.title}`);
        card.dataset.href = href;
        card.addEventListener('click', openCaseStudy);
        card.addEventListener('keydown', handleKeyDown);
      });
    }

    hydratePortfolioLinks();

    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
