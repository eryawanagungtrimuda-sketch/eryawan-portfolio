'use client';

import { useEffect } from 'react';

type ApiProject = {
  slug: string;
};

const fallbackLinks = ['/karya/residential-interior', '/karya/workspace-interior'];

export default function PortfolioClicks() {
  useEffect(() => {
    let cancelled = false;

    async function hydratePortfolioLinks() {
      const cards = Array.from(document.querySelectorAll<HTMLElement>('#portfolio article'));
      if (cards.length === 0) return;

      let links = fallbackLinks;

      try {
        const response = await fetch('/api/projects', { cache: 'no-store' });
        if (response.ok) {
          const payload = (await response.json()) as { projects?: ApiProject[] };
          const dynamicLinks = payload.projects?.map((project) => `/karya/${project.slug}`).filter(Boolean) || [];
          if (dynamicLinks.length > 0) links = dynamicLinks;
        }
      } catch {
        links = fallbackLinks;
      }

      if (cancelled) return;

      cards.forEach((card, index) => {
        const href = links[index];
        if (!href) return;

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
        card.setAttribute('aria-label', `Lihat studi kasus ${index + 1}`);
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
