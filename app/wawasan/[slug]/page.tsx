import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import SmartBackLink from '@/components/smart-back-link';
import InsightImageGallery from '@/components/insight-image-gallery';
import AdminEditWawasanShortcut from '@/components/admin-edit-wawasan-shortcut';
import RevealObserver from '@/components/reveal-observer';
import { getPublishedInsightBySlug, getPublishedInsightDetailBySlug } from '@/lib/insights';

export const dynamic = 'force-dynamic';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://eryawanagung.com';

function buildInsightDescription(title: string, excerpt?: string | null) {
  return excerpt || `Explore the detailed design analysis and strategy behind ${title}. Read how design decisions were made and their impact on functionality and aesthetics.`;
}

function renderMarkdown(content?: string | null) {
  if (!content) {
    return <p className="font-sans text-base leading-8 text-white/64">Konten wawasan belum tersedia.</p>;
  }

  const lines = content.split('\n');

  return (
    <div className="space-y-4 sm:space-y-5">
      {lines.map((line, index) => {
        const text = line.trim();
        if (!text) return <div key={index} className="h-2" />;

        if (text.startsWith('### ')) {
          return <h3 key={index} className="font-display pt-3 text-lg font-normal leading-[1.2] tracking-[-0.01em] text-[#F4F1EA] sm:text-xl md:text-2xl">{text.replace(/^###\s*/, '')}</h3>;
        }

        if (text.startsWith('## ')) {
          return <h2 key={index} className="font-display pt-5 text-xl font-normal leading-[1.15] tracking-[-0.015em] text-[#F4F1EA] sm:text-2xl md:text-3xl">{text.replace(/^##\s*/, '')}</h2>;
        }

        if (text.startsWith('# ')) {
          return <h2 key={index} className="font-display pt-6 text-2xl font-normal leading-[1.1] tracking-[-0.02em] text-[#F4F1EA] sm:text-3xl md:text-4xl">{text.replace(/^#\s*/, '')}</h2>;
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
  const description = buildInsightDescription(insight.title, insight.excerpt);
  const url = `${SITE_URL}/wawasan/${insight.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title,
      description,
      url,
      images: insight.cover_image ? [{ url: insight.cover_image, alt: `${insight.title} insight image` }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: insight.cover_image ? [insight.cover_image] : undefined,
    },
  };
}

export default async function WawasanDetailPage({ params }: { params: { slug: string } }) {
  const detail = await getPublishedInsightDetailBySlug(params.slug);
  if (!detail) return notFound();
  const { insight, sourceProject, images } = detail;
  const description = buildInsightDescription(insight.title, insight.excerpt);
  const schemaData = {
    '@context': 'http://schema.org',
    '@type': 'Article',
    headline: insight.title,
    description,
    image: insight.cover_image || images[0]?.image_url || `${SITE_URL}/hero.jpg`,
    author: { '@type': 'Person', name: 'Eryawan Agung' },
    datePublished: insight.created_at,
    publisher: { '@type': 'Organization', name: 'Eryawan Studio' },
  };
  const sourceProjectHref = sourceProject?.slug ? `/karya/${sourceProject.slug}` : null;

  return (
    <main className="min-h-screen overflow-x-clip bg-[#080807] px-4 py-12 text-[#F4F1EA] sm:px-5 sm:py-14 md:px-8 md:py-16 lg:px-12">
      <RevealObserver />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      <div className="reveal-on-scroll mx-auto max-w-4xl">
        <SmartBackLink
          fallbackHref="/wawasan"
          className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-white/15 px-3 py-2 font-sans text-sm text-white/64 transition motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-x-0.5 hover:border-[#D4AF37]/45 hover:text-[#D4AF37]"
        >
          ← Kembali
        </SmartBackLink>

        <div className="mt-6 flex flex-wrap gap-2 sm:mt-8">
          <span className="inline-block rounded-2xl border border-[#C8A951]/30 bg-[#C8A951]/10 px-3 py-1.5 font-sans text-[11px] font-semibold text-[#D4AF37]">{insight.category || 'Uncategorized'}</span>
          {insight.content_type === 'review_karya' ? <span className="inline-block rounded-2xl border border-white/8 px-3 py-1.5 font-sans text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">Review Karya</span> : null}
        </div>

        <h1 className="font-display mt-4 text-[2.05rem] font-normal leading-[1.06] tracking-[-0.02em] sm:text-[2.4rem] md:text-6xl">{insight.title}</h1>
        {insight.excerpt ? <p className="mt-4 max-w-3xl font-sans text-base leading-7 text-white/64 sm:mt-5 sm:text-lg sm:leading-relaxed">{insight.excerpt}</p> : null}

        {insight.content_type === 'review_karya' ? (
          <InsightImageGallery
            title={insight.title}
            coverImage={insight.cover_image}
            images={images.map((img, idx) => ({ image_url: img.image_url, alt_text: `${insight.title} ${idx + 1}` }))}
          />
        ) : insight.cover_image ? (
          <div className="mt-8 overflow-hidden rounded-xl border border-white/10 sm:mt-10">
            <img src={insight.cover_image} alt={insight.title} className="h-auto max-h-[380px] w-full object-cover sm:max-h-[520px]" />
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-white/10 bg-gradient-to-br from-[#11100e] via-[#15120b] to-[#0b0a08] p-6 sm:mt-10 sm:p-10">
            <div className="h-32 rounded-lg border border-[#D4AF37]/20 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.2),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(200,169,81,0.15),transparent_35%)] sm:h-40" />
          </div>
        )}

        {sourceProject && sourceProjectHref ? (
          <section className="mt-6 rounded-xl border border-[#D4AF37]/30 bg-[#C8A951]/10 p-4 transition motion-safe:duration-700 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:border-[#D4AF37]/45 hover:bg-white/[0.04] sm:p-5">
            <p className="font-sans text-[11px] uppercase tracking-wide text-[#D4AF37]">Berdasarkan Project</p>
            <div className="mt-3 flex items-center gap-3 sm:gap-4">
              {sourceProject.cover_image ? (
                <img
                  src={sourceProject.cover_image}
                  alt={sourceProject.title}
                  className="h-16 w-16 rounded-xl border border-white/10 object-cover sm:h-20 sm:w-20"
                />
              ) : null}
              <div className="min-w-0">
                <h2 className="font-display text-xl leading-[1.15] tracking-[-0.015em] text-[#F4F1EA] sm:text-2xl">{sourceProject.title}</h2>
                {sourceProject.category ? <p className="mt-1 font-sans text-sm text-white/62">{sourceProject.category}</p> : null}
              </div>
            </div>
            <Link href={sourceProjectHref} className="mt-4 inline-flex min-h-11 items-center rounded-full border border-[#D4AF37]/55 bg-[#D4AF37]/10 px-4 py-2.5 font-sans text-sm text-[#D4AF37] transition motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:bg-[#D4AF37]/20">
              Lihat Studi Kasus Project
            </Link>
          </section>
        ) : null}


        <article className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.02] p-5 text-base sm:mt-10 sm:p-6 md:p-8">
          {renderMarkdown(insight.content)}
        </article>

        <div className="mt-8 flex flex-wrap gap-3 sm:mt-10 sm:gap-4">
          <SmartBackLink fallbackHref="/wawasan" className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 px-5 py-2.5 text-center font-sans text-sm leading-none text-white/70 transition motion-safe:duration-300 hover:border-white/25 hover:bg-white/[0.03] hover:text-white" />
          <Link href="/karya" className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#D4AF37]/45 bg-[#D4AF37]/10 px-5 py-2.5 text-center font-sans text-sm leading-none text-[#D4AF37] transition motion-safe:duration-300 hover:border-[#D4AF37]/70 hover:bg-[#D4AF37]/18">Lihat Karya</Link>
          <Link href="/mulai-project" className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/10 px-5 py-2.5 text-center font-sans text-sm leading-none text-white/70 transition motion-safe:duration-300 hover:border-white/25 hover:bg-white/[0.03] hover:text-white">Diskusikan Project</Link>
          <AdminEditWawasanShortcut insightId={insight.id} />
        </div>
      </div>
    </main>
  );
}
