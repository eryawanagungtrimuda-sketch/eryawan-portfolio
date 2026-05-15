'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

type ImpactItem = {
  title: string;
  description: string;
  direction: string;
};

type ImpactMetricsCarouselProps = {
  impacts: ImpactItem[];
};

export default function ImpactMetricsCarousel({ impacts }: ImpactMetricsCarouselProps) {
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const [activeCardIndex, setActiveCardIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const updateActiveCard = useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    const cards = Array.from(scroller.querySelectorAll<HTMLElement>('[data-impact-card="true"]'));
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

  const handleScroll = useCallback(() => {
    if (showSwipeHint) setShowSwipeHint(false);
    updateActiveCard();
  }, [showSwipeHint, updateActiveCard]);

  const hintClassName = useMemo(
    () =>
      `pointer-events-none absolute inset-y-0 left-0 right-0 z-20 flex items-center justify-between px-2 transition-opacity duration-300 ${
        showSwipeHint ? 'opacity-100' : 'opacity-0'
      } sm:hidden`,
    [showSwipeHint],
  );

  return (
    <>
      <div className="relative">
        <div className={hintClassName} aria-hidden="true">
          <span className="inline-flex h-7 w-7 animate-pulse items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#142030]/80 text-[#D4AF37] shadow-[0_0_14px_rgba(212,175,55,0.18)]">
            <ArrowLeft size={14} strokeWidth={2.1} />
          </span>
          <span className="inline-flex h-7 w-7 animate-pulse items-center justify-center rounded-full border border-[#D4AF37]/40 bg-[#142030]/80 text-[#D4AF37] shadow-[0_0_14px_rgba(212,175,55,0.18)]">
            <ArrowRight size={14} strokeWidth={2.1} />
          </span>
        </div>

        <div
          ref={scrollRef}
          className="impact-scroll relative -mx-1 flex snap-x snap-mandatory gap-4 overflow-x-auto px-1 pb-6 pt-1 sm:mx-0 sm:grid sm:snap-none sm:overflow-visible sm:px-0 sm:pb-0 sm:pt-0 sm:grid-cols-2 sm:gap-5 lg:gap-4"
          aria-label="Metrik dampak dapat digeser horizontal"
          onScroll={handleScroll}
        >
          {impacts.map((impact, index) => (
            <article
              key={impact.title}
              data-impact-card="true"
              tabIndex={0}
              className={`group relative min-w-[80%] snap-start overflow-hidden rounded-[30px] border border-white/5 bg-white/[0.02] px-5 py-5 transition-all duration-300 ease-out motion-safe:transform-gpu active:scale-[0.99] motion-safe:hover:-translate-y-1.5 hover:border-[#C8A951]/22 hover:bg-white/[0.045] hover:shadow-[0_16px_34px_rgba(200,169,81,0.09)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/65 sm:min-w-0 sm:px-6 ${
                activeCardIndex === index ? 'scale-[1.01] border-[#C8A951]/30 shadow-[0_16px_34px_rgba(200,169,81,0.15)]' : ''
              }`}
            >
              <span className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#C8A951]/65 to-transparent" />
              <div className="flex items-start justify-between gap-4">
                <span className="inline-flex rounded-full border border-[#C8A951]/35 bg-[#C8A951]/10 px-3 py-1 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]">
                  0{index + 1}
                </span>
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-white/[0.03] text-[#D4AF37] transition-all duration-300 ease-out group-hover:border-[#C8A951]/35 group-hover:bg-[#C8A951]/12 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:scale-105">
                  {impact.direction === 'up' ? <ArrowUp size={15} strokeWidth={2.1} /> : <ArrowDown size={15} strokeWidth={2.1} />}
                </span>
              </div>
              <h3 className="mt-4 font-sans text-[1.05rem] font-semibold leading-snug tracking-[-0.01em] text-white/90 sm:text-[1.15rem]">
                {impact.title}
              </h3>
              <p className="mt-3 max-w-md font-sans text-sm leading-6 text-white/60 sm:text-[0.95rem]">
                {impact.description}
              </p>
              <span className="mt-5 block h-1.5 w-16 rounded-full bg-gradient-to-r from-[#C8A951]/70 to-[#C8A951]/15 transition-all duration-300 group-hover:w-24" />
            </article>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 text-[10px] font-mono font-semibold uppercase tracking-[0.2em] text-[#D4AF37]/70 sm:hidden">
        <span className="inline-flex h-1.5 w-1.5 animate-pulse rounded-full bg-[#D4AF37]" />
        Geser metrik ke samping
      </div>
    </>
  );
}
