'use client';

import { useEffect, useRef } from 'react';

type ScrollProgressProps = {
  className?: string;
};

export default function ScrollProgress({ className = '' }: ScrollProgressProps) {
  const barRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return undefined;

    let frameId = 0;

    const updateProgress = () => {
      frameId = 0;
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      const hasMeaningfulScroll = scrollableHeight > 240;

      if (!hasMeaningfulScroll) {
        bar.style.opacity = '0';
        bar.style.transform = 'scaleX(0)';
        return;
      }

      const progress = Math.min(Math.max(window.scrollY / scrollableHeight, 0), 1);
      bar.style.opacity = progress > 0.01 ? '1' : '0';
      bar.style.transform = `scaleX(${progress})`;
    };

    const requestProgressUpdate = () => {
      if (frameId) return;
      frameId = window.requestAnimationFrame(updateProgress);
    };

    updateProgress();
    window.addEventListener('scroll', requestProgressUpdate, { passive: true });
    window.addEventListener('resize', requestProgressUpdate);

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', requestProgressUpdate);
      window.removeEventListener('resize', requestProgressUpdate);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 top-0 z-[70] h-px bg-white/5 ${className}`.trim()}
    >
      <div
        ref={barRef}
        className="h-full origin-left scale-x-0 bg-[#D4AF37]/75 opacity-0 shadow-[0_0_10px_rgba(212,175,55,0.22)] motion-safe:transition-opacity motion-safe:duration-200 motion-safe:ease-out"
      />
    </div>
  );
}
