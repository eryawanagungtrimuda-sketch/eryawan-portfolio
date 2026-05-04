import Link from 'next/link';
import { notFound } from 'next/navigation';
import BackButton from '@/components/back-button';
import { getPublishedProjectBySlug } from '@/lib/projects';

type Props = {
  params: { slug: string };
};

function TextBlock({ label, body, index, fallback }: { label: string; body?: string | null; index: number; fallback: string }) {
  return (
    <article className="border-l border-white/10 pl-6 lg:grid lg:grid-cols-[0.8fr_2fr] lg:gap-12 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-8">
      <div>
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white/35">0{index}</p>
        <h2 className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-[#D4AF37]">{label}</h2>
      </div>
      <p className="mt-4 max-w-3xl whitespace-pre-line text-lg leading-[1.75] text-white/72 lg:mt-0">{body || fallback}</p>
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
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.32em] text-[#D4AF37] md:text-[11px]">Beranda / Karya / {project.title}</p>
          <h1 className="font-display mt-6 max-w-5xl text-5xl font-normal leading-[1.05] tracking-[-0.04em] md:text-7xl">{project.title}</h1>
          <p className="mt-8 max-w-4xl text-xl leading-[1.65] text-white/76 md:text-2xl">{project.problem || 'Studi kasus keputusan desain berbasis masalah, solusi, dan dampak ruang.'}</p>
        </section>

        {project.cover_image ? (
          <section className="pb-20">
            <p className="mb-5 font-mono text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Hero Project</p>
            <div className="aspect-[16/9] overflow-hidden rounded-sm border border-white/10 bg-white/[0.02]">
              <img src={project.cover_image} alt={project.title} className="h-full w-full object-cover" />
            </div>
          </section>
        ) : null}

        <section className="grid gap-8 pb-20 lg:grid-cols-1">
          <TextBlock label="Problem" body={project.problem} index={1} fallback="Problem inti project didokumentasikan melalui temuan ruang dan kebutuhan pengguna." />
          <TextBlock label="Keputusan Desain" body={project.solution} index={2} fallback="Keputusan desain dipilih untuk menyelaraskan fungsi, flow, dan ekspresi ruang secara terukur." />
          <TextBlock label="Proses / Pendekatan" body={project.solution} index={3} fallback="Pendekatan dimulai dari diagnosis masalah, eksplorasi opsi, lalu validasi keputusan bersama klien." />
          <TextBlock label="Impact" body={project.impact} index={4} fallback="Dampak project mencakup efisiensi aktivitas, kualitas pengalaman ruang, dan kemudahan implementasi." />
        </section>

        <section className="border-t border-white/10 py-20">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#D4AF37]">Galeri Gambar</p>
              <h2 className="font-display mt-5 text-4xl font-normal leading-[1.08] tracking-[-0.035em] md:text-5xl">Visual Documentation</h2>
            </div>
          </div>

          {galleryImages.length > 0 ? (
            <div className="mt-10 grid gap-6 md:grid-cols-2">
              {galleryImages.map((image, index) => (
                <figure key={image.id} className={index === 0 ? 'md:col-span-2' : ''}>
                  <div className="overflow-hidden rounded-sm border border-white/10 bg-white/[0.02]">
                    <img src={image.image_url} alt={image.alt_text || `${project.title} gallery ${index + 1}`} className={index === 0 ? 'aspect-[16/9] w-full object-cover' : 'aspect-[4/3] w-full object-cover'} />
                  </div>
                  {image.alt_text ? <figcaption className="mt-3 text-sm leading-6 text-white/46">{image.alt_text}</figcaption> : null}
                </figure>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-base leading-7 text-white/56">Galeri belum tersedia. Dokumentasi visual akan ditambahkan tanpa mengubah narasi studi kasus.</p>
          )}
        </section>

        <section className="border-t border-white/10 py-16">
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/#kontak"
              className="inline-flex items-center rounded-sm border border-[#D4AF37] bg-[#D4AF37] px-6 py-3 font-mono text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-[#E2C866]"
            >
              Diskusikan Project Serupa
            </Link>
            <Link
              href="/karya"
              className="inline-flex items-center rounded-sm border border-[#D4AF37] px-6 py-3 font-mono text-xs font-black uppercase tracking-[0.16em] text-[#D4AF37] transition hover:bg-[#D4AF37]/10"
            >
              Kembali ke Semua Karya
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
