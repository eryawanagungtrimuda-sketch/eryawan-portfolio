import type { Metadata } from 'next';
import Link from 'next/link';
import ContextualBackButton from '@/components/contextual-back-button';
import MobileSwipeRow from '@/components/mobile-swipe-row';
import RevealObserver from '@/components/reveal-observer';
import { getPublishedInsights } from '@/lib/insights';

export const dynamic = 'force-dynamic';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://eryawanagung.com';

export const metadata: Metadata = {
  title: 'Wawasan Desain | Eryawan Agung Design Portfolio',
  description: 'Explore the detailed design analysis and strategy behind each insight and design review by Eryawan Agung.',
  alternates: { canonical: `${SITE_URL}/wawasan` },
  openGraph: {
    title: 'Wawasan Desain | Eryawan Agung Design Portfolio',
    description: 'Explore the detailed design analysis and strategy behind each insight and design review by Eryawan Agung.',
    url: `${SITE_URL}/wawasan`,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wawasan Desain | Eryawan Agung Design Portfolio',
    description: 'Explore the detailed design analysis and strategy behind each insight and design review by Eryawan Agung.',
  },
};

function formatSourceType(sourceType?: string | null) {
  if (!sourceType) return null;
  if (sourceType === 'project') return 'Dari Project';
  return sourceType.replace(/_/g, ' ');
}

export default async function WawasanPage() {
  const insights = await getPublishedInsights();

  return (
    <main className="min-h-screen overflow-x-clip bg-[#080807] px-4 py-12 text-[#F4F1EA] sm:px-5 sm:py-14 md:px-8 md:py-16 lg:px-12">
      <RevealObserver />
      <section className="reveal-on-scroll mx-auto max-w-7xl rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-6 sm:p-8 md:p-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#C8A951]">Insight Hub</p>
        <h1 className="font-display mt-3 text-[2rem] font-normal leading-[1.02] tracking-[-0.02em] sm:mt-4 sm:text-[2.35rem] md:text-6xl">Wawasan Desain</h1>
        <p className="mt-4 max-w-3xl font-sans text-sm leading-7 text-white/64 sm:text-base sm:leading-relaxed md:mt-5 md:text-lg">
          Catatan strategi, pembacaan ruang, dan pelajaran desain untuk membantu melihat keputusan ruang secara lebih jernih.
        </p>
        <div className="mt-6 flex flex-wrap gap-3 md:mt-8">
          <Link href="/karya" className="inline-flex min-h-11 items-center rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-5 py-2.5 font-mono text-sm font-semibold uppercase tracking-[0.12em] text-[#D4AF37] transition motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:bg-[#D4AF37]/20">
            Lihat Karya
          </Link>
          <ContextualBackButton fallbackHref="/" className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-5 py-2.5 font-sans text-sm text-white/66 transition hover:border-white/30 hover:text-white" />
        </div>
      </section>

      {insights.length === 0 ? (
        <section className="mx-auto mt-10 max-w-6xl">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-8 text-center">
            <p className="font-sans text-lg text-white/66">Belum ada wawasan dipublikasikan.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link className="rounded-2xl border border-[#D4AF37]/40 px-4 py-2 text-sm text-[#D4AF37] hover:bg-[#D4AF37]/10" href="/mulai-project">Diskusikan Project</Link>
              <Link className="rounded-2xl border border-white/15 px-4 py-2 font-sans text-sm text-white/66 hover:border-white/30 hover:text-white" href="/karya">Lihat Karya</Link>
            </div>
          </div>
        </section>
      ) : (
        <MobileSwipeRow className="reveal-on-scroll mx-auto mt-8 max-w-7xl sm:mt-10" ariaLabel="Daftar wawasan" desktopGridClassName="md:grid-cols-2 xl:grid-cols-3 md:gap-5" backgroundTone="#080807">
          {insights.map((item) => (
            <article key={item.id} className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02] transition motion-safe:duration-300 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:border-[#C8A951]/25 hover:bg-white/[0.035] hover:shadow-[0_20px_45px_rgba(0,0,0,0.3)]">
              {item.cover_image ? (
                <div className="aspect-[16/9] max-h-48 overflow-hidden border-b border-white/8 sm:aspect-[16/10] sm:max-h-none">
                  <img src={item.cover_image} alt={item.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                </div>
              ) : null}

              <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-[#C8A951]/30 bg-[#C8A951]/10 px-3 py-1 font-sans text-[11px] font-semibold text-[#D4AF37]">
                    {item.category || 'Uncategorized'}
                  </span>
                  {item.content_type === 'review_karya' ? <span className="rounded-full border border-white/8 px-3 py-1 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">Review Karya</span> : null}
                  {formatSourceType(item.source_type) ? (
                    <span className="rounded-full border border-white/8 px-3 py-1 font-sans text-[11px] font-semibold text-white/62">
                      {formatSourceType(item.source_type)}
                    </span>
                  ) : null}
                </div>

                <h2 className="font-display mt-3 text-[1.65rem] font-normal leading-[1.14] tracking-[-0.01em] sm:mt-4 sm:text-2xl">{item.title}</h2>
                <p className="mt-3 line-clamp-4 font-sans text-sm leading-7 text-white/62 sm:line-clamp-3 sm:leading-relaxed">{item.excerpt || 'Wawasan ini mengulas strategi desain dan pertimbangan ruang dari sudut pandang editorial.'}</p>

                <Link className="mt-5 inline-flex min-h-11 w-fit items-center gap-2 font-mono text-sm font-semibold uppercase tracking-[0.12em] text-[#D4AF37] transition motion-safe:duration-500 motion-safe:ease-out group-hover:text-[#e6c461] sm:mt-6" href={`/wawasan/${item.slug}`}>
                  Baca Wawasan <span aria-hidden className="transition motion-safe:duration-500 motion-safe:group-hover:translate-x-1">→</span>
                </Link>
              </div>
            </article>
          ))}
        </MobileSwipeRow>
      )}
    </main>
  );
}
