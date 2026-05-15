'use client';

import { Children, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

type MobileSwipeRowProps = {
  children: ReactNode;
  ariaLabel: string;
  desktopGridClassName: string;
  className?: string;
  cardClassName?: string;
  backgroundTone?: string;
  showHint?: boolean;
};

export default function MobileSwipeRow({
  children,
  ariaLabel,
  desktopGridClassName,
  className = '',
  cardClassName = '',
  backgroundTone = '#090909',
  showHint = true,
}: MobileSwipeRowProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const items = useMemo(() => Children.toArray(children), [children]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const updateActiveCard = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const cards = Array.from(scroller.querySelectorAll<HTMLElement>('[data-swipe-card="true"]'));
    if (cards.length === 0) return;

    const viewportCenter = scroller.scrollLeft + scroller.clientWidth / 2;
    let closest = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    cards.forEach((card, index) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const distance = Math.abs(viewportCenter - cardCenter);
      if (distance < closestDistance) {
        closestDistance = distance;
        closest = index;
      }
    });

    setActiveCardIndex(closest);
  }, []);

  useEffect(() => {
    updateActiveCard();
  }, [items.length, updateActiveCard]);

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      const scroller = scrollRef.current;
      if (!scroller) return;

      const renderedCards = scroller.querySelectorAll('[data-swipe-card="true"]').length;
      if (renderedCards !== items.length) {
        console.warn(`MobileSwipeRow expected ${items.length} cards but rendered ${renderedCards}.`);
      }
    }
  }, [items.length]);

  useEffect(() => {
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div className={className}>
      {showHint ? (
        <p className="mb-3 text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-[#D4AF37]/65 lg:hidden">
          Geser untuk melihat
        </p>
      ) : null}

      <div className="relative">
        <div
          ref={scrollRef}
          className={`no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth scroll-px-5 px-5 pb-6 pt-1 overscroll-x-contain touch-pan-x lg:mx-0 lg:grid lg:overflow-visible lg:px-0 lg:pb-0 lg:pt-0 lg:snap-none ${desktopGridClassName}`}
          aria-label={ariaLabel}
          onScroll={() => {
            if (frameRef.current) cancelAnimationFrame(frameRef.current);
            frameRef.current = requestAnimationFrame(updateActiveCard);
          }}
        >
          {items.map((child, index) => (
            <div
              key={index}
              data-swipe-card="true"
              className={`w-[82vw] max-w-[360px] flex-none snap-start sm:w-[72vw] md:w-[46vw] lg:w-auto lg:max-w-none lg:flex-auto lg:snap-none ${cardClassName}`}
            >
              {child}
            </div>
          ))}
        </div>
        <span
          className="pointer-events-none absolute right-0 top-0 bottom-6 w-10 bg-gradient-to-l to-transparent md:hidden"
          style={{ backgroundImage: `linear-gradient(to left, ${backgroundTone}, transparent)` }}
          aria-hidden="true"
        />
      </div>

      <div className="mt-3 flex justify-center gap-1.5 lg:hidden" aria-hidden="true">
        {items.map((_, index) => (
          <span
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none ${index === activeCardIndex ? 'w-5 bg-[#D4AF37]' : 'w-1.5 bg-white/25'}`}
          />
        ))}
      </div>
    </div>
  );
}
