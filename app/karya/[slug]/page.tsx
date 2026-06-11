export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import Link from 'next/link';
import TrackedLink from '@/components/tracked-link';
import { notFound } from 'next/navigation';
import BackButton from '@/components/back-button';
import SmartBackLink from '@/components/smart-back-link';
import ProjectImageGallery from '@/components/project-image-gallery';
import AdminEditProjectShortcut from '@/components/admin-edit-project-shortcut';
import RevealObserver from '@/components/reveal-observer';
import ShareLinkButton from '@/components/share-link-button';
import SocialComposerModal from '@/components/social-composer-modal';
import { getAreaTagLabel } from '@/lib/area-tags';
import { getPublishedProjectBySlug } from '@/lib/projects';
import { absoluteUrl } from '@/lib/site-url';
import PublicJourneyLinks from '@/components/public-journey-links';

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
      title,
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

function formatProjectStatus(status?: string | null) {
  if (!status) return null;

  const labels: Record<string, string> = {
    konsep: 'Konsep',
    berjalan: 'Berjalan',
    selesai: 'Selesai',
  };

  return labels[status] || status;
}

function TextBlock({ label, body, index, fallback }: { label: string; body?: string | null; index: number; fallback: string }) {
  return (
    <article className="group rounded-[1.75rem] border border-white/10 bg-white/[0.018] px-5 py-7 transition motion-safe:duration-700 motion-safe:ease-out motion-safe:hover:border-[#C8A951]/35 motion-safe:hover:bg-white/[0.03] sm:px-7 sm:py-8 lg:grid lg:grid-cols-[0.68fr_2fr] lg:gap-14 lg:px-8 lg:py-10">
      <div className="border-b border-white/10 pb-5 lg:border-b-0 lg:pb-0">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.32em] text-[#C8A951]">0{index}</p>
        <h2 className="mt-3 text-sm font-bold uppercase tracking-[0.2em] text-[#D4AF37]">{label}</h2>
      </div>
      <p className="mt-5 max-w-3xl whitespace-pre-line font-sans text-base leading-[1.85] text-white/66 sm:text-lg lg:mt-0">{body || fallback}</p>
    </article>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/15 px-4 py-4 sm:px-5">
      <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#C8A951]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-white/82 sm:text-base">{value}</p>
    </article>
  );
}

