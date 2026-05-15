'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';

type MobileSwipeRowProps = {
  children: ReactNode[];
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
  }, [children.length, updateActiveCard]);

  return (
    <div className={className}>
      {showHint ? (
        <p className="mb-3 text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-[#D4AF37]/65 md:hidden">
          Geser untuk melihat
        </p>
      ) : null}

      <div className="relative">
        <div
          ref={scrollRef}
          className={`no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-5 pb-6 pt-1 overscroll-x-contain touch-pan-x md:mx-0 md:grid md:overflow-visible md:px-0 md:pb-0 md:pt-0 md:snap-none ${desktopGridClassName}`}
          aria-label={ariaLabel}
          onScroll={updateActiveCard}
        >
          {children.map((child, index) => (
            <div
              key={index}
              data-swipe-card="true"
              className={`min-w-[82vw] max-w-[360px] shrink-0 snap-start md:min-w-0 md:max-w-none md:shrink ${cardClassName}`}
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

      <div className="mt-3 flex justify-center gap-1.5 md:hidden" aria-hidden="true">
        {children.map((_, index) => (
          <span
            key={index}
            className={`h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none ${index === activeCardIndex ? 'w-5 bg-[#D4AF37]' : 'w-1.5 bg-white/25'}`}
          />
        ))}
      </div>
    </div>
  );
}
