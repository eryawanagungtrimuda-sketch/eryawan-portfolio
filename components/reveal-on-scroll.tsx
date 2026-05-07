'use client';

import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';

type RevealOnScrollProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: keyof JSX.IntrinsicElements;
};

export default function RevealOnScroll({ children, className = '', delay = 0, as = 'div' }: RevealOnScrollProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateReducedMotion = () => setReducedMotion(mediaQuery.matches);

    updateReducedMotion();
    mediaQuery.addEventListener('change', updateReducedMotion);

    return () => {
      mediaQuery.removeEventListener('change', updateReducedMotion);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      setIsVisible(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [reducedMotion]);

  const Component = as as keyof JSX.IntrinsicElements;
  const classes = [
    'reveal',
    isVisible ? 'is-visible' : '',
    className || '',
  ].filter(Boolean).join(' ');
  const revealStyle: CSSProperties | undefined =
    reducedMotion
      ? undefined
      : delay > 0
        ? { transitionDelay: `${delay}ms` }
        : undefined;

  return (
    <Component
      ref={ref as never}
      className={classes}
      style={revealStyle}
    >
      {children}
    </Component>
  );
}
