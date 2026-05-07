import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedInsightBySlug, getPublishedInsightDetailBySlug } from '@/lib/insights';

export const dynamic = 'force-dynamic';

function renderMarkdown(content?: string | null) {
  if (!content) {
    return <p className="text-base leading-8 text-white/75">Konten wawasan belum tersedia.</p>;
  }

  const lines = content.split('\n');

  return (
    <div className="space-y-4">
      {lines.map((line, index) => {
        const text = line.trim();
        if (!text) return <div key={index} className="h-2" />;

        if (text.startsWith('### ')) {
          return <h3 key={index} className="font-display pt-3 text-xl font-normal leading-tight tracking-[-0.01em] text-[#F4F1EA] md:text-2xl">{text.replace(/^###\s*/, '')}</h3>;
        }

        if (text.startsWith('## ')) {
          return <h2 key={index} className="font-display pt-5 text-2xl font-normal leading-tight tracking-[-0.015em] text-[#F4F1EA] md:text-3xl">{text.replace(/^##\s*/, '')}</h2>;
        }

        if (text.startsWith('# ')) {
          return <h1 key={index} className="font-display pt-6 text-3xl font-normal leading-[1.02] tracking-[-0.02em] text-[#F4F1EA] md:text-4xl">{text.replace(/^#\s*/, '')}</h1>;
        }

        return <p key={index} className="whitespace-pre-wrap text-base leading-8 text-white/80">{line}</p>;
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

  return {
    title: `${insight.title} | Wawasan Desain`,
    description: insight.excerpt || 'Wawasan desain dari Eryawan Studio.',
  };
}

export default async function WawasanDetailPage({ params }: { params: { slug: string } }) {
  const detail = await getPublishedInsightDetailBySlug(params.slug);
  if (!detail) return notFound();
  const { insight, sourceProject } = detail;
  const sourceProjectHref = sourceProject?.slug ? `/karya/${sourceProject.slug}` : null;

  return (
    <main className="min-h-screen bg-[#080807] px-5 py-16 text-[#F4F1EA] md:px-8 lg:px-12">
      <div className="mx-auto max-w-4xl">
        <Link href="/wawasan" className="inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-[#D4AF37]">
          <span aria-hidden>←</span> Kembali ke Wawasan
        </Link>

        <span className="mt-8 inline-block rounded-sm border border-[#C8A951]/40 bg-[#C8A951]/10 px-2.5 py-1 text-[11px] uppercase tracking-wide text-[#D4AF37]">
          {insight.category || 'Uncategorized'}
        </span>

        <h1 className="font-display mt-4 text-4xl font-normal leading-[0.98] tracking-[-0.02em] md:text-6xl">{insight.title}</h1>
        {insight.excerpt ? <p className="mt-5 max-w-3xl text-lg leading-relaxed text-white/70">{insight.excerpt}</p> : null}

        {insight.cover_image ? (
          <div className="mt-10 overflow-hidden rounded-xl border border-white/10">
            <img src={insight.cover_image} alt={insight.title} className="max-h-[520px] w-full object-cover" />
          </div>
        ) : (
          <div className="mt-10 rounded-xl border border-white/10 bg-gradient-to-br from-[#11100e] via-[#15120b] to-[#0b0a08] p-10">
            <div className="h-40 rounded-lg border border-[#D4AF37]/20 bg-[radial-gradient(circle_at_20%_20%,rgba(212,175,55,0.2),transparent_45%),radial-gradient(circle_at_80%_80%,rgba(200,169,81,0.15),transparent_35%)]" />
          </div>
        )}

        {sourceProject && sourceProjectHref ? (
          <section className="mt-6 rounded-xl border border-[#D4AF37]/30 bg-[#C8A951]/10 p-4 md:p-5">
            <p className="text-[11px] uppercase tracking-wide text-[#D4AF37]">Berdasarkan Project</p>
            <div className="mt-3 flex items-center gap-4">
              {sourceProject.cover_image ? (
                <img
                  src={sourceProject.cover_image}
                  alt={sourceProject.title}
                  className="h-20 w-20 rounded-md border border-white/10 object-cover"
                />
              ) : null}
              <div className="min-w-0">
                <h2 className="font-display text-2xl leading-tight tracking-[-0.015em] text-[#F4F1EA]">{sourceProject.title}</h2>
                {sourceProject.category ? <p className="mt-1 text-sm text-white/65">{sourceProject.category}</p> : null}
              </div>
            </div>
            <Link href={sourceProjectHref} className="mt-4 inline-flex rounded-sm border border-[#D4AF37]/55 bg-[#D4AF37]/10 px-4 py-2 text-sm text-[#D4AF37] transition hover:bg-[#D4AF37]/20">
              Lihat Studi Kasus Project
            </Link>
          </section>
        ) : null}

        <article className="mt-10 rounded-xl border border-white/10 bg-white/[0.02] p-6 text-base md:p-8">
          {renderMarkdown(insight.content)}
        </article>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/wawasan" className="rounded-sm border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:border-white/30 hover:text-white">Kembali ke Wawasan</Link>
          <Link href="/karya" className="rounded-sm border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-4 py-2 text-sm text-[#D4AF37] transition hover:bg-[#D4AF37]/20">Lihat Karya</Link>
          <Link href="/kontak" className="rounded-sm border border-white/15 px-4 py-2 text-sm text-white/80 transition hover:border-white/30 hover:text-white">Diskusikan Project</Link>
        </div>
      </div>
    </main>
  );
}
