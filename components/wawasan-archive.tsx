'use client';

import { useEffect, useMemo, useState, type CSSProperties } from 'react';
import Link from 'next/link';

import { createPortal } from 'react-dom';
import ShareLinkButton from '@/components/share-link-button';
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
  if (kind === 'source' && value === 'project') return 'Dari Proyek';
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function InsightCard({ item, frameColor }: { item: Insight; frameColor?: string }) {
  const insightUrl = `https://eryawanagung.my.id/wawasan/${item.slug}`;
  const teaserCopy = `Check this design insight from eryawanagung.my.id: ${item.title} - ${insightUrl}${item.excerpt ? ` | ${item.excerpt}` : ''}`;
  return (
    <article style={{ '--premium-card-border': frameColor || 'rgba(255, 255, 255, 0.10)' } as CSSProperties} className="premium-card-hover premium-oval-card premium-oval-frame group flex h-full flex-col border border-transparent bg-white/[0.02] transition hover:bg-white/[0.04]">
      {item.cover_image ? <div className="premium-oval-media-top border-b border-white/10"><img src={item.cover_image} alt={item.title} className="aspect-[16/10] w-full object-cover" loading="lazy" decoding="async" onError={(event) => { event.currentTarget.style.display = 'none'; }} /></div> : <div className="premium-oval-media-top aspect-[16/10] border-b border-white/10 bg-gradient-to-br from-[#11100e] via-[#15120b] to-[#0b0a08]" />}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap gap-2 text-[11px] leading-none">
          <span className="rounded-full border border-[#C8A951]/40 bg-[#C8A951]/10 px-3 py-1 font-sans font-semibold text-[#D4AF37]">{toLabel(item.category)}</span>
          <span className="rounded-full border border-white/15 px-3 py-1 font-sans text-white/70">{toLabel(item.content_type)}</span>
          <span className="rounded-full border border-white/15 px-3 py-1 font-sans text-white/70">{toLabel(item.source_type, 'source')}</span>
        </div>
        <h3 className="mt-4 font-sans text-xl font-semibold leading-tight text-white sm:text-2xl">{item.title}</h3>
        <p className="mt-2 line-clamp-3 font-sans text-sm leading-relaxed text-white/65">{item.excerpt || 'Wawasan ini membahas alasan di balik keputusan desain, dampaknya ke pengguna, dan relevansinya untuk bisnis.'}</p>
        <p className="mt-2 line-clamp-2 font-sans text-xs leading-relaxed text-white/52">{teaserCopy}</p>
        <Link href={`/wawasan/${item.slug}`} className="premium-interactive mt-5 inline-flex w-fit items-center gap-2 font-mono text-sm uppercase tracking-[0.12em] text-[#D4AF37] active:translate-y-0 active:scale-[0.98]">
          Baca Wawasan <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}

function FilterChips({ options, value, onSelect, kind }: { options: string[]; value: string; onSelect: (v: string) => void; kind?: 'source' }) {
  return <div className="flex flex-wrap gap-2">{options.map((opt) => <button key={opt} onClick={() => onSelect(opt)} className={`rounded-full border px-3 py-1.5 font-sans text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60 ${value === opt ? 'border-[#D4AF37]/60 bg-[#D4AF37]/10 text-[#D4AF37]' : 'border-white/20 text-white/75 hover:border-white/35'}`}>{toLabel(opt, kind)}</button>)}</div>;
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
  const desktopFilterPanelId = 'wawasan-filter-panel-desktop';
  const mobileFilterPanelId = 'wawasan-filter-panel-mobile';

  const categoryOptions = useMemo(() => [ALL, ...Array.from(new Set(insights.map((i) => i.category).filter(Boolean) as string[]))], [insights]);
  const contentTypeOptions = useMemo(() => [ALL, ...Array.from(new Set(insights.map((i) => i.content_type).filter(Boolean) as string[]))], [insights]);
  const sourceTypeOptions = useMemo(() => [ALL, ...Array.from(new Set(insights.map((i) => i.source_type).filter(Boolean) as string[]))], [insights]);

  const activeFilterCount = [category !== ALL, contentType !== ALL, sourceType !== ALL, sort !== 'terbaru'].filter(Boolean).length;

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

    if (sort === 'judul_az') return items.slice().sort((a, b) => a.title.localeCompare(b.title));
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
    const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && setIsFilterOpen(false);
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
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

  const applyDraft = () => {
    setCategory(draftCategory);
    setContentType(draftContentType);
    setSourceType(draftSourceType);
    setSort(draftSort);
    setIsFilterOpen(false);
  };

  return (
    <section className="reveal-on-scroll mobile-scroll-section mobile-section-breathing mx-auto mt-8 max-w-7xl pb-28 sm:mt-10">
      <div style={{ '--premium-card-border': 'rgba(255, 255, 255, 0.10)' } as CSSProperties} className="premium-oval-card premium-oval-frame relative border border-transparent bg-white/[0.02] p-4 sm:p-5">
        <label htmlFor="wawasan-search" className="mb-2 block font-sans text-xs text-white/70">Cari topik wawasan</label>
        <div className="grid grid-cols-[minmax(0,1fr)_96px] gap-2 sm:gap-3">
          <input id="wawasan-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari topik wawasan..." className="h-11 min-w-0 rounded-2xl border border-white/15 bg-[#080807] px-4 font-sans text-sm text-white placeholder:text-white/40 focus:border-[#C8A951]/50 focus:outline-none" />
          <button type="button" onClick={() => setIsFilterOpen((v) => !v)} aria-expanded={isFilterOpen} aria-controls={desktopFilterPanelId} className="premium-interactive h-11 rounded-2xl border border-[#C8A951]/40 px-2 font-sans text-sm font-semibold text-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/60">
            {activeFilterCount > 0 ? `Filter (${activeFilterCount})` : 'Filter'}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {category !== ALL && <button onClick={() => setCategory(ALL)} className="rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-3 py-1 font-sans text-xs text-[#E2C866]">{toLabel(category)} ×</button>}
          {contentType !== ALL && <button onClick={() => setContentType(ALL)} className="rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-3 py-1 font-sans text-xs text-[#E2C866]">{toLabel(contentType)} ×</button>}
          {sourceType !== ALL && <button onClick={() => setSourceType(ALL)} className="rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-3 py-1 font-sans text-xs text-[#E2C866]">{toLabel(sourceType, 'source')} ×</button>}
          {sort !== 'terbaru' && <button onClick={() => setSort('terbaru')} className="rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-3 py-1 font-sans text-xs text-[#E2C866]">{sort === 'judul_az' ? 'Judul A-Z' : 'Terlama'} ×</button>}
          {activeFilterCount > 0 && <button onClick={resetAll} className="font-sans text-xs text-[#D4AF37] hover:text-[#e5c877]">Reset semua</button>}
          <span className="ml-auto font-sans text-xs text-white/58">{filteredInsights.length} wawasan ditemukan</span>
        </div>

        <div className={`absolute left-4 right-4 top-[calc(100%+8px)] z-40 hidden rounded-2xl border border-white/15 bg-[#11100d] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.45)] ${isFilterOpen ? 'md:block' : 'md:hidden'}`} id={desktopFilterPanelId} role="dialog" aria-label="Filter Wawasan desktop">
          <div className="space-y-3">
            <div><p className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-[0.13em] text-white/55">Topik</p><FilterChips options={categoryOptions} value={draftCategory} onSelect={setDraftCategory} /></div>
            <div><p className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-[0.13em] text-white/55">Jenis Konten</p><FilterChips options={contentTypeOptions} value={draftContentType} onSelect={setDraftContentType} /></div>
            <div><p className="mb-2 font-sans text-[11px] font-semibold uppercase tracking-[0.13em] text-white/55">Sumber</p><FilterChips options={sourceTypeOptions} value={draftSourceType} onSelect={setDraftSourceType} kind="source" /></div>
            <div><label htmlFor="sort-desktop" className="mb-2 block font-sans text-[11px] font-semibold uppercase tracking-[0.13em] text-white/55">Urutkan</label>
              <select id="sort-desktop" value={draftSort} onChange={(e) => setDraftSort(e.target.value as SortType)} className="h-10 w-full rounded-xl border border-white/15 bg-[#090909] px-3 font-sans text-sm text-white/80 focus:border-[#D4AF37]/40 focus:outline-none">
                <option value="terbaru">Terbaru</option><option value="terlama">Terlama</option><option value="judul_az">Judul A-Z</option>
              </select>
            </div>
            <div className="flex items-center justify-between pt-1">
              <button onClick={() => { setDraftCategory(ALL); setDraftContentType(ALL); setDraftSourceType(ALL); setDraftSort('terbaru'); }} className="font-sans text-xs text-white/65 hover:text-white">Reset</button>
              <button onClick={applyDraft} className="rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-4 py-2 font-sans text-xs font-semibold text-[#D4AF37]">Terapkan</button>
            </div>
          </div>
        </div>
      </div>

      {filteredInsights.length === 0 ? (
        <div style={{ '--premium-card-border': 'rgba(255, 255, 255, 0.10)' } as CSSProperties} className="premium-oval-card premium-oval-frame mt-6 border border-transparent bg-white/[0.02] p-8 text-center">
          <p className="font-sans text-white/70">Belum ada wawasan yang cocok dengan pencarian atau filter saat ini. Coba atur ulang filter atau gunakan kata kunci yang lebih umum.</p>
          <button onClick={resetAll} className="premium-interactive mt-4 rounded-xl border border-[#D4AF37]/40 px-4 py-2 font-sans text-sm text-[#D4AF37] active:translate-y-0 active:scale-[0.98]">Atur Ulang Filter</button>
        </div>
      ) : (
        <>
          {featured ? (
            <article style={{ '--reveal-delay': '0ms', '--premium-card-border': 'rgba(200, 169, 81, 0.25)' } as CSSProperties} className="reveal-on-scroll mobile-card-breathing mobile-card-reveal premium-oval-card-lg premium-oval-frame mt-6 border border-transparent bg-gradient-to-b from-[#1a160a] to-[#0c0b08] md:grid md:grid-cols-2">
              {featured.cover_image ? <div className="premium-oval-media"><img src={featured.cover_image} alt={featured.title} className="h-full w-full object-cover" loading="lazy" decoding="async" /></div> : null}
              <div className="p-6 md:p-8">
                <span className="rounded-full border border-[#C8A951]/40 bg-[#C8A951]/10 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.12em] text-[#D4AF37]">{toLabel(featured.category)}</span>
                <h2 className="mt-4 font-sans text-3xl leading-tight">{featured.title}</h2>
                <p className="mt-3 font-sans text-white/70">{featured.excerpt || 'Pilihan wawasan utama untuk membantu Anda mengambil keputusan desain yang lebih tepat.'}</p>
                <Link href={`/wawasan/${featured.slug}`} className="premium-interactive mt-6 inline-flex min-h-11 items-center rounded-full border border-[#D4AF37]/40 px-5 font-mono text-sm uppercase tracking-[0.12em] text-[#D4AF37] active:translate-y-0 active:scale-[0.98]">Baca Wawasan Lengkap</Link>
              </div>
            </article>
          ) : null}
          <div className="mt-8 grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
            {rest.map((item, index) => (
              <div key={item.id} style={{ '--reveal-delay': `${(index + 1) * 90}ms` } as CSSProperties} className="reveal-on-scroll mobile-card-breathing mobile-card-reveal">
                <InsightCard item={item} frameColor="rgba(255, 255, 255, 0.10)" />
              </div>
            ))}
          </div>
        </>
      )}

      {isFilterOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999] md:hidden">
            <button
              aria-label="Tutup filter"
              className="absolute inset-0 bg-black/70"
              onClick={() => setIsFilterOpen(false)}
            />
            <div
              id={mobileFilterPanelId}
              role="dialog"
              aria-modal="true"
              aria-label="Filter Wawasan"
              className="absolute bottom-0 left-0 right-0 mx-auto flex max-h-[78dvh] w-full flex-col rounded-t-[26px] border border-white/10 bg-[#11100d]"
            >
              <div className="sticky top-0 z-10 rounded-t-[26px] border-b border-white/10 bg-[#11100d] px-4 pb-3 pt-2">
                <div className="mx-auto mb-2 h-1 w-10 rounded-full bg-white/25" />
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-sans text-sm font-semibold text-white">Filter Wawasan</h3>
                    <p className="mt-1 font-sans text-xs text-white/58">Pilih topik, jenis konten, sumber, dan urutan wawasan.</p>
                  </div>
                  <button
                    aria-label="Tutup filter wawasan"
                    onClick={() => setIsFilterOpen(false)}
                    className="min-h-10 rounded-full border border-white/20 px-3 font-sans text-xs text-white/80"
                  >
                    Tutup
                  </button>
                </div>
              </div>
              <div className="overflow-y-auto px-4 py-4">
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.13em] text-white/55">Topik</p>
                    <FilterChips options={categoryOptions} value={draftCategory} onSelect={setDraftCategory} />
                  </div>
                  <div>
                    <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.13em] text-white/55">Jenis Konten</p>
                    <FilterChips options={contentTypeOptions} value={draftContentType} onSelect={setDraftContentType} />
                  </div>
                  <div>
                    <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-[0.13em] text-white/55">Sumber</p>
                    <FilterChips options={sourceTypeOptions} value={draftSourceType} onSelect={setDraftSourceType} kind="source" />
                  </div>
                  <div>
                    <label htmlFor="sort-mobile" className="mb-2 block font-sans text-xs font-semibold uppercase tracking-[0.13em] text-white/55">Urutkan</label>
                    <select
                      id="sort-mobile"
                      value={draftSort}
                      onChange={(e) => setDraftSort(e.target.value as SortType)}
                      className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#090909] px-4 py-2 font-sans text-sm text-white/72 outline-none focus:border-[#D4AF37]/40"
                    >
                      <option value="terbaru">Terbaru</option>
                      <option value="terlama">Terlama</option>
                      <option value="judul_az">Judul A-Z</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="sticky bottom-0 mt-auto flex gap-2 border-t border-white/10 bg-[#11100d] px-4 pb-[calc(env(safe-area-inset-bottom)+0.9rem)] pt-3">
                <button
                  onClick={() => {
                    setDraftCategory(ALL);
                    setDraftContentType(ALL);
                    setDraftSourceType(ALL);
                    setDraftSort('terbaru');
                  }}
                  className="min-h-11 flex-1 rounded-full border border-white/20 px-4 py-2 font-sans text-sm font-semibold text-white/80"
                >
                  Reset
                </button>
                <button
                  onClick={applyDraft}
                  className="min-h-11 flex-1 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-4 py-2 font-sans text-sm font-semibold text-[#D4AF37]"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 md:inset-x-auto md:right-6 md:justify-end"><div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/15 bg-[#0B0A08]/90 px-3 py-2 shadow-[0_14px_40px_rgba(0,0,0,0.4)] backdrop-blur"><a href={`https://wa.me/?text=${encodeURIComponent('Saya menemukan beberapa wawasan desain yang menarik untuk dibaca

https://eryawanagung.my.id/wawasan')}`} target="_blank" rel="noreferrer" aria-label="Bagikan daftar wawasan via WhatsApp" className="inline-flex min-h-10 items-center rounded-full border border-[#D4AF37]/55 bg-[#D4AF37]/16 px-4 py-2 font-sans text-sm font-semibold text-[#E2C866] transition hover:bg-[#D4AF37]/22 hover:text-[#F4D987]">WhatsApp</a><ShareLinkButton url="https://eryawanagung.my.id/wawasan" className="inline-flex min-h-10 items-center rounded-full border border-white/20 px-4 py-2 font-sans text-sm font-semibold text-white/78 transition hover:border-[#D4AF37]/40 hover:text-[#D4AF37]" /></div></div>
    </section>
  );
}
