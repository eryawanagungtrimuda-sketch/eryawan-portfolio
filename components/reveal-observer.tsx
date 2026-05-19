'use client';

import { useEffect } from 'react';

export default function RevealObserver() {
  useEffect(() => {
    document.documentElement.classList.add('reveal-ready');

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.reveal-on-scroll'));

    if (media.matches) {
      nodes.forEach((node) => node.classList.add('is-visible'));
      return () => {
        document.documentElement.classList.remove('reveal-ready');
      };
    }

    if (!('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('is-visible'));
      return () => {
        document.documentElement.classList.remove('reveal-ready');
      };
    }

    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    if (isMobile) {
      const groups = new Map<HTMLElement, HTMLElement[]>();
      nodes.forEach((node) => {
        if (node.style.getPropertyValue('--reveal-delay')) return;
        const group = node.closest('section') as HTMLElement | null;
        if (!group) return;
        const current = groups.get(group) || [];
        current.push(node);
        groups.set(group, current);
      });

      groups.forEach((groupNodes) => {
        groupNodes.forEach((node, index) => {
          node.style.setProperty('--reveal-delay', `${Math.min(index * 100, 700)}ms`);
        });
      });
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      isMobile
        ? { threshold: 0.12, rootMargin: '0px 0px -4% 0px' }
        : { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove('reveal-ready');
    };
  }, []);

  return null;
}
