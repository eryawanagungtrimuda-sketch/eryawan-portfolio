'use client';

import { useEffect } from 'react';

const MOBILE_STAGGER_MS = 90;
const MAX_AUTO_STAGGER_MS = 450;

function isInitiallyReadable(node: HTMLElement) {
  const rect = node.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

  return rect.top < viewportHeight * 0.88 && rect.bottom > 0;
}

export default function RevealObserver() {
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.reveal-on-scroll'));

    if (media.matches) {
      nodes.forEach((node) => node.classList.add('is-visible'));
      document.documentElement.classList.add('reveal-ready');
      return () => {
        document.documentElement.classList.remove('reveal-ready');
      };
    }

    if (!('IntersectionObserver' in window)) {
      nodes.forEach((node) => node.classList.add('is-visible'));
      document.documentElement.classList.add('reveal-ready');
      return () => {
        document.documentElement.classList.remove('reveal-ready');
      };
    }

    const isMobile = window.matchMedia('(max-width: 767px)').matches;

    if (isMobile) {
      const groups = new Map<HTMLElement, HTMLElement[]>();
      nodes.forEach((node) => {
        if (!node.classList.contains('mobile-card-reveal')) return;
        if (node.style.getPropertyValue('--reveal-delay')) return;
        const group = node.closest('[data-reveal-group], section') as HTMLElement | null;
        if (!group) return;
        const current = groups.get(group) || [];
        current.push(node);
        groups.set(group, current);
      });

      groups.forEach((groupNodes) => {
        groupNodes.forEach((node, index) => {
          node.style.setProperty('--reveal-delay', `${Math.min(index * MOBILE_STAGGER_MS, MAX_AUTO_STAGGER_MS)}ms`);
        });
      });
    }

    nodes.forEach((node) => {
      if (isInitiallyReadable(node)) {
        node.classList.add('is-visible');
      }
    });
    document.documentElement.classList.add('reveal-ready');

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
        ? { threshold: 0.1, rootMargin: '0px 0px 12% 0px' }
        : { threshold: 0.14, rootMargin: '0px 0px 8% 0px' }
    );

    nodes.forEach((node) => {
      if (!node.classList.contains('is-visible')) {
        observer.observe(node);
      }
    });
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove('reveal-ready');
    };
  }, []);

  return null;
}