export default async function KaryaDetailPage({ params }: Props) {
  const project = await getPublishedProjectBySlug(params.slug);
  if (!project) notFound();

  const galleryImages = [...(project.project_images || [])].sort((a, b) => (a.sort_order ?? 9999) - (b.sort_order ?? 9999));
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
  const projectCoverImage = project.cover_image || galleryImages[0]?.image_url || null;
  const projectUrl = absoluteUrl(`/karya/${project.slug}`);
  const whatsappMessage = `Halo, saya melihat studi kasus ${project.title} di website Eryawan Agung.
Saya ingin mendiskusikan kemungkinan proyek dengan kebutuhan ruang yang serupa.

${projectUrl}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
  const relatedInsight = project.relatedInsight;
  const areaTags = (project.area_tags || []).filter(Boolean);
  const metaItems = [
    project.category ? { label: 'Kategori', value: project.category } : null,
    project.design_category ? { label: 'Ruang Lingkup', value: project.design_category } : null,
    project.design_style ? { label: 'Gaya', value: project.design_style } : null,
    project.area_type ? { label: 'Area', value: project.area_type } : null,
    project.area_scope ? { label: 'Cakupan', value: project.area_scope } : null,
    project.project_size ? { label: 'Luas', value: project.project_size } : null,
    formatProjectStatus(project.project_status) ? { label: 'Status', value: formatProjectStatus(project.project_status)! } : null,
    project.completion_year ? { label: 'Tahun', value: String(project.completion_year) } : null,
  ].filter(Boolean) as { label: string; value: string }[];
  const caseSummaryItems = [
    project.problem ? { label: 'Fokus Desain', value: project.problem } : null,
    project.solution ? { label: 'Ruang Lingkup', value: project.solution } : null,
    project.keputusan_desain ? { label: 'Keputusan Utama', value: project.keputusan_desain } : null,
  ].filter(Boolean) as { label: string; value: string }[];
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: buildProjectDescription(project),
    image: project.cover_image || galleryImages[0]?.image_url || absoluteUrl('/hero.jpg'),
    author: { '@type': 'Person', name: 'Eryawan Agung' },
    datePublished: project.created_at,
    publisher: { '@type': 'Person', name: 'Eryawan Agung' },
  };

  return (
    <main id="main-content" className="min-h-screen overflow-x-clip bg-[#080807] px-4 py-8 font-sans text-[#F4F1EA] sm:px-5 md:px-8 lg:px-12 lg:py-12">
      <RevealObserver />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-start">
          <BackButton fallbackHref="/karya" />
        </div>

        <section className="reveal-on-scroll pt-12 pb-8 md:pt-16 md:pb-10 lg:pt-20 lg:pb-16">
          <p className="break-words font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#D4AF37] md:text-[11px]">Beranda / Karya / {project.title}</p>
          <div className="mt-7 max-w-5xl">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#C8A951]/85 md:text-[11px]">Studi Kasus Interior</p>
            <h1 className="font-display mt-5 max-w-5xl text-[2.1rem] font-normal leading-[1.04] tracking-[-0.04em] sm:text-[2.8rem] md:text-7xl">{project.title}</h1>
            {openingDescription ? (
              <p className="mt-6 max-w-3xl text-base leading-[1.75] text-white/68 sm:text-lg md:text-[1.35rem] md:leading-[1.6]">{openingDescription}</p>
            ) : null}
          </div>

          {projectCoverImage || metaItems.length > 0 ? (
            <div className="mt-8 lg:mt-12">
              <div className={projectCoverImage ? "lg:relative lg:pb-10" : "max-w-sm"}>
                {projectCoverImage ? (
                  <div className="relative hidden overflow-hidden rounded-[2rem] border border-white/10 bg-[#11100d] shadow-[0_34px_120px_rgba(0,0,0,0.45)] lg:block lg:aspect-video lg:w-[78%] xl:rounded-[2.35rem]">
                    <img
                      src={projectCoverImage}
                      alt={`${project.title} cover`}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-0 rounded-[2rem] bg-[linear-gradient(90deg,rgba(8,8,7,0.04)_0%,rgba(8,8,7,0.08)_48%,rgba(8,8,7,0.62)_100%)] xl:rounded-[2.35rem]" />
                    <div className="pointer-events-none absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-[#D4AF37]/18 xl:rounded-[2.35rem]" />
                  </div>
                ) : null}

                {metaItems.length > 0 ? (
                  <aside className="h-fit rounded-[1.75rem] border border-[#D4AF37]/20 bg-[#C8A951]/[0.06] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] lg:absolute lg:right-0 lg:top-1/2 lg:mt-0 lg:w-[22rem] lg:-translate-y-1/2 lg:bg-[#11100d]/95 lg:shadow-[0_30px_90px_rgba(0,0,0,0.42)] xl:w-[23rem]">
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.32em] text-[#D4AF37]">Catatan Proyek</p>
                    <dl className="mt-5 divide-y divide-white/10">
                      {metaItems.map((item) => (
                        <div key={`${item.label}-${item.value}`} className="grid grid-cols-[0.78fr_1.22fr] gap-3 py-3 first:pt-0 last:pb-0">
                          <dt className="font-mono text-[10px] font-black uppercase tracking-[0.18em] text-white/38">{item.label}</dt>
                          <dd className="text-right text-sm leading-6 text-white/82">{item.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </aside>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>

        {caseSummaryItems.length > 0 || areaTags.length > 0 ? (
          <section className="border-y border-white/10 py-7 md:py-9">
            <div className="grid gap-7 lg:grid-cols-[0.5fr_1fr] lg:gap-11">
              <div>
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#D4AF37]">Ringkasan Proyek</p>
                <h2 className="font-display mt-3 max-w-lg text-2xl font-normal leading-[1.12] tracking-[-0.025em] md:text-4xl">Narasi singkat sebelum membaca detail keputusan desain.</h2>
                <p className="mt-4 max-w-md text-sm leading-7 text-white/54">Ringkasan ini hanya menggunakan data proyek yang tersedia agar pembacaan studi kasus tetap akurat dan mudah dipindai.</p>
              </div>
              <div className="grid gap-4">
                {caseSummaryItems.map((item) => (
                  <SummaryItem key={item.label} label={item.label} value={item.value} />
                ))}
                {areaTags.length > 0 ? (
                  <article className="rounded-2xl border border-white/10 bg-black/15 px-4 py-4 sm:px-5">
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#C8A951]">Area Terkait</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {areaTags.map((tag) => (
                        <span key={tag} className="rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1 text-xs leading-5 text-[#D4AF37]">{getAreaTagLabel(tag)}</span>
                      ))}
                    </div>
                  </article>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        <section className="py-16 md:py-20">
          <div className="mb-8 max-w-3xl md:mb-10">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.44em] text-[#D4AF37]">Alur Studi Kasus</p>
            <h2 className="font-display mt-4 text-3xl font-normal leading-[1.1] tracking-[-0.035em] md:text-5xl">Dari konteks ruang menuju keputusan desain.</h2>
          </div>
          <div className="grid gap-5 md:gap-6">
            <TextBlock label="Konteks" body={project.konteks} index={1} fallback="Konteks project belum ditambahkan." />
            <TextBlock label="Konflik" body={project.konflik} index={2} fallback="Konflik utama belum ditambahkan." />
            <TextBlock label="Keputusan Desain" body={project.keputusan_desain} index={3} fallback="Keputusan desain belum ditambahkan." />
            <TextBlock label="Pendekatan" body={project.pendekatan} index={4} fallback="Pendekatan implementasi belum ditambahkan." />
            <TextBlock label="Dampak" body={project.dampak || project.impact} index={5} fallback="Dampak project belum ditambahkan." />
            <TextBlock label="Insight Kunci" body={project.insight_kunci} index={6} fallback="Insight kunci belum ditambahkan." />
          </div>
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
              Baca Studi Kasus
            </Link>
          </section>
        ) : (
          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6 md:p-7">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.32em] text-[#D4AF37]">Wawasan Terkait</p>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/66 sm:text-base">Belum ada wawasan terkait untuk proyek ini saat ini. Anda tetap dapat melanjutkan ke daftar wawasan untuk membaca pembahasan desain lainnya.</p>
            <Link href="/wawasan" className="mt-5 inline-flex min-h-11 items-center rounded-full border border-[#D4AF37]/45 bg-[#D4AF37]/10 px-5 py-2.5 font-sans text-sm font-semibold text-[#D4AF37]">Lihat Wawasan</Link>
          </section>
        )}

        <section className="border-t border-white/10 pt-20 pb-12 md:pt-24 md:pb-16">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#D4AF37]">Galeri Gambar</p>
              <h2 className="font-display mt-3 text-4xl font-normal leading-[1.08] tracking-[-0.035em] md:mt-4 md:text-5xl">Dokumentasi Visual</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/56 sm:text-base">Foto proyek ditempatkan sebagai bahan baca visual, bukan sekadar lampiran, agar konteks ruang dan keputusan desain dapat dilihat lebih tenang.</p>
            </div>
          </div>

          {galleryImages.length > 0 ? (
            <div className="mt-7 rounded-[2rem] border border-white/10 bg-white/[0.018] px-3 pt-3 md:mt-9 md:px-4 md:pt-4">
              <ProjectImageGallery images={galleryLightboxImages} projectTitle={project.title} coverImage={project.cover_image} />
            </div>
          ) : (
            <p className="mt-8 text-base leading-7 text-white/56">Galeri belum tersedia. Dokumentasi visual akan ditambahkan tanpa mengubah narasi studi kasus.</p>
          )}
        </section>

        <section className="rounded-[1.75rem] border border-[#D4AF37]/30 bg-[#C8A951]/[0.08] p-5 font-sans sm:p-6 md:p-8">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.32em] text-[#D4AF37]">Bagikan Studi Kasus</p>
          <h2 className="font-display mt-4 text-3xl font-normal leading-[1.12] tracking-[-0.03em] text-[#F4F1EA] sm:text-[2.4rem]">Diskusikan arah desain dengan konteks yang lebih jelas.</h2>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
            Gunakan studi kasus ini sebagai referensi awal untuk menyamakan brief, prioritas ruang, dan keputusan desain bersama owner, kontraktor, atau tim proyek.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start">
            <TrackedLink
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              eventName="whatsapp_click"
              eventProps={{ source: "karya_detail", label: "diskusikan_proyek_serupa", content_type: "karya", slug: project.slug, href_type: "external" }}
              data-cta="karya-detail-whatsapp"
              aria-label={`Bagikan studi kasus ${project.title} via WhatsApp`}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#D4AF37] bg-[#D4AF37] px-5 py-2.5 text-sm font-semibold text-black transition duration-300 active:scale-[0.98] motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:bg-[#E2C866]"
            >
              Konsultasikan Arah Desain via WhatsApp
            </TrackedLink>
            <ShareLinkButton
              url={projectUrl}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#D4AF37]/55 bg-transparent px-5 py-2.5 text-sm font-semibold text-[#D4AF37] transition duration-300 active:scale-[0.98] motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:border-[#D4AF37]/80 hover:bg-[#D4AF37]/12"
            />
          </div>
        </section>

        <div className="mt-12 pb-4">
          <PublicJourneyLinks
            links={[
              { href: relatedInsight?.slug ? `/wawasan/${relatedInsight.slug}` : '/wawasan', title: relatedInsight?.slug ? 'Baca Wawasan Terkait' : 'Baca Wawasan', description: relatedInsight?.slug ? 'Lanjutkan ke insight yang membahas keputusan dari proyek ini.' : 'Lanjutkan eksplorasi ke artikel strategi dan studi desain.' },
              { href: '/karya', title: 'Lihat Karya Lainnya', description: 'Bandingkan pendekatan proyek lain untuk kebutuhan ruang berbeda.' },
              { href: '/mulai-project', title: 'Mulai Pemetaan Kebutuhan', description: 'Susun brief awal dan diskusikan kebutuhan proyek Anda.' },
            ]}
          />
        </div>
        <section className="reveal-on-scroll border-t border-white/10 py-16">
          <div className="max-w-3xl">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.36em] text-[#D4AF37]">Langkah Berikutnya</p>
            <h2 className="font-display mt-4 text-3xl font-normal leading-[1.12] tracking-[-0.03em] md:text-5xl">Mulai dari brief, bukan dari dekorasi.</h2>
            <p className="mt-4 max-w-2xl font-sans text-sm leading-7 text-white/62 sm:text-base">Ceritakan kebutuhan ruang Anda, lalu kita petakan prioritas, batasan, dan pendekatan desain yang paling tepat.</p>
          </div>
          <div className="mt-7 flex flex-col gap-3 pb-24 sm:flex-row sm:flex-wrap sm:items-center md:pb-0">
            <Link
              href="/mulai-project"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#D4AF37] bg-[#D4AF37] px-6 py-3 text-center font-sans text-sm font-semibold leading-none text-black transition duration-300 active:scale-[0.98] hover:bg-[#E2C866]"
            >
              Diskusikan Brief Proyek
            </Link>
            <AdminEditProjectShortcut projectId={project.id} />
            <SmartBackLink
              fallbackHref="/karya"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-6 py-2.5 text-center font-sans text-sm font-semibold leading-none text-white/80 transition duration-300 active:scale-[0.98] hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37]"
            />
          </div>

        </section>
        <SocialComposerModal contentType="karya" slug={project.slug} />
      </div>
    </main>
  );
}
