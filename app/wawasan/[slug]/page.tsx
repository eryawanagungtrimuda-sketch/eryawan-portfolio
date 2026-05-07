import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPublishedInsightBySlug } from '@/lib/insights';

export const dynamic = 'force-dynamic';

export default async function WawasanDetailPage({ params }: { params: { slug: string } }) {
  const insight = await getPublishedInsightBySlug(params.slug);
  if (!insight) return notFound();

  return (
    <main className="min-h-screen bg-[#080807] px-5 py-16 text-[#F4F1EA]">
      <Link href="/wawasan">← Kembali ke Wawasan</Link>

      <h1 className="mt-5 text-5xl">{insight.title}</h1>
      <p className="mt-2 text-[#D4AF37]">{insight.category || 'Uncategorized'}</p>

      {insight.cover_image ? (
        <img src={insight.cover_image} alt={insight.title} className="mt-6 max-h-96 w-full object-cover" />
      ) : (
        <div className="mt-6 border border-dashed border-white/15 p-5 text-white/60">Belum ada cover image.</div>
      )}

      <article className="prose prose-invert mt-8 whitespace-pre-wrap">{insight.content || 'Konten wawasan belum tersedia.'}</article>

      <div className="mt-10 flex gap-4">
        <Link href="/kontak">Ke Kontak</Link>
        <Link href="/karya">Lihat Karya</Link>
      </div>
    </main>
  );
}
