import { ArrowDown, ArrowUp } from 'lucide-react';
import MobileSwipeRow from '@/components/mobile-swipe-row';

type ImpactItem = {
  title: string;
  description: string;
  direction: string;
};

type ImpactMetricsCarouselProps = {
  impacts: ImpactItem[];
};

export default function ImpactMetricsCarousel({ impacts }: ImpactMetricsCarouselProps) {
  return (
    <MobileSwipeRow ariaLabel="Metrik dampak dapat digeser horizontal" desktopGridClassName="md:grid-cols-2 md:gap-5 lg:gap-4" backgroundTone="#142030">
      {impacts.map((impact, index) => (
        <article
          key={impact.title}
          tabIndex={0}
          className="group relative overflow-hidden rounded-[30px] border border-white/5 bg-white/[0.02] px-5 py-5 transition-all duration-300 ease-out motion-safe:transform-gpu motion-safe:active:scale-[0.985] hover:border-[#C8A951]/22 hover:bg-white/[0.045] hover:shadow-[0_16px_34px_rgba(200,169,81,0.09)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/65 md:px-6"
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
          <h3 className="mt-4 font-sans text-[1.05rem] font-semibold leading-snug tracking-[-0.01em] text-white/90 md:text-[1.15rem]">
            {impact.title}
          </h3>
          <p className="mt-3 max-w-md font-sans text-sm leading-6 text-white/60 md:text-[0.95rem]">{impact.description}</p>
          <span className="mt-5 block h-1.5 w-16 rounded-full bg-gradient-to-r from-[#C8A951]/70 to-[#C8A951]/15 transition-all duration-300 group-hover:w-24" />
        </article>
      ))}
    </MobileSwipeRow>
  );
}
