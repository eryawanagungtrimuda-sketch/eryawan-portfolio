import Link from 'next/link';
import { MoveRight } from 'lucide-react';
import { getPublishedProjects } from '@/lib/projects';

export default async function KaryaPage() {
  const projects = await getPublishedProjects();

  return (
    <main className="min-h-screen bg-[#080807] px-5 py-8 font-sans text-[#F4F1EA] md:px-10 lg:px-16 lg:py-12">
      <div className="mx-auto max-w-7xl">
        <Link href="/" className="font-mono text-[11px] font-black uppercase tracking-[0.22em] text-[#D4AF37] transition hover:text-[#E2C866]">
          Eryawan Studio
        </Link>

        <section className="py-20 md:py-28">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#D4AF37] md:text-[11px]">Karya</p>
          <h1 className="font-display mt-6 max-w-5xl text-5xl font-normal leading-[1.05] tracking-[-0.04em] md:text-7xl">
            Portfolio Berbasis Keputusan
          </h1>
          <p className="mt-8 max-w-3xl text-lg leading-[1.7] text-white/70 md:text-xl">
            Setiap proyek dibaca sebagai studi kasus: masalah yang ditemukan, keputusan yang diambil, dan dampak yang dibangun untuk klien maupun pengguna ruang.
          </p>
        </section>

        <section className="grid gap-8 pb-24 lg:grid-cols-2">
          {projects.map((project, index) => (
            <Link
              key={project.id}
              href={`/karya/${project.slug}`}
              className="group relative overflow-hidden rounded-sm border border-white/12 bg-gradient-to-br from-white/[0.035] to-white/[0.012] p-8 transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/35 md:p-10"
            >
              {project.cover_image ? (
                <div className="mb-8 aspect-[16/10] overflow-hidden rounded-sm border border-white/10">
                  <img src={project.cover_image} alt={project.title} className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100" />
                </div>
              ) : null}

              <p className="font-mono text-[10px] font-black uppercase tracking-[0.42em] text-[#D4AF37] md:text-[11px]">
                Project {String(index + 1).padStart(2, '0')}
              </p>
              <h2 className="font-display mt-5 max-w-2xl text-4xl font-normal leading-[1.02] tracking-[-0.03em] text-white/92 md:text-5xl">
                {project.title}
              </h2>
              <div className="mt-10 space-y-6 border-t border-white/10 pt-8">
                <div>
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.26em] text-white/45">Problem</p>
                  <p className="mt-3 text-base leading-[1.65] text-white/70 md:text-lg">{project.problem || 'Masalah ruang belum didefinisikan.'}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.26em] text-white/45">Impact</p>
                  <p className="mt-3 text-base leading-[1.65] text-white/70 md:text-lg">{project.impact || 'Ruang menjadi lebih terarah, efisien, dan mudah digunakan.'}</p>
                </div>
              </div>
              <span className="mt-10 inline-flex items-center gap-3 font-mono text-xs font-black uppercase tracking-[0.18em] text-[#D4AF37]">
                Lihat Studi Kasus <MoveRight size={18} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </section>
      </div>
    </main>
  );
}
