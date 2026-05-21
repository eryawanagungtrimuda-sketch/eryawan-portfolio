export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import BackButton from '@/components/back-button';
import SmartBackLink from '@/components/smart-back-link';
import ProjectImageGallery from '@/components/project-image-gallery';
import AdminEditProjectShortcut from '@/components/admin-edit-project-shortcut';
import RevealObserver from '@/components/reveal-observer';
import ShareLinkButton from '@/components/share-link-button';
import SocialContentStickyAction from '@/components/social-content-sticky-action';
import { getAreaTagLabel } from '@/lib/area-tags';
import { getPublishedProjectBySlug } from '@/lib/projects';
import { absoluteUrl } from '@/lib/site-url';

type Props = {
  params: { slug: string };
};

function buildProjectDescription(project: { problem?: string | null; konteks?: string | null }) {
  const conciseDescription = project.problem?.trim() || project.konteks?.trim();
  return conciseDescription || 'Studi kasus desain yang membaca masalah ruang, keputusan desain, dan dampaknya terhadap pengguna.';
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const project = await getPublishedProjectBySlug(params.slug);
  if (!project) {
    return {
      title: 'Project Not Found | Eryawan Agung Design Portfolio',
      description: 'Project yang Anda cari belum tersedia.',
    };
  }

  const title = `${project.title} | Eryawan Agung Design Portfolio`;
  const description = buildProjectDescription(project);
  const url = absoluteUrl(`/karya/${project.slug}`);
  const ogImageUrl = absoluteUrl(`/karya/${project.slug}/opengraph-image`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: project.title,
      description,
      url,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${project.title} | Eryawan Agung` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${project.title} | Eryawan Agung` }],
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
    display_ratio: image.display_ratio,
    object_position: image.object_position,
    crop_x: image.crop_x,
    crop_y: image.crop_y,
    crop_zoom: image.crop_zoom,
  }));
  const openingDescription = project.problem?.trim() || null;
  const projectUrl = absoluteUrl(`/karya/${project.slug}`);
  const whatsappMessage = `Studi kasus proyek ini menarik untuk dibahas:\n\n${projectUrl}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
  const relatedInsight = project.relatedInsight;
  const areaTags = (project.area_tags || []).filter(Boolean);
  const schemaData = {
    '@context': 'http://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: buildProjectDescription(project),
    image: project.cover_image || galleryImages[0]?.image_url || absoluteUrl('/hero.jpg'),
    author: { '@type': 'Person', name: 'Eryawan Agung' },
    datePublished: project.created_at,
    publisher: { '@type': 'Organization', name: 'Eryawan Studio' },
  };

  return (
    <main id="main-content" className="min-h-screen overflow-x-clip bg-[#080807] px-4 py-8 font-sans text-[#F4F1EA] sm:px-5 md:px-8 lg:px-12 lg:py-12">
      <RevealObserver />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="font-mono text-[11px] font-black uppercase tracking-[0.22em] text-[#D4AF37] transition hover:text-[#E2C866]">
            Eryawan Studio
          </Link>
          <BackButton fallbackHref="/karya" />
        </div>

        <section className="reveal-on-scroll py-16 md:py-24 lg:py-28">
          <p className="break-words font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#D4AF37] md:text-[11px]">Beranda / Karya / {project.title}</p>
          <p className="mt-7 font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#C8A951]/85 md:text-[11px]">Decision-Based Case Study</p>
          <h1 className="font-display mt-6 max-w-5xl text-[2rem] font-normal leading-[1.08] tracking-[-0.03em] sm:text-[2.35rem] md:text-7xl">{project.title}</h1>
          {openingDescription ? (
            <p className="mt-8 max-w-4xl text-base leading-[1.7] text-white/64 sm:text-lg md:text-2xl">{openingDescription}</p>
          ) : null}
        </section>


        <section className="border-y border-white/10 py-8 md:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37]">Ringkasan Proyek</p>
              <h2 className="font-display mt-4 text-3xl font-normal leading-[1.1] tracking-[-0.03em] md:text-4xl">Ringkasan Kategori Proyek</h2>
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

        {relatedInsight?.slug ? (
          <section className="rounded-2xl border border-[#D4AF37]/30 bg-[#C8A951]/[0.08] p-5 sm:p-6 md:p-7">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.32em] text-[#D4AF37]">Wawasan Terkait</p>
            <h2 className="font-display mt-4 text-2xl font-normal leading-[1.18] tracking-[-0.02em] sm:text-[2rem]">
              Ingin tahu alasan teknis di balik project ini?
            </h2>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
              Saya membedah salah satu keputusan desain dari project ini agar Anda dapat melihat hubungan antara masalah ruang, strategi, dan hasil akhirnya.
            </p>
            <Link
              href={`/wawasan/${relatedInsight.slug}`}
              aria-label={`Baca wawasan teknis terkait ${project.title}`}
              className="mt-6 inline-flex min-h-11 items-center rounded-full border border-[#D4AF37]/60 bg-[#D4AF37]/12 px-5 py-2.5 font-sans text-sm font-semibold text-[#D4AF37] transition motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:bg-[#D4AF37]/20"
            >
              Baca Wawasan Teknis
            </Link>
          </section>
        ) : null}

        <section className="border-t border-white/10 pt-24 pb-12 md:pt-28 md:pb-16">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#D4AF37]">Galeri Gambar</p>
              <h2 className="font-display mt-3 text-4xl font-normal leading-[1.08] tracking-[-0.035em] md:mt-4 md:text-5xl">Dokumentasi Visual</h2>
            </div>
          </div>

          {galleryImages.length > 0 ? (
            <div className="mt-6 md:mt-7">
              <ProjectImageGallery images={galleryLightboxImages} projectTitle={project.title} coverImage={project.cover_image} />
            </div>
          ) : (
            <p className="mt-8 text-base leading-7 text-white/56">Galeri belum tersedia. Dokumentasi visual akan ditambahkan tanpa mengubah narasi studi kasus.</p>
          )}
        </section>

        <section className="rounded-2xl border border-[#D4AF37]/30 bg-[#C8A951]/[0.08] p-5 font-sans sm:p-6 md:p-7">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.32em] text-[#D4AF37]">Bagikan Studi Kasus</p>
          <h2 className="mt-4 text-2xl font-semibold leading-[1.2] text-[#F4F1EA] sm:text-[2rem]">Punya rekan yang sedang membahas ruang serupa?</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
            Kirimkan studi kasus ini melalui WhatsApp agar ide, masalah ruang, dan keputusan desainnya lebih mudah didiskusikan bersama owner, kontraktor, atau tim proyek.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
            <Link
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Bagikan studi kasus ${project.title} via WhatsApp`}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#D4AF37] bg-[#D4AF37] px-5 py-2.5 text-sm font-semibold text-black transition duration-300 active:scale-[0.98] motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:bg-[#E2C866]"
            >
              Bagikan via WhatsApp
            </Link>
            <ShareLinkButton
              url={projectUrl}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#D4AF37]/55 bg-transparent px-5 py-2.5 text-sm font-semibold text-[#D4AF37] transition duration-300 active:scale-[0.98] motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:border-[#D4AF37]/80 hover:bg-[#D4AF37]/12"
            />
          </div>
        </section>

        <section className="reveal-on-scroll border-t border-white/10 py-16">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/mulai-project"
              className="inline-flex items-center rounded-full border border-[#D4AF37] bg-[#D4AF37] px-6 py-3 font-sans text-sm font-semibold text-black transition duration-300 active:scale-[0.98] motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:bg-[#E2C866]"
            >
              Diskusikan Proyek Serupa
            </Link>
            <AdminEditProjectShortcut projectId={project.id} />
            <SmartBackLink
              fallbackHref="/karya"
              className="inline-flex items-center rounded-full border border-white/20 px-6 py-3 font-sans text-sm font-semibold text-white/80 transition duration-300 active:scale-[0.98] motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
            />
          </div>
        </section>
        <SocialContentStickyAction contentType="karya" slug={project.slug} />
      </div>
    </main>
  );
}
