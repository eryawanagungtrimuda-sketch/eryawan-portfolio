import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import TrackedLink from '@/components/tracked-link';
import { notFound } from 'next/navigation';
import SmartBackLink from '@/components/smart-back-link';
import InsightImageGallery from '@/components/insight-image-gallery';
import RevealObserver from '@/components/reveal-observer';
import ShareLinkButton from '@/components/share-link-button';
import WawasanAdminActions from '@/components/wawasan-admin-actions';
import AdminEditWawasanShortcut from '@/components/admin-edit-wawasan-shortcut';
import { getPublishedInsightBySlug, getPublishedInsightDetailBySlug } from '@/lib/insights';
import { absoluteUrl } from '@/lib/site-url';
import PublicJourneyLinks from '@/components/public-journey-links';

export const dynamic = 'force-dynamic';

function buildInsightDescription(title: string, excerpt?: string | null) {
  return excerpt || `Explore the detailed design analysis and strategy behind ${title}. Read how design decisions were made and their impact on functionality and aesthetics.`;
}

function resolveOgImageUrl(imageUrl?: string | null) {
  if (!imageUrl) return absoluteUrl('/hero.jpg');
  return /^https?:\/\//i.test(imageUrl) ? imageUrl : absoluteUrl(imageUrl);
}

