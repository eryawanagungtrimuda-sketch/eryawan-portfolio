'use client';

import { useEffect } from 'react';

const caseStudyLinks = ['/case-study/residential-interior', '/case-study/workspace-interior'];

export default function PortfolioClicks() {
  useEffect(() => {
    const cards = Array.from(document.querySelectorAll<HTMLElement>('#portfolio article'));

    cards.forEach((card, index) => {
      const href = caseStudyLinks[index];
      if (!href) return;

      card.setAttribute('role', 'link');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-label', `Lihat studi kasus ${index + 1}`);

      const openCaseStudy = () => {
        window.location.href = href;
      };

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openCaseStudy();
        }
      };

      card.addEventListener('click', openCaseStudy);
      card.addEventListener('keydown', handleKeyDown);

      return () => {
        card.removeEventListener('click', openCaseStudy);
        card.removeEventListener('keydown', handleKeyDown);
      };
    });
  }, []);

  return null;
}
