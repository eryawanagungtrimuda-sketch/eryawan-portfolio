import type { Metadata } from 'next';

import Link from 'next/link';
import BackButton from '@/components/back-button';
import KaryaArchive from '@/components/karya-archive';
import { getPublishedProjects } from '@/lib/projects';

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://eryawanagung.com';

export const metadata: Metadata = {
  title: 'Portfolio Karya | Eryawan Agung Design Portfolio',
  description: 'Explore the detailed design analysis and strategy behind every portfolio project by Eryawan Agung.',
  alternates: { canonical: `${SITE_URL}/karya` },
  openGraph: {
    title: 'Portfolio Karya | Eryawan Agung Design Portfolio',
    description: 'Explore the detailed design analysis and strategy behind every portfolio project by Eryawan Agung.',
    url: `${SITE_URL}/karya`,
  },
};

export default async function KaryaPage() {
  const projects = await getPublishedProjects();

  return (
    <main className="min-h-screen bg-[#080807] px-4 py-8 font-sans text-[#F4F1EA] sm:px-5 md:px-8 lg:px-12 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="font-mono text-[11px] font-black uppercase tracking-[0.22em] text-[#D4AF37] transition hover:text-[#E2C866]">
            Eryawan Studio
          </Link>
          <BackButton label="Kembali ke Beranda" fallbackHref="/" />
        </div>

        <section className="py-20 motion-safe:animate-[fade-in-up_800ms_ease-out_forwards] md:py-28 lg:py-32">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#D4AF37] md:text-[11px]">Beranda / Karya</p>
          <h1 className="font-display mt-7 max-w-4xl text-[2.05rem] font-normal leading-[1.04] tracking-[-0.035em] sm:text-[2.4rem] md:text-7xl">
            Karya Berbasis Keputusan
          </h1>
          <p className="mt-9 max-w-2xl font-sans text-base leading-[1.8] text-white/62 md:text-xl md:leading-[1.75]">
            Setiap project dibaca sebagai studi kasus: dimulai dari konteks masalah, keputusan desain yang diambil, hingga impact yang dihasilkan.
          </p>
        </section>

        <KaryaArchive projects={projects} />
      </div>
    </main>
  );
}