function normalizeTextForComparison(text: string) {
  return text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['"`]/g, '')
    .replace(/[^A-Za-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function removeDuplicateLeadingHeading(content: string, title: string) {
  const lines = content.split('\n');
  const normalizedTitle = normalizeTextForComparison(title);

  for (let i = 0; i < lines.length; i += 1) {
    const trimmed = lines[i].trim();
    if (!trimmed) continue;

    const headingMatch = trimmed.match(/^#{1,3}\s+(.+)$/);
    if (headingMatch) {
      const headingText = headingMatch[1].trim();
      if (normalizeTextForComparison(headingText) === normalizedTitle) {
        lines.splice(i, 1);
      }
    }
    break;
  }

  return lines.join('\n');
}

function renderMarkdown(content: string | null | undefined, insightTitle: string) {
  if (!content) {
    return <p className="font-sans text-base leading-8 text-white/64">Konten wawasan belum tersedia.</p>;
  }

  const normalizedContent = removeDuplicateLeadingHeading(content, insightTitle);
  const lines = normalizedContent.split('\n');

  return (
    <div className="space-y-4 sm:space-y-5">
      {lines.map((line, index) => {
        const text = line.trim();
        if (!text) return <div key={index} className="h-2" />;

        if (text.startsWith('### ')) {
          return <h3 key={index} className="font-sans pt-3 text-lg font-normal leading-[1.2] tracking-[-0.01em] text-[#F4F1EA] sm:text-xl md:text-2xl">{text.replace(/^###\s*/, '')}</h3>;
        }

        if (text.startsWith('## ')) {
          return <h2 key={index} className="font-sans pt-5 text-xl font-normal leading-[1.15] tracking-[-0.015em] text-[#F4F1EA] sm:text-2xl md:text-3xl">{text.replace(/^##\s*/, '')}</h2>;
        }

        if (text.startsWith('# ')) {
          return <h2 key={index} className="font-sans pt-6 text-2xl font-normal leading-[1.1] tracking-[-0.02em] text-[#F4F1EA] sm:text-3xl md:text-4xl">{text.replace(/^#\s*/, '')}</h2>;
        }

        return <p key={index} className="font-sans whitespace-pre-wrap text-[15px] leading-8 text-white/66 sm:text-base">{line}</p>;
      })}
    </div>
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const insight = await getPublishedInsightBySlug(params.slug);
  if (!insight) {
    return {
      title: 'Wawasan tidak ditemukan',
      description: 'Insight yang Anda cari tidak tersedia atau belum dipublikasikan.',
    };
  }

  const title = `${insight.title} | Eryawan Agung Design Portfolio`;
  const description = insight.excerpt || 'Bedah singkat tentang keputusan desain, masalah ruang, dan dampaknya terhadap pengalaman pengguna.';
  const url = absoluteUrl(`/wawasan/${insight.slug}`);
  const ogImageUrl = absoluteUrl(`/wawasan/${insight.slug}/opengraph-image`);

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title,
      description,
      url,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${insight.title} | Eryawan Agung` }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${insight.title} | Eryawan Agung` }],
    },
  };
}

export default async function WawasanDetailPage({ params }: { params: { slug: string } }) {
  const detail = await getPublishedInsightDetailBySlug(params.slug);
  if (!detail) return notFound();
  const { insight, sourceProject, images } = detail;
  const description = buildInsightDescription(insight.title, insight.excerpt);
  const schemaImageUrl = resolveOgImageUrl(insight.cover_image || images[0]?.image_url);
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: insight.title,
    description,
    image: schemaImageUrl,
    author: { '@type': 'Person', name: 'Eryawan Agung' },
    datePublished: insight.created_at,
    publisher: { '@type': 'Person', name: 'Eryawan Agung' },
  };
  const sourceProjectHref = sourceProject?.slug ? `/karya/${sourceProject.slug}` : null;
  const insightUrl = absoluteUrl(`/wawasan/${insight.slug}`);
  const whatsappMessage = `Halo, saya membaca artikel ${insight.title} di website Eryawan Agung.
Saya ingin berdiskusi tentang kebutuhan desain/ruang yang relevan dengan topik tersebut.

${insightUrl}`;
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <main id="main-content" className="min-h-screen overflow-x-clip bg-[#080807] px-4 py-12 text-[#F4F1EA] sm:px-5 sm:py-14 md:px-8 md:py-16 lg:px-12">
      <RevealObserver />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      <div className="reveal-on-scroll mx-auto max-w-4xl pb-28 md:pb-32">
        <SmartBackLink
          fallbackHref="/wawasan"
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 px-6 py-2.5 font-sans text-sm font-semibold leading-none text-white/80 transition motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-x-0.5 hover:border-[#D4AF37]/45 hover:text-[#D4AF37]"
        >
          ← Kembali ke Wawasan
        </SmartBackLink>

        <div className="mt-6 flex flex-wrap gap-2 sm:mt-8">
          <span className="inline-block rounded-2xl border border-[#C8A951]/30 bg-[#C8A951]/10 px-3 py-1.5 font-sans text-[11px] font-semibold text-[#D4AF37]">{insight.category || 'Uncategorized'}</span>
          {insight.content_type === 'review_karya' ? <span className="inline-block rounded-2xl border border-white/8 px-3 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">Review Karya</span> : null}
        </div>

        <h1 className="font-sans mt-4 text-[2.05rem] font-normal leading-[1.06] tracking-[-0.02em] sm:text-[2.4rem] md:text-6xl">{insight.title}</h1>
        {insight.excerpt ? <p className="mt-4 max-w-3xl font-sans text-base leading-7 text-white/64 sm:mt-5 sm:text-lg sm:leading-relaxed">{insight.excerpt}</p> : null}

        {insight.content_type === 'review_karya' ? (
          <InsightImageGallery
            title={insight.title}
            coverImage={insight.cover_image}
            images={images.map((img, idx) => ({ image_url: img.image_url, alt_text: `${insight.title} ${idx + 1}` }))}
          />
        ) : insight.cover_image ? (
          <div className="mt-8 overflow-hidden rounded-xl border border-white/10 sm:mt-10">
            <Image src={insight.cover_image} alt={insight.title || 'Gambar wawasan desain'} width={1600} height={1000} sizes="(max-width: 640px) 100vw, 70vw" className="h-auto max-h-[380px] w-full object-cover sm:max-h-[520px]" priority />
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-white/10 bg-gradient-to-br from-[#11100e] via-[#15120b] to-[#0b0a08] p-6 sm:mt-10 sm:p-10">
            <div className="h-32 rounded-lg border border-[#D4AF37]/20 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.2),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(200,169,81,0.15),transparent_35%)] sm:h-40" />
          </div>
        )}

        {sourceProject && sourceProjectHref ? (
          <section className="mt-6 rounded-xl border border-[#D4AF37]/30 bg-[#C8A951]/10 p-4 transition motion-safe:duration-700 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:border-[#D4AF37]/45 hover:bg-white/[0.04] sm:p-5">
            <p className="font-display text-[11px] uppercase tracking-[0.14em] text-[#D4AF37]">Berdasarkan Proyek</p>
            <div className="mt-3 flex items-center gap-3 sm:gap-4">
              {sourceProject.cover_image ? (
                <Image
                  src={sourceProject.cover_image}
                  alt={sourceProject.title || 'Dokumentasi visual project'}
                  width={80}
                  height={80}
                  sizes="80px"
                  className="h-16 w-16 rounded-xl border border-white/10 object-cover sm:h-20 sm:w-20"
                  loading="lazy"
                />
              ) : null}
              <div className="min-w-0">
                <h2 className="font-sans text-xl leading-[1.15] tracking-[-0.015em] text-[#F4F1EA] sm:text-2xl">{sourceProject.title}</h2>
                {sourceProject.category ? <p className="mt-1 font-sans text-sm text-white/62">{sourceProject.category}</p> : null}
              </div>
            </div>
            <p className="mt-3 font-sans text-sm leading-7 text-white/56">Proyek ini menjadi studi kasus utama yang melahirkan wawasan teknis di halaman ini.</p>
            <TrackedLink href={sourceProjectHref} eventName="project_view_intent" eventProps={{ source: "wawasan_detail", label: "lihat_studi_kasus_proyek", content_type: "karya", slug: sourceProject.slug, href_type: "internal" }} data-cta="wawasan-detail-source-project" aria-label={`Lihat studi kasus proyek ${sourceProject.title}`} className="mt-4 inline-flex min-h-11 items-center rounded-full border border-[#D4AF37]/55 bg-[#D4AF37]/10 px-4 py-2.5 font-sans text-sm text-[#D4AF37] transition motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:bg-[#D4AF37]/20">
              Lihat Studi Kasus Proyek
            </TrackedLink>
          </section>
        ) : (
          <section className="mt-6 rounded-xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
            <p className="font-display text-[11px] uppercase tracking-[0.14em] text-[#D4AF37]">Sumber Proyek</p>
            <p className="mt-3 font-sans text-sm leading-7 text-white/60">Artikel ini ditulis sebagai insight mandiri dan tidak terhubung ke satu proyek tertentu. Jelajahi halaman Karya untuk melihat studi kasus lengkap.</p>
            <Link href="/karya" className="mt-4 inline-flex min-h-11 items-center rounded-full border border-[#D4AF37]/55 bg-[#D4AF37]/10 px-4 py-2.5 font-sans text-sm text-[#D4AF37]">Lihat Karya</Link>
          </section>
        )}


        <article className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.02] p-5 text-base sm:mt-10 sm:p-6 md:p-8">
          {renderMarkdown(insight.content, insight.title)}
        </article>

        <section className="mt-8 rounded-2xl border border-[#D4AF37]/30 bg-[#C8A951]/[0.08] p-5 sm:mt-10 sm:p-6 md:p-7">
          <p className="font-sans text-[10px] font-black uppercase tracking-[0.34em] text-[#D4AF37]">Bagikan Insight</p>
          <h2 className="mt-4 font-sans text-2xl leading-[1.15] tracking-[-0.02em] text-[#F4F1EA] sm:text-3xl">Punya rekan yang sedang memikirkan ruang serupa?</h2>
          <p className="mt-4 max-w-3xl font-sans text-sm leading-7 text-white/68 sm:text-base">Kirimkan artikel ini melalui WhatsApp agar ide desainnya lebih mudah didiskusikan bersama pasangan, kontraktor, atau tim proyek.</p>
          <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:gap-4">
            <TrackedLink href={whatsappHref} target="_blank" rel="noopener noreferrer" eventName="whatsapp_click" eventProps={{ source: "wawasan_detail", label: "mulai_percakapan_proyek", content_type: "wawasan", slug: insight.slug, href_type: "external" }} data-cta="wawasan-detail-whatsapp" aria-label={`Bagikan insight ${insight.title} via WhatsApp`} className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#D4AF37]/65 bg-[#D4AF37] px-5 py-2.5 text-center font-sans text-sm font-semibold text-black transition motion-safe:duration-300 hover:bg-[#E2C866]">
              Mulai Percakapan Proyek via WhatsApp
            </TrackedLink>
            <ShareLinkButton
              url={insightUrl}
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-5 py-2.5 text-center font-sans text-sm font-semibold text-white/78 transition motion-safe:duration-300 hover:border-[#D4AF37]/45 hover:bg-white/[0.03] hover:text-[#D4AF37]"
            />
          </div>
        </section>

        <div className="mt-10">
          <PublicJourneyLinks
            links={[
              { href: sourceProjectHref || '/karya', title: sourceProjectHref ? 'Lihat Karya Terkait' : 'Lihat Karya', description: sourceProjectHref ? 'Masuk ke studi kasus proyek yang menjadi sumber wawasan ini.' : 'Jelajahi studi kasus proyek untuk melihat keputusan desain nyata.' },
              { href: '/wawasan', title: 'Baca Wawasan Lainnya', description: 'Lanjutkan pembacaan insight strategi dan review desain lainnya.' },
              { href: '/mulai-project', title: 'Mulai Percakapan Proyek', description: 'Bahas kebutuhan ruang Anda dengan brief awal yang terarah.' },
            ]}
          />
        </div>
        <div className="mt-8 border-t border-white/10 pt-10 sm:mt-10 sm:pt-12">
          <div className="flex flex-col items-stretch gap-3 md:items-center md:gap-5">
            <div className="flex w-full flex-col gap-3 md:w-auto md:flex-row md:flex-wrap md:justify-center md:gap-3.5">
              <Link href="/mulai-project" className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#D4AF37] bg-[#D4AF37] px-6 py-2.5 text-center font-sans text-sm font-semibold leading-none text-black transition motion-safe:duration-300 hover:bg-[#E2C866] md:w-auto">Diskusikan Proyek Serupa</Link>
              <AdminEditWawasanShortcut insightId={insight.id} className="premium-interactive inline-flex min-h-11 w-full items-center justify-center rounded-full border border-[#D4AF37]/55 bg-transparent px-6 py-2.5 text-center font-sans text-sm font-semibold leading-none text-[#D4AF37] transition motion-safe:duration-300 hover:border-[#D4AF37]/80 hover:bg-[#D4AF37]/12 md:w-auto" />
              <SmartBackLink fallbackHref="/wawasan" className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-white/20 px-6 py-2.5 text-center font-sans text-sm font-semibold leading-none text-white/80 transition motion-safe:duration-300 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] md:w-auto">← Kembali ke Wawasan</SmartBackLink>
            </div>
            <WawasanAdminActions slug={insight.slug} placement="inline-desktop" />
          </div>
            <p className="mt-4 max-w-2xl text-center font-sans text-sm leading-7 text-white/60 md:text-left">Cocok untuk rumah tinggal, interior komersial, ruang kerja, atau area pelayanan.</p>
          </div>
      </div>

      <WawasanAdminActions slug={insight.slug} placement="floating-mobile" />
    </main>
  );
}
