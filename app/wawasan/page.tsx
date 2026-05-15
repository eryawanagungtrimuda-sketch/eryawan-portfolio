import type { Metadata } from 'next';
import Link from 'next/link';
import ContextualBackButton from '@/components/contextual-back-button';
import RevealObserver from '@/components/reveal-observer';
import { getPublishedInsights } from '@/lib/insights';
import WawasanArchive from '@/components/wawasan-archive';

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

export default async function WawasanPage() {
  const insights = await getPublishedInsights();

  return (
    <main className="min-h-screen overflow-x-clip bg-[#080807] px-4 py-12 text-[#F4F1EA] sm:px-5 sm:py-14 md:px-8 md:py-16 lg:px-12">
      <RevealObserver />
      <section className="reveal-on-scroll mx-auto max-w-7xl rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-transparent p-6 sm:p-8 md:p-12">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#C8A951]">Insight Hub</p>
        <h1 className="font-sans mt-3 text-[2rem] font-normal leading-[1.02] tracking-[-0.02em] sm:mt-4 sm:text-[2.35rem] md:text-6xl">Wawasan Desain</h1>
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
        <WawasanArchive insights={insights} />
      )}
    </main>
  );
}
