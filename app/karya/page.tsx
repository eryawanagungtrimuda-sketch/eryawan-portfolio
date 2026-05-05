import Link from 'next/link';
import BackButton from '@/components/back-button';
import KaryaArchive from '@/components/karya-archive';
import { getPublishedProjects } from '@/lib/projects';

export default async function KaryaPage() {
  const projects = await getPublishedProjects();

  return (
    <main className="min-h-screen bg-[#080807] px-5 py-8 font-sans text-[#F4F1EA] md:px-10 lg:px-16 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="font-mono text-[11px] font-black uppercase tracking-[0.22em] text-[#D4AF37] transition hover:text-[#E2C866]">
            Eryawan Studio
          </Link>
          <BackButton label="Kembali ke Beranda" fallbackHref="/" />
        </div>

        <section className="py-20 md:py-28 lg:py-32">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#D4AF37] md:text-[11px]">Beranda / Karya</p>
          <h1 className="font-display mt-7 max-w-4xl text-5xl font-normal leading-[1.02] tracking-[-0.04em] md:text-7xl">
            Karya Berbasis Keputusan
          </h1>
          <p className="mt-9 max-w-2xl text-base leading-[1.8] text-white/68 md:text-xl md:leading-[1.75]">
            Setiap project dibaca sebagai studi kasus: dimulai dari konteks masalah, keputusan desain yang diambil, hingga impact yang dihasilkan.
          </p>
        </section>

        <KaryaArchive projects={projects} />
      </div>
    </main>
  );
}
