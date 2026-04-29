import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MoveLeft } from 'lucide-react';
import { getPublishedProjectBySlug } from '@/lib/projects';

type Props = {
  params: { slug: string };
};

function TextBlock({ label, body, index }: { label: string; body?: string | null; index: number }) {
  if (!body) return null;

  return (
    <article className="border-l border-white/10 pl-6 lg:grid lg:grid-cols-[0.8fr_2fr] lg:gap-12 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-8">
      <div>
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white/35">0{index}</p>
        <h2 className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-[#D4AF37]">{label}</h2>
      </div>
      <p className="mt-4 max-w-3xl whitespace-pre-line text-lg leading-[1.75] text-white/72 lg:mt-0">
        {body}
      </p>
    </article>
  );
}

export default async function KaryaDetailPage({ params }: Props) {
  const project = await getPublishedProjectBySlug(params.slug);
  if (!project) notFound();

  return (
    <main className="min-h-screen bg-[#080807] px-5 py-8 font-sans text-[#F4F1EA] md:px-10 lg:px-16 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/karya" className="inline-flex items-center gap-3 font-mono text-[11px] font-black uppercase tracking-[0.22em] text-[#D4AF37] transition hover:text-[#E2C866]">
          <MoveLeft size={16} />
          Kembali ke Karya
        </Link>

        <section className="py-20 md:py-28">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#D4AF37] md:text-[11px]">
            {project.category || 'Case Study'}
          </p>
          <h1 className="font-display mt-6 max-w-5xl text-5xl font-normal leading-[1.05] tracking-[-0.04em] md:text-7xl">
            {project.title}
          </h1>
          <p className="mt-8 max-w-4xl text-xl leading-[1.65] text-white/76 md:text-2xl">
            {project.problem || 'Studi kasus keputusan desain berbasis masalah, solusi, dan dampak ruang.'}
          </p>
        </section>

        {project.cover_image ? (
          <section className="pb-20">
            <div className="aspect-[16/9] overflow-hidden rounded-sm border border-white/10 bg-white/[0.02]">
              <img src={project.cover_image} alt={project.title} className="h-full w-full object-cover" />
            </div>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-white/48">
              Visual menjadi pendukung pembacaan keputusan desain: fungsi, solusi, dan pengalaman ruang.
            </p>
          </section>
        ) : null}

        <section className="grid gap-8 pb-20 lg:grid-cols-1">
          <TextBlock label="Core Problem" body={project.problem} index={1} />
          <TextBlock label="Solution" body={project.solution} index={2} />
          <TextBlock label="Impact" body={project.impact} index={3} />
        </section>

        <section className="border-t border-white/10 py-16">
          <p className="font-display max-w-4xl text-3xl italic leading-[1.28] tracking-[-0.03em] text-white/86 md:text-5xl">
            Desain adalah alat untuk membuat keputusan ruang yang lebih jelas, terarah, dan bernilai jangka panjang.
          </p>
        </section>
      </div>
    </main>
  );
}
