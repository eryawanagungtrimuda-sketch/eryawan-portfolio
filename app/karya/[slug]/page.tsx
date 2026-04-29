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

  const images = project.project_images?.sort((a, b) => a.sort_order - b.sort_order) || [];

  return (
    <main className="min-h-screen bg-[#080807] px-5 py-8 font-sans text-[#F4F1EA] md:px-10 lg:px-16 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/karya" className="inline-flex items-center gap-3 font-mono text-[11px] font-black uppercase tracking-[0.22em] text-[#D4AF37] transition hover:text-[#E2C866]">
          <MoveLeft size={16} />
          Kembali ke Karya
        </Link>

        <section className="py-20 md:py-28">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#D4AF37] md:text-[11px]">
            {project.category || 'Case Study'} {project.year ? `— ${project.year}` : ''}
          </p>
          <h1 className="font-display mt-6 max-w-5xl text-5xl font-normal leading-[1.05] tracking-[-0.04em] md:text-7xl">
            {project.title}
          </h1>
          <p className="mt-8 max-w-4xl text-xl leading-[1.65] text-white/76 md:text-2xl">
            {project.short_description || project.problem || 'Studi kasus keputusan desain berbasis konteks, masalah, dan dampak ruang.'}
          </p>

          <div className="mt-10 grid gap-4 border-y border-white/10 py-6 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/42 md:grid-cols-4">
            <span>{project.location || 'Location —'}</span>
            <span>{project.area_size || 'Area —'}</span>
            <span>{project.design_style || 'Style —'}</span>
            <span>{project.client_name || 'Client — Private'}</span>
          </div>
        </section>

        {project.cover_image_url ? (
          <section className="pb-20">
            <div className="aspect-[16/9] overflow-hidden rounded-sm border border-white/10 bg-white/[0.02]">
              <img src={project.cover_image_url} alt={project.title} className="h-full w-full object-cover" />
            </div>
            <p className="mt-5 max-w-3xl text-sm leading-7 text-white/48">
              Visual menjadi pendukung pembacaan keputusan desain: layout, sirkulasi, material, dan pengalaman ruang.
            </p>
          </section>
        ) : null}

        <section className="grid gap-8 pb-20 lg:grid-cols-1">
          <TextBlock label="Context" body={project.context} index={1} />
          <TextBlock label="Core Problem" body={project.problem} index={2} />
          <TextBlock label="Strategic Decision" body={project.strategic_decision} index={3} />
          <TextBlock label="Design Execution" body={project.execution} index={4} />
          <TextBlock label="Impact" body={project.impact} index={5} />
        </section>

        {images.length > 0 ? (
          <section className="border-t border-white/10 py-20">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#D4AF37]">Gallery</p>
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {images.map((image) => (
                <figure key={image.id} className="overflow-hidden rounded-sm border border-white/10 bg-white/[0.02]">
                  <img src={image.image_url} alt={image.alt_text || project.title} className="aspect-[4/3] w-full object-cover" />
                  {image.alt_text ? <figcaption className="p-4 text-sm leading-6 text-white/52">{image.alt_text}</figcaption> : null}
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        <section className="border-t border-white/10 py-16">
          <p className="font-display max-w-4xl text-3xl italic leading-[1.28] tracking-[-0.03em] text-white/86 md:text-5xl">
            Desain adalah alat untuk membuat keputusan ruang yang lebih jelas, terarah, dan bernilai jangka panjang.
          </p>
        </section>
      </div>
    </main>
  );
}
