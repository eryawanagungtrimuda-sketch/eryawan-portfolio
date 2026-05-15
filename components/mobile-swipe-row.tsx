'use client';

import { Children, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

type MobileSwipeRowProps = {
  children: ReactNode;
  ariaLabel: string;
  desktopGridClassName: string;
  className?: string;
  cardClassName?: string;
  mobileCardClassName?: string;
  backgroundTone?: string;
  showHint?: boolean;
};

export default function MobileSwipeRow({
  children,
  ariaLabel,
  desktopGridClassName,
  className = '',
  cardClassName = '',
  mobileCardClassName = '',
  backgroundTone = '#090909',
  showHint = true,
}: MobileSwipeRowProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const frameRef = useRef<number | null>(null);
  const items = useMemo(() => Children.toArray(children), [children]);
  const [activeCardIndex, setActiveCardIndex] = useState(0);

  const updateActiveCard = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const cards = cardRefs.current.filter((card): card is HTMLDivElement => card !== null);
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

  const scheduleActiveUpdate = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(updateActiveCard);
  }, [updateActiveCard]);

  const scrollToCard = useCallback((index: number) => {
    const scroller = scrollRef.current;
    const card = cardRefs.current[index];
    if (!scroller || !card) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const targetLeft = card.offsetLeft - scroller.offsetLeft;

    scroller.scrollTo({
      left: targetLeft,
      behavior: reducedMotion ? 'auto' : 'smooth',
    });

    setActiveCardIndex(index);
  }, []);

  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, items.length);
    updateActiveCard();
  }, [items.length, updateActiveCard]);

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const renderedCards = cardRefs.current.filter((card) => card !== null).length;
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
    <div className={`overflow-hidden ${className}`}>
      {showHint ? (
        <p className="mb-3 text-[10px] font-mono font-semibold uppercase tracking-[0.18em] text-[#D4AF37]/65 lg:hidden">
          Geser untuk melihat
        </p>
      ) : null}

      <div className="relative">
        <div
          ref={scrollRef}
          className={`no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth scroll-px-5 px-5 pb-6 pt-1 overscroll-x-contain touch-pan-x lg:grid lg:overflow-visible lg:px-0 lg:pb-0 lg:pt-0 lg:snap-none ${desktopGridClassName}`}
          aria-label={ariaLabel}
          onScroll={scheduleActiveUpdate}
          onTouchEnd={() => {
            window.setTimeout(scheduleActiveUpdate, 120);
          }}
          onPointerUp={() => {
            window.setTimeout(scheduleActiveUpdate, 120);
          }}
        >
          {items.map((child, index) => (
            <div
              key={index}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              data-swipe-card="true"
              className={`basis-[82%] flex-none snap-start sm:basis-[76%] md:basis-[48%] lg:basis-auto lg:flex-auto lg:snap-none ${mobileCardClassName} ${cardClassName}`}
            >
              {child}
            </div>
          ))}
        </div>
        <span
          className="pointer-events-none absolute right-0 top-0 bottom-6 w-10 bg-gradient-to-l to-transparent lg:hidden"
          style={{ backgroundImage: `linear-gradient(to left, ${backgroundTone}, transparent)` }}
          aria-hidden="true"
        />
      </div>

      <div className="mt-3 flex justify-center gap-1.5 lg:hidden">
        {items.map((_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Lihat kartu ${index + 1}`}
            onClick={() => scrollToCard(index)}
            className={`h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none ${index === activeCardIndex ? 'w-5 bg-[#D4AF37]' : 'w-1.5 bg-white/25'}`}
          />
        ))}
      </div>
    </div>
  );
}
