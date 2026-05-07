import Link from 'next/link';
import { getPublishedInsights } from '@/lib/insights';

export default async function WawasanPage() {
  const insights = await getPublishedInsights();
  return <main className="min-h-screen bg-[#080807] px-5 py-16 text-[#F4F1EA]"><h1 className="text-5xl">Wawasan Desain</h1><p className="mt-4 text-white/70">Catatan strategi dan pembelajaran desain.</p>
  {insights.length===0 ? <div className="mt-10 border border-white/10 p-8 text-white/60">Belum ada wawasan dipublikasikan.</div> : <div className="mt-10 grid gap-4 md:grid-cols-2">{insights.map((item)=><article key={item.id} className="border border-white/10 p-5"><p className="text-xs text-[#D4AF37]">{item.category || 'Uncategorized'}</p><h2 className="text-2xl mt-2">{item.title}</h2><p className="text-white/65 mt-2">{item.excerpt}</p><Link className="mt-4 inline-block text-[#D4AF37]" href={`/wawasan/${item.slug}`}>Baca Wawasan</Link></article>)}</div>}
  </main>;
}
