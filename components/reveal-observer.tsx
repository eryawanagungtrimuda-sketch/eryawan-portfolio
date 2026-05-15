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

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    nodes.forEach((node) => observer.observe(node));
    return () => {
      observer.disconnect();
      document.documentElement.classList.remove('reveal-ready');
    };
  }, []);

  return null;
}
