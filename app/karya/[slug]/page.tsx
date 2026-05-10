export const dynamic = 'force-dynamic';

import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import BackButton from '@/components/back-button';
import ProjectImageGallery from '@/components/project-image-gallery';
import { getAreaTagLabel } from '@/lib/area-tags';
import { getPublishedProjectBySlug } from '@/lib/projects';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getPublishedProjectBySlug(params.slug);

  if (!project) {
    return {
      title: 'Project Tidak Ditemukan | Eryawan Agung Design Portfolio',
      description: 'Project yang Anda cari tidak tersedia atau belum dipublikasikan.',
    };
  }

  const title = `${project.title} | Eryawan Agung Design Portfolio`;
  const description = `Explore the detailed design analysis and strategy behind ${project.title}. Read how design decisions were made and their impact on functionality and aesthetics.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `/karya/${project.slug}`,
      type: 'article',
      images: project.cover_image ? [{ url: project.cover_image, alt: project.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: project.cover_image ? [project.cover_image] : undefined,
    },
  };
}

function TextBlock({ label, body, index, fallback }: { label: string; body?: string | null; index: number; fallback: string }) {
  return (
    <article className="border-l border-white/10 pl-6 transition motion-safe:duration-700 motion-safe:ease-out motion-safe:hover:border-[#C8A951]/35 lg:grid lg:grid-cols-[0.8fr_2fr] lg:gap-12 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-8">
      <div>
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#C8A951]">0{index}</p>
        <h2 className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-[#D4AF37]">{label}</h2>
      </div>
      <p className="mt-4 max-w-3xl whitespace-pre-line font-sans text-lg leading-[1.75] text-white/62 lg:mt-0">{body || fallback}</p>
    </article>
  );
}

export default async function KaryaDetailPage({ params }: Props) {
  const project = await getPublishedProjectBySlug(params.slug);
  if (!project) notFound();

  const galleryImages = [...(project.project_images || [])].sort((a, b) => a.sort_order - b.sort_order);
  const galleryLightboxImages = galleryImages.map((image, index) => ({
    src: image.image_url,
    alt: image.alt_text || `${project.title} gallery ${index + 1}`,
    area_tags: image.area_tags || [],
  }));
  const openingDescription = project.problem || project.konteks || 'Ringkasan studi kasus akan ditampilkan setelah konten proyek dilengkapi.';
  const areaTags = (project.area_tags || []).filter(Boolean);
  const schema = {
    '@context': 'http://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: openingDescription,
    image: project.cover_image || galleryImages[0]?.image_url,
    author: {
      '@type': 'Person',
      name: 'Eryawan Agung',
    },
    datePublished: project.published_at || project.created_at,
    publisher: {
      '@type': 'Organization',
      name: 'Eryawan Studio',
    },
  };

  return (
    <main className="min-h-screen bg-[#080807] px-4 py-8 font-sans text-[#F4F1EA] sm:px-5 md:px-8 lg:px-12 lg:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="font-mono text-[11px] font-black uppercase tracking-[0.22em] text-[#D4AF37] transition hover:text-[#E2C866]">
            Eryawan Studio
          </Link>
          <BackButton label="Kembali ke Semua Karya" fallbackHref="/karya" />
        </div>

        <section className="py-20 md:py-28">
          <p className="break-words font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#D4AF37] md:text-[11px]">Beranda / Karya / {project.title}</p>
          <p className="mt-7 font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#C8A951]/85 md:text-[11px]">Decision-Based Case Study</p>
          <h1 className="font-display mt-6 max-w-5xl text-[2rem] font-normal leading-[1.08] tracking-[-0.03em] sm:text-[2.35rem] md:text-7xl">{project.title}</h1>
          <p className="mt-8 max-w-4xl text-base leading-[1.7] text-white/64 sm:text-lg md:text-2xl">{openingDescription}</p>
        </section>


        <section className="border-y border-white/10 py-8 md:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Project Snapshot</p>
              <h2 className="font-display mt-4 text-3xl font-normal leading-[1.1] tracking-[-0.03em] md:text-4xl">Ringkasan Kategori Project</h2>
            </div>
            <div className="grid w-full gap-4 sm:grid-cols-2 lg:max-w-3xl">
              {project.category ? (
                <article className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4 transition motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:border-[#C8A951]/35 hover:bg-white/[0.04]">
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#C8A951]">Category</p>
                  <p className="mt-2 font-sans text-base text-white/86">{project.category}</p>
                </article>
              ) : null}
              {project.design_category ? (
                <article className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4">
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#C8A951]">Design Category</p>
                  <p className="mt-2 font-sans text-base text-white/86">{project.design_category}</p>
                </article>
              ) : null}
              {project.design_style ? (
                <article className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4">
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#C8A951]">Design Style</p>
                  <p className="mt-2 font-sans text-base text-white/86">{project.design_style}</p>
                </article>
              ) : null}
              {areaTags.length > 0 ? (
                <article className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4">
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#C8A951]">Area Tags</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {areaTags.map((tag) => (
                      <span key={tag} className="rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1 text-xs text-[#D4AF37]">{getAreaTagLabel(tag)}</span>
                    ))}
                  </div>
                </article>
              ) : project.area_type ? (
                <article className="rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4">
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#C8A951]">Area Type</p>
                  <p className="mt-2 font-sans text-base text-white/86">{project.area_type}</p>
                </article>
              ) : null}
            </div>
          </div>
        </section>

        <section className="grid gap-8 pb-20 lg:grid-cols-1">
          <TextBlock label="Konteks" body={project.konteks} index={1} fallback="Konteks project belum ditambahkan." />
          <TextBlock label="Konflik" body={project.konflik} index={2} fallback="Konflik utama belum ditambahkan." />
          <TextBlock label="Keputusan Desain" body={project.keputusan_desain} index={3} fallback="Keputusan desain belum ditambahkan." />
          <TextBlock label="Pendekatan" body={project.pendekatan} index={4} fallback="Pendekatan implementasi belum ditambahkan." />
          <TextBlock label="Dampak" body={project.dampak || project.impact} index={5} fallback="Dampak project belum ditambahkan." />
          <TextBlock label="Insight Kunci" body={project.insight_kunci} index={6} fallback="Insight kunci belum ditambahkan." />
        </section>

        <section className="border-t border-white/10 py-20">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#D4AF37]">Galeri Gambar</p>
              <h2 className="font-display mt-5 text-4xl font-normal leading-[1.08] tracking-[-0.035em] md:text-5xl">Dokumentasi Visual</h2>
            </div>
          </div>

          {galleryImages.length > 0 ? (
            <div className="mt-10">
              <ProjectImageGallery images={galleryLightboxImages} projectTitle={project.title} coverImage={project.cover_image} />
            </div>
          ) : (
            <p className="mt-8 text-base leading-7 text-white/56">Galeri belum tersedia. Dokumentasi visual akan ditambahkan tanpa mengubah narasi studi kasus.</p>
          )}
        </section>

        <section className="border-t border-white/10 py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/kontak"
              className="inline-flex items-center rounded-2xl border border-[#D4AF37] bg-[#D4AF37] px-6 py-3 font-mono text-xs font-black uppercase tracking-[0.16em] text-black transition motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:bg-[#E2C866]"
            >
              Diskusikan Project Serupa
            </Link>
            <Link
              href="/karya"
              className="inline-flex items-center rounded-2xl border border-[#D4AF37] px-6 py-3 font-mono text-xs font-black uppercase tracking-[0.16em] text-[#D4AF37] transition motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:bg-[#D4AF37]/10"
            >
              Kembali ke Semua Karya
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
