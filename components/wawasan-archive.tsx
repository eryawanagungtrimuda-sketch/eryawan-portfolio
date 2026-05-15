'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { createPortal } from 'react-dom';
import type { Insight } from '@/lib/types';

type Props = {
  insights: Insight[];
};

type SortType = 'terbaru' | 'terlama' | 'judul_az';

const ALL = 'Semua';

function normalize(value?: string | null) {
  return (value || '').toLowerCase().trim();
}

function toLabel(value?: string | null, kind?: 'source') {
  if (!value) return ALL;
  if (kind === 'source' && value === 'project') return 'Dari Project';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function InsightCard({ item }: { item: Insight }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition hover:border-[#C8A951]/30 hover:bg-white/[0.04]">
      {item.cover_image ? <img src={item.cover_image} alt={item.title} className="aspect-[16/10] w-full object-cover" /> : null}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap gap-2 text-[11px]">
          <span className="rounded-full border border-[#C8A951]/40 bg-[#C8A951]/10 px-3 py-1 font-sans font-semibold text-[#D4AF37]">{toLabel(item.category)}</span>
          <span className="rounded-full border border-white/15 px-3 py-1 font-sans text-white/70">{toLabel(item.content_type)}</span>
          <span className="rounded-full border border-white/15 px-3 py-1 font-sans text-white/70">{toLabel(item.source_type, 'source')}</span>
        </div>
        <h3 className="mt-3 font-display text-2xl leading-tight text-white">{item.title}</h3>
        <p className="mt-2 line-clamp-3 font-sans text-sm text-white/65">{item.excerpt || 'Wawasan ini mengulas strategi desain dan pertimbangan ruang dari sudut pandang editorial.'}</p>
        <Link href={`/wawasan/${item.slug}`} className="mt-5 inline-flex w-fit items-center gap-2 font-mono text-sm uppercase tracking-[0.12em] text-[#D4AF37]">
          Baca Wawasan <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}

export default function WawasanArchive({ insights }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(ALL);
  const [contentType, setContentType] = useState(ALL);
  const [sourceType, setSourceType] = useState(ALL);
  const [sort, setSort] = useState<SortType>('terbaru');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [draftCategory, setDraftCategory] = useState(ALL);
  const [draftContentType, setDraftContentType] = useState(ALL);
  const [draftSourceType, setDraftSourceType] = useState(ALL);
  const [draftSort, setDraftSort] = useState<SortType>('terbaru');

  const categoryOptions = useMemo(() => [ALL, ...Array.from(new Set(insights.map((i) => i.category).filter(Boolean) as string[]))], [insights]);
  const contentTypeOptions = useMemo(() => [ALL, ...Array.from(new Set(insights.map((i) => i.content_type).filter(Boolean) as string[]))], [insights]);
  const sourceTypeOptions = useMemo(() => [ALL, ...Array.from(new Set(insights.map((i) => i.source_type).filter(Boolean) as string[]))], [insights]);

  const activeFilterCount = [category !== ALL, contentType !== ALL, sourceType !== ALL].filter(Boolean).length;

  const filteredInsights = useMemo(() => {
    const q = normalize(search);
    const items = insights.filter((item) => {
      const matchesSearch = !q || [item.title, item.excerpt, item.category, item.content_type, item.source_type].some((v) => normalize(v).includes(q));
      if (!matchesSearch) return false;
      if (category !== ALL && item.category !== category) return false;
      if (contentType !== ALL && item.content_type !== contentType) return false;
      if (sourceType !== ALL && item.source_type !== sourceType) return false;
      return true;
    });

    if (sort === 'judul_az') {
      return items.slice().sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sort === 'terlama') {
      if (items.every((i) => i.created_at)) return items.slice().sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
      return items.slice().reverse();
    }
    if (items.every((i) => i.created_at)) return items.slice().sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    return items;
  }, [insights, search, category, contentType, sourceType, sort]);

  useEffect(() => {
    if (!isFilterOpen) return;
    setDraftCategory(category);
    setDraftContentType(contentType);
    setDraftSourceType(sourceType);
    setDraftSort(sort);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setIsFilterOpen(false);
    window.addEventListener('keydown', onEsc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onEsc);
    };
  }, [isFilterOpen, category, contentType, sourceType, sort]);

  const featured = filteredInsights[0];
  const rest = filteredInsights.slice(1);

  const resetAll = () => {
    setSearch('');
    setCategory(ALL);
    setContentType(ALL);
    setSourceType(ALL);
    setSort('terbaru');
  };

  return (
    <section className="reveal-on-scroll mx-auto mt-8 max-w-7xl sm:mt-10">
      <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-4 sm:p-5">
        <label htmlFor="wawasan-search" className="mb-2 block font-sans text-xs text-white/70">Cari wawasan</label>
        <div className="flex gap-2">
          <input id="wawasan-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari wawasan..." className="h-11 flex-1 rounded-2xl border border-white/15 bg-[#080807] px-4 font-sans text-sm text-white placeholder:text-white/40 focus:border-[#C8A951]/50 focus:outline-none" />
          <button type="button" onClick={() => setIsFilterOpen(true)} aria-expanded={isFilterOpen} className="h-11 rounded-2xl border border-[#C8A951]/40 px-4 font-sans text-sm text-[#D4AF37]">
            Filter{activeFilterCount > 0 ? ` ${activeFilterCount}` : ''}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {category !== ALL && <button onClick={() => setCategory(ALL)} className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/80">{toLabel(category)} ×</button>}
          {contentType !== ALL && <button onClick={() => setContentType(ALL)} className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/80">{toLabel(contentType)} ×</button>}
          {sourceType !== ALL && <button onClick={() => setSourceType(ALL)} className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/80">{toLabel(sourceType, 'source')} ×</button>}
          {activeFilterCount > 0 && <button onClick={resetAll} className="text-xs text-[#D4AF37]">Reset semua</button>}
          <span className="ml-auto text-xs text-white/58">{filteredInsights.length} hasil</span>
        </div>
      </div>

      {filteredInsights.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <p className="font-sans text-white/70">Tidak ada wawasan yang sesuai dengan filter ini.</p>
          <button onClick={resetAll} className="mt-4 rounded-xl border border-[#D4AF37]/40 px-4 py-2 text-sm text-[#D4AF37]">Reset Filter</button>
        </div>
      ) : (
        <>
          {featured ? (
            <article className="mt-6 overflow-hidden rounded-3xl border border-[#C8A951]/25 bg-gradient-to-b from-[#1a160a] to-[#0c0b08] md:grid md:grid-cols-2">
              {featured.cover_image ? <img src={featured.cover_image} alt={featured.title} className="h-full w-full object-cover" /> : null}
              <div className="p-6 md:p-8">
                <span className="rounded-full border border-[#C8A951]/40 bg-[#C8A951]/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-[#D4AF37]">{toLabel(featured.category)}</span>
                <h2 className="mt-4 font-display text-3xl leading-tight">{featured.title}</h2>
                <p className="mt-3 font-sans text-white/70">{featured.excerpt || 'Wawasan utama pilihan editorial minggu ini.'}</p>
                <Link href={`/wawasan/${featured.slug}`} className="mt-6 inline-flex min-h-11 items-center rounded-full border border-[#D4AF37]/40 px-5 font-mono text-sm uppercase tracking-[0.12em] text-[#D4AF37]">Baca Wawasan</Link>
              </div>
            </article>
          ) : null}

          <div className="mt-6 grid gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-3">
            {rest.map((item) => <InsightCard key={item.id} item={item} />)}
          </div>
        </>
      )}

      {isFilterOpen && createPortal(
        <div className="fixed inset-0 z-[9999]">
          <button aria-label="Tutup filter" className="absolute inset-0 bg-black/70" onClick={() => setIsFilterOpen(false)} />
          <div role="dialog" aria-modal="true" className="absolute bottom-0 left-0 right-0 max-h-[82dvh] overflow-y-auto rounded-t-[28px] border border-white/10 bg-[#11100d] p-5">
            <button aria-label="Tutup" onClick={() => setIsFilterOpen(false)} className="mb-4 rounded-full border border-white/20 px-3 py-1 text-sm text-white/70">Tutup</button>
            {[
              ['Topik', categoryOptions, draftCategory, setDraftCategory, undefined],
              ['Jenis Konten', contentTypeOptions, draftContentType, setDraftContentType, undefined],
              ['Sumber', sourceTypeOptions, draftSourceType, setDraftSourceType, 'source'],
            ].map(([label, options, value, setter, kind]) => (
              <div key={label as string} className="mb-4">
                <p className="mb-2 font-mono text-xs uppercase tracking-[0.14em] text-white/55">{label as string}</p>
                <div className="flex flex-wrap gap-2">{(options as string[]).map((opt) => <button key={opt} onClick={() => (setter as (v: string) => void)(opt)} className={`rounded-full border px-3 py-1 text-xs ${(value as string) === opt ? 'border-[#D4AF37]/60 bg-[#D4AF37]/10 text-[#D4AF37]' : 'border-white/20 text-white/75'}`}>{toLabel(opt, kind as 'source')}</button>)}</div>
              </div>
            ))}
            <div>
              <label htmlFor="sort" className="mb-2 block font-mono text-xs uppercase tracking-[0.14em] text-white/55">Urutkan</label>
              <select id="sort" value={draftSort} onChange={(e) => setDraftSort(e.target.value as SortType)} className="h-11 w-full rounded-2xl border border-white/15 bg-[#080807] px-3 font-sans text-sm text-white">
                <option value="terbaru">Terbaru</option>
                <option value="terlama">Terlama</option>
                <option value="judul_az">Judul A-Z</option>
              </select>
            </div>
            <div className="sticky bottom-0 mt-6 flex gap-2 border-t border-white/10 bg-[#11100d] pt-4">
              <button onClick={() => { setDraftCategory(ALL); setDraftContentType(ALL); setDraftSourceType(ALL); setDraftSort('terbaru'); }} className="h-11 flex-1 rounded-2xl border border-white/20 text-sm text-white/80">Reset</button>
              <button onClick={() => { setCategory(draftCategory); setContentType(draftContentType); setSourceType(draftSourceType); setSort(draftSort); setIsFilterOpen(false); }} className="h-11 flex-1 rounded-2xl border border-[#D4AF37]/50 bg-[#D4AF37]/10 text-sm text-[#D4AF37]">Terapkan</button>
            </div>
          </div>
        </div>, document.body)}
    </section>
  );
}
