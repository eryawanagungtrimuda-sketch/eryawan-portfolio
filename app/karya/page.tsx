import type { Metadata } from 'next';

import BackButton from '@/components/back-button';
import KaryaArchive from '@/components/karya-archive';
import RevealObserver from '@/components/reveal-observer';
import { getPublishedProjects } from '@/lib/projects';
import { absoluteUrl } from '@/lib/site-url';
import PublicJourneyLinks from '@/components/public-journey-links';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Portfolio Karya | Eryawan Agung Design Portfolio',
  description: 'Explore the detailed design analysis and strategy behind every portfolio project by Eryawan Agung.',
  alternates: { canonical: absoluteUrl('/karya') },
  openGraph: {
    title: 'Portfolio Karya | Eryawan Agung Design Portfolio',
    description: 'Explore the detailed design analysis and strategy behind every portfolio project by Eryawan Agung.',
    url: absoluteUrl('/karya'),
    images: [{ url: absoluteUrl('/opengraph-image'), width: 1200, height: 630, alt: 'Portfolio Karya Eryawan Agung' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portfolio Karya | Eryawan Agung Design Portfolio',
    description: 'Explore the detailed design analysis and strategy behind every portfolio project by Eryawan Agung.',
    images: [absoluteUrl('/opengraph-image')],
  },
};

export default async function KaryaPage() {
  const projects = await getPublishedProjects();

  return (
    <main id="main-content" className="min-h-screen overflow-x-clip bg-[#080807] px-4 py-8 font-sans text-[#F4F1EA] sm:px-5 md:px-8 lg:px-12 lg:py-12">
      <RevealObserver />
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex justify-start md:mb-12">
          <BackButton fallbackHref="/" />
        </div>

        <section className="reveal-on-scroll pb-10 md:py-24 lg:py-28">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#D4AF37] md:text-[11px]">Beranda / Karya</p>
          <h1 className="font-display mt-7 max-w-4xl text-[2.05rem] font-normal leading-[1.04] tracking-[-0.035em] sm:text-[2.4rem] md:text-7xl">
            Karya Berbasis Keputusan
          </h1>
          <p className="mt-9 max-w-2xl font-sans text-base leading-[1.8] text-white/62 md:text-xl md:leading-[1.75]">
            Setiap proyek dibaca sebagai studi kasus: dimulai dari konteks masalah, keputusan desain yang diambil, hingga dampak yang dihasilkan.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/wawasan" className="inline-flex min-h-11 items-center rounded-full border border-[#D4AF37]/45 bg-[#D4AF37]/10 px-5 py-2.5 font-sans text-sm font-semibold text-[#D4AF37] transition hover:bg-[#D4AF37]/20">Baca Wawasan</Link>
            <Link href="/mulai-project" className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-5 py-2.5 font-sans text-sm font-semibold text-white/78 transition hover:border-[#D4AF37]/45 hover:text-[#D4AF37]">Ajukan Kolaborasi</Link>
          </div>
        </section>

        <KaryaArchive projects={projects} />

        <div className="pb-28 pt-12 md:pb-16">
          <PublicJourneyLinks
            links={[
              { href: '/karya', title: 'Lihat Karya', description: 'Jelajahi studi kasus proyek berbasis keputusan desain.', current: true, disabled: true, badge: 'Sedang dibuka' },
              { href: '/wawasan', title: 'Baca Wawasan', description: 'Pelajari insight strategi ruang dan logika desain.' },
              { href: '/mulai-project', title: 'Mulai Percakapan Proyek', description: 'Ajukan brief awal agar diskusi proyek lebih terarah.' },
            ]}
          />
          <Link href="/" className="mt-4 inline-flex font-sans text-sm text-white/62 transition hover:text-[#D4AF37]">← Kembali ke Beranda</Link>
        </div>
      </div>
    </main>
  );
}
