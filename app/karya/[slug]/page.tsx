import Link from 'next/link';
import { notFound } from 'next/navigation';
import BackButton from '@/components/back-button';
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

  const galleryImages = [...(project.project_images || [])].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <main className="min-h-screen bg-[#080807] px-5 py-8 font-sans text-[#F4F1EA] md:px-10 lg:px-16 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="font-mono text-[11px] font-black uppercase tracking-[0.22em] text-[#D4AF37] transition hover:text-[#E2C866]">
            Eryawan Studio
          </Link>
          <BackButton label="Kembali ke Semua Karya" fallbackHref="/karya" />
        </div>

        <section className="py-20 md:py-28">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.32em] text-[#D4AF37] md:text-[11px]">
            Beranda / Karya / {project.title}
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
              Cover image menjadi pembuka visual project: memberikan konteks atmosfer, proporsi, dan arah keputusan desain.
            </p>
          </section>
        ) : null}

        <section className="grid gap-8 pb-20 lg:grid-cols-1">
          <TextBlock label="Core Problem" body={project.problem} index={1} />
          <TextBlock label="Solution" body={project.solution} index={2} />
          <TextBlock label="Impact" body={project.impact} index={3} />
        </section>

        {galleryImages.length > 0 ? (
          <section className="border-t border-white/10 py-20">
            <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#D4AF37]">Project Gallery</p>
                <h2 className="font-display mt-5 text-4xl font-normal leading-[1.08] tracking-[-0.035em] md:text-5xl">
                  Visual Documentation
                </h2>
              </div>
              <p className="max-w-md text-sm leading-7 text-white/48 md:text-right">
                Gallery mendukung narasi project melalui detail material, komposisi ruang, dan pengalaman pengguna.
              </p>
            </div>

            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {galleryImages.map((image, index) => (
                <figure key={image.id} className={index === 0 ? 'md:col-span-2' : ''}>
                  <div className="overflow-hidden rounded-sm border border-white/10 bg-white/[0.02]">
                    <img
                      src={image.image_url}
                      alt={image.alt_text || `${project.title} gallery ${index + 1}`}
                      className={index === 0 ? 'aspect-[16/9] w-full object-cover' : 'aspect-[4/3] w-full object-cover'}
                    />
                  </div>
                  {image.alt_text ? <figcaption className="mt-3 text-sm leading-6 text-white/46">{image.alt_text}</figcaption> : null}
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
