"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";

import { createPortal } from "react-dom";
import ShareLinkButton from "@/components/share-link-button";
import type { PublicInsightListItem } from "@/lib/insights";

type Props = {
  insights: PublicInsightListItem[];
};

type SortType = "terbaru" | "terlama" | "judul_az";

const ALL = "Semua";
const DESKTOP_FILTER_PANEL_ID = "wawasan-filter-panel-desktop";
const MOBILE_FILTER_SHEET_ID = "wawasan-filter-sheet-mobile";

function normalize(value?: string | null) {
  return (value || "").toLowerCase().trim();
}

const FEATURED_IMAGE_WIDTH = 1600;
const FEATURED_IMAGE_HEIGHT = 1000;

function toLabel(value?: string | null, kind?: "source") {
  if (!value) return ALL;
  if (kind === "source" && value === "project") return "Dari Proyek";
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function InsightCard({
  item,
  frameColor,
}: {
  item: PublicInsightListItem;
  frameColor?: string;
}) {
  const insightUrl = `https://eryawanagung.my.id/wawasan/${item.slug}`;
  const teaserCopy = `Check this design insight from eryawanagung.my.id: ${item.title} - ${insightUrl}${item.excerpt ? ` | ${item.excerpt}` : ""}`;
  return (
    <article
      style={
        {
          "--premium-card-border": frameColor || "rgba(255, 255, 255, 0.10)",
        } as CSSProperties
      }
      className="premium-card-hover premium-oval-card premium-oval-frame group flex h-full flex-col border border-transparent bg-white/[0.018] transition motion-safe:duration-500 motion-safe:ease-out hover:bg-white/[0.035]"
    >
      {item.cover_image ? (
        <div className="premium-oval-media-top border-b border-white/10">
          <img
            src={item.cover_image}
            alt={item.title}
            width={1600}
            height={1000}
            className="aspect-[16/10] w-full object-cover"
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </div>
      ) : (
        <div className="premium-oval-media-top aspect-[16/10] border-b border-white/10 bg-gradient-to-br from-[#11100e] via-[#15120b] to-[#0b0a08]" />
      )}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap gap-2 text-[10px] leading-none">
          <span className="rounded-full border border-[#C8A951]/30 bg-[#C8A951]/10 px-3 py-1.5 font-mono uppercase tracking-[0.14em] text-[#D4AF37]/90">
            {toLabel(item.category)}
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1.5 font-mono uppercase tracking-[0.14em] text-white/50">
            {toLabel(item.content_type)}
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1.5 font-mono uppercase tracking-[0.14em] text-white/50">
            {toLabel(item.source_type, "source")}
          </span>
        </div>
        <h3 className="mt-5 font-display text-xl font-normal leading-[1.18] tracking-[-0.02em] text-white sm:text-[1.55rem]">
          {item.title}
        </h3>
        <p className="mt-3 line-clamp-3 font-sans text-sm leading-[1.75] text-white/60">
          {item.excerpt ||
            "Wawasan ini membahas alasan di balik keputusan desain, dampaknya ke pengguna, dan relevansinya untuk bisnis."}
        </p>
        {/* Social teaser micro-copy for faster share-friendly storytelling without changing core card hierarchy. */}
        <p className="mt-3 line-clamp-2 border-t border-white/[0.07] pt-3 font-sans text-xs leading-relaxed text-white/40">
          {teaserCopy}
        </p>
        <Link
          href={`/wawasan/${item.slug}`}
          className="premium-interactive mt-5 inline-flex w-fit items-center gap-2 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#D4AF37] active:translate-y-0 active:scale-[0.98]"
        >
          Lanjut Membaca <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}

export default function WawasanArchive({ insights }: Props) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL);
  const [contentType, setContentType] = useState(ALL);
  const [sourceType, setSourceType] = useState(ALL);
  const [sort, setSort] = useState<SortType>("terbaru");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [draftCategory, setDraftCategory] = useState(ALL);
  const [draftContentType, setDraftContentType] = useState(ALL);
  const [draftSourceType, setDraftSourceType] = useState(ALL);
  const [draftSort, setDraftSort] = useState<SortType>("terbaru");

  const categoryOptions = useMemo(
    () => [
      ALL,
      ...Array.from(
        new Set(insights.map((i) => i.category).filter(Boolean) as string[]),
      ),
    ],
    [insights],
  );
  const contentTypeOptions = useMemo(
    () => [
      ALL,
      ...Array.from(
        new Set(
          insights.map((i) => i.content_type).filter(Boolean) as string[],
        ),
      ),
    ],
    [insights],
  );
  const sourceTypeOptions = useMemo(
    () => [
      ALL,
      ...Array.from(
        new Set(insights.map((i) => i.source_type).filter(Boolean) as string[]),
      ),
    ],
    [insights],
  );

  const activeFilterCount = [
    category !== ALL,
    contentType !== ALL,
    sourceType !== ALL,
  ].filter(Boolean).length;

  const filteredInsights = useMemo(() => {
    const q = normalize(search);
    const items = insights.filter((item) => {
      const matchesSearch =
        !q ||
        [
          item.title,
          item.excerpt,
          item.category,
          item.content_type,
          item.source_type,
        ].some((v) => normalize(v).includes(q));
      if (!matchesSearch) return false;
      if (category !== ALL && item.category !== category) return false;
      if (contentType !== ALL && item.content_type !== contentType)
        return false;
      if (sourceType !== ALL && item.source_type !== sourceType) return false;
      return true;
    });

    if (sort === "judul_az") {
      return items.slice().sort((a, b) => a.title.localeCompare(b.title));
    }
    if (sort === "terlama") {
      if (items.every((i) => i.created_at))
        return items
          .slice()
          .sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
      return items.slice().reverse();
    }
    if (items.every((i) => i.created_at))
      return items
        .slice()
        .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    return items;
  }, [insights, search, category, contentType, sourceType, sort]);

  useEffect(() => {
    if (!isFilterOpen) return;
    setDraftCategory(category);
    setDraftContentType(contentType);
    setDraftSourceType(sourceType);
    setDraftSort(sort);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onEsc = (e: KeyboardEvent) =>
      e.key === "Escape" && setIsFilterOpen(false);
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onEsc);
    };
  }, [isFilterOpen, category, contentType, sourceType, sort]);

  const featured = filteredInsights[0];
  const rest = filteredInsights.slice(1);

  const resetDraftFilters = () => {
    setDraftCategory(ALL);
    setDraftContentType(ALL);
    setDraftSourceType(ALL);
    setDraftSort("terbaru");
  };

  const applyDraftFilters = () => {
    setCategory(draftCategory);
    setContentType(draftContentType);
    setSourceType(draftSourceType);
    setSort(draftSort);
    setIsFilterOpen(false);
  };

  const renderActiveFilterChips = () => (
    <>
      {category !== ALL && (
        <button
          onClick={() => setCategory(ALL)}
          className="rounded-full border border-white/15 bg-white/[0.02] px-3 py-1.5 font-sans text-xs text-white/70 transition hover:border-[#D4AF37]/35 hover:text-[#D4AF37]"
        >
          {toLabel(category)} ×
        </button>
      )}
      {contentType !== ALL && (
        <button
          onClick={() => setContentType(ALL)}
          className="rounded-full border border-white/15 bg-white/[0.02] px-3 py-1.5 font-sans text-xs text-white/70 transition hover:border-[#D4AF37]/35 hover:text-[#D4AF37]"
        >
          {toLabel(contentType)} ×
        </button>
      )}
      {sourceType !== ALL && (
        <button
          onClick={() => setSourceType(ALL)}
          className="rounded-full border border-white/15 bg-white/[0.02] px-3 py-1.5 font-sans text-xs text-white/70 transition hover:border-[#D4AF37]/35 hover:text-[#D4AF37]"
        >
          {toLabel(sourceType, "source")} ×
        </button>
      )}
    </>
  );

  const renderFilterGroups = () => (
    <>
      {[
        ["Topik", categoryOptions, draftCategory, setDraftCategory, undefined],
        [
          "Jenis Konten",
          contentTypeOptions,
          draftContentType,
          setDraftContentType,
          undefined,
        ],
        [
          "Sumber",
          sourceTypeOptions,
          draftSourceType,
          setDraftSourceType,
          "source",
        ],
      ].map(([label, options, value, setter, kind]) => (
        <div key={label as string} className="mb-4 last:mb-0">
          <p className="mb-3 font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#D4AF37]/85">
            {label as string}
          </p>
          <div className="flex flex-wrap gap-2">
            {(options as string[]).map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => (setter as (v: string) => void)(opt)}
                className={`min-h-10 rounded-full border px-3.5 py-2 font-sans text-xs font-semibold transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50 ${(value as string) === opt ? "border-[#D4AF37]/50 bg-[#D4AF37]/10 text-[#D4AF37]" : "border-white/15 bg-white/[0.02] text-white/62 hover:border-white/25 hover:text-white/78"}`}
              >
                {toLabel(opt, kind as "source")}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="mt-4">
        <label
          htmlFor="wawasan-sort"
          className="mb-3 block font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#D4AF37]/85"
        >
          Urutkan
        </label>
        <select
          id="wawasan-sort"
          value={draftSort}
          onChange={(e) => setDraftSort(e.target.value as SortType)}
          className="min-h-11 w-full rounded-2xl border border-white/15 bg-[#090909] px-4 py-2 font-sans text-sm text-white/74 outline-none focus:border-[#D4AF37]/50"
        >
          <option value="terbaru">Terbaru</option>
          <option value="terlama">Terlama</option>
          <option value="judul_az">Judul A-Z</option>
        </select>
      </div>
    </>
  );

  const resetAll = () => {
    setSearch("");
    setCategory(ALL);
    setContentType(ALL);
    setSourceType(ALL);
    setSort("terbaru");
  };

  return (
    <section className="mobile-scroll-section mobile-section-breathing mx-auto mt-2 max-w-7xl pb-28 sm:mt-4">
      <div
        style={
          {
            "--premium-card-border": "rgba(255, 255, 255, 0.10)",
          } as CSSProperties
        }
        className="premium-oval-card premium-oval-frame border border-transparent bg-white/[0.018] p-5 shadow-[0_22px_70px_rgba(0,0,0,0.22)] sm:p-6"
      >
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#D4AF37]">
              Arsip Wawasan
            </p>
            <label
              htmlFor="wawasan-search"
              className="mt-2 block font-display text-xl font-normal tracking-[-0.02em] text-white sm:text-2xl"
            >
              Temukan catatan desain
            </label>
          </div>
          <span className="font-sans text-xs text-white/50">
            {filteredInsights.length} wawasan ditemukan
          </span>
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_84px] gap-3 sm:grid-cols-[minmax(0,1fr)_112px]">
          <input
            id="wawasan-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari topik, sumber, atau keputusan desain..."
            className="h-12 min-w-0 rounded-2xl border border-white/10 bg-[#080807] px-4 font-sans text-sm text-white placeholder:text-white/35 focus:border-[#C8A951]/50 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            aria-expanded={isFilterOpen}
            className="premium-interactive flex h-12 w-full items-center justify-center rounded-2xl border border-[#C8A951]/35 bg-[#C8A951]/5 px-0 font-sans text-sm font-semibold text-[#D4AF37] active:translate-y-0 active:scale-[0.98]"
          >
            Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {renderActiveFilterChips()}
          {activeFilterCount > 0 && (
            <button
              onClick={resetAll}
              className="font-sans text-xs font-semibold text-[#D4AF37] transition hover:text-[#F4D987]"
            >
              Reset semua
            </button>
          )}
        </div>
      </div>

      {filteredInsights.length === 0 ? (
        <div
          style={
            {
              "--premium-card-border": "rgba(255, 255, 255, 0.10)",
            } as CSSProperties
          }
          className="premium-oval-card premium-oval-frame mt-6 border border-transparent bg-white/[0.018] p-8 text-center sm:p-10"
        >
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">
            Catatan Keputusan Desain
          </p>
          <h2 className="mt-4 font-display text-2xl font-normal tracking-[-0.02em] text-white">
            Arsip wawasan sedang dikurasi.
          </h2>
          <p className="mx-auto mt-3 max-w-xl font-sans text-sm leading-7 text-white/58">
            Belum ada catatan yang cocok dengan pencarian ini. Beberapa catatan
            desain sedang disiapkan; coba atur ulang filter atau gunakan kata
            kunci yang lebih umum.
          </p>
          <button
            onClick={resetAll}
            className="premium-interactive mt-5 rounded-full border border-[#D4AF37]/40 px-5 py-2.5 font-sans text-sm font-semibold text-[#D4AF37] active:translate-y-0 active:scale-[0.98]"
          >
            Atur Ulang Filter
          </button>
        </div>
      ) : (
        <>
          {featured ? (
            <article
              style={
                {
                  "--premium-card-border": "rgba(200, 169, 81, 0.25)",
                } as CSSProperties
              }
              className="mobile-card-breathing premium-oval-card-lg premium-oval-frame mt-7 overflow-hidden border border-transparent bg-gradient-to-br from-[#1a160a] via-[#100f0c] to-[#080807] shadow-[0_30px_100px_rgba(0,0,0,0.28)] md:grid md:grid-cols-[1.08fr_0.92fr]"
            >
              {featured.cover_image ? (
                <div className="premium-oval-media aspect-[16/10] md:aspect-auto">
                  <img
                    src={featured.cover_image}
                    alt={featured.title}
                    width={FEATURED_IMAGE_WIDTH}
                    height={FEATURED_IMAGE_HEIGHT}
                    className="h-full w-full object-cover"
                    loading="eager"
                    fetchPriority="high"
                    decoding="async"
                  />
                </div>
              ) : null}
              <div className="flex flex-col justify-center p-6 sm:p-7 md:p-10 lg:p-12">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-[#C8A951]/40 bg-[#C8A951]/10 px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#D4AF37]">
                    Wawasan Utama
                  </span>
                  <span className="rounded-full border border-white/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/52">
                    {toLabel(featured.category)}
                  </span>
                </div>
                <h2 className="mt-6 font-display text-[2rem] font-normal leading-[1.08] tracking-[-0.035em] text-white sm:text-[2.4rem] md:text-5xl">
                  {featured.title}
                </h2>
                <p className="mt-5 max-w-xl font-sans text-sm leading-[1.85] text-white/64 sm:text-base">
                  {featured.excerpt ||
                    "Pilihan wawasan utama untuk membantu Anda mengambil keputusan desain yang lebih tepat."}
                </p>
                <Link
                  href={`/wawasan/${featured.slug}`}
                  className="premium-interactive mt-7 inline-flex min-h-11 w-fit items-center rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/5 px-5 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#D4AF37] active:translate-y-0 active:scale-[0.98]"
                >
                  Baca Catatan Lengkap
                </Link>
              </div>
            </article>
          ) : null}

          <div className="mt-8 grid gap-5 sm:gap-6 md:grid-cols-2 xl:grid-cols-3">
            {rest.map((item, index) => (
              <div
                key={item.id}
                style={
                  { "--reveal-delay": `${Math.min((index + 1) * 90, 450)}ms` } as CSSProperties
                }
                className="reveal-on-scroll mobile-card-breathing mobile-card-reveal"
              >
                <InsightCard
                  item={item}
                  frameColor="rgba(255, 255, 255, 0.10)"
                />
              </div>
            ))}
          </div>
        </>
      )}

      {isFilterOpen &&
        createPortal(
          <div className="fixed inset-0 z-[9999]">
            <button
              aria-label="Tutup filter"
              className="absolute inset-0 bg-black/72 backdrop-blur-sm"
              onClick={() => setIsFilterOpen(false)}
            />
            <div
              id={DESKTOP_FILTER_PANEL_ID}
              role="dialog"
              aria-modal="true"
              className="absolute right-6 top-[120px] hidden w-[420px] max-w-[calc(100vw-3rem)] overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#11100d]/95 p-5 shadow-[0_24px_64px_rgba(0,0,0,0.55)] backdrop-blur md:block"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-lg font-normal text-white">
                  Kurasi Arsip
                </h3>
                <button
                  type="button"
                  aria-label="Tutup panel filter desktop"
                  onClick={() => setIsFilterOpen(false)}
                  className="rounded-full border border-white/15 px-3 py-1.5 font-sans text-xs text-white/66 transition hover:border-white/28 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50"
                >
                  Tutup
                </button>
              </div>
              {renderFilterGroups()}
              <div className="mt-4 flex gap-2 border-t border-white/10 pt-3">
                <button
                  type="button"
                  onClick={resetDraftFilters}
                  className="min-h-10 flex-1 rounded-full border border-white/15 px-4 py-2 font-sans text-sm font-semibold text-white/72 transition hover:border-white/28 hover:text-white"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={applyDraftFilters}
                  className="min-h-10 flex-1 rounded-full border border-[#D4AF37]/45 bg-[#D4AF37]/10 px-4 py-2 font-sans text-sm font-semibold text-[#D4AF37] transition hover:bg-[#D4AF37]/16"
                >
                  Terapkan
                </button>
              </div>
            </div>
            <div
              id={MOBILE_FILTER_SHEET_ID}
              role="dialog"
              aria-modal="true"
              className="absolute bottom-0 left-0 right-0 flex max-h-[80vh] flex-col overflow-hidden rounded-t-[28px] border border-white/10 bg-[#11100d]/98 p-5 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-[0_-24px_80px_rgba(0,0,0,0.45)] md:hidden"
            >
              <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-white/30" />
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-display text-xl font-normal text-white">
                  Kurasi Arsip
                </h3>
                <button
                  type="button"
                  aria-label="Tutup filter mobile"
                  onClick={() => setIsFilterOpen(false)}
                  className="rounded-full border border-white/20 px-3 py-1 font-sans text-xs text-white/70"
                >
                  Tutup
                </button>
              </div>
              <p className="mb-4 font-sans text-xs leading-6 text-white/55">
                Pilih topik, jenis konten, sumber, dan urutan agar arsip wawasan
                lebih mudah dibaca.
              </p>
              <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                {renderFilterGroups()}
              </div>
              <div className="mt-4 flex gap-2 border-t border-white/10 bg-[#11100d] pt-3">
                <button
                  type="button"
                  onClick={resetDraftFilters}
                  className="min-h-11 flex-1 rounded-full border border-white/20 px-4 py-2 font-sans text-sm font-semibold text-white/80 transition active:scale-[0.98]"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={applyDraftFilters}
                  className="min-h-11 flex-1 rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-4 py-2 font-sans text-sm font-semibold text-[#D4AF37] transition active:scale-[0.98]"
                >
                  Terapkan
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 md:inset-x-auto md:right-6 md:justify-end">
        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/15 bg-[#0B0A08]/90 px-3 py-2 shadow-[0_14px_40px_rgba(0,0,0,0.4)] backdrop-blur">
          <a
            href={`https://wa.me/?text=${encodeURIComponent("Saya menemukan beberapa wawasan desain yang menarik untuk dibaca\n\nhttps://eryawanagung.my.id/wawasan")}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Bagikan daftar wawasan via WhatsApp"
            className="inline-flex min-h-10 items-center rounded-full border border-[#D4AF37]/55 bg-[#D4AF37]/16 px-4 py-2 font-sans text-sm font-semibold text-[#E2C866] transition hover:bg-[#D4AF37]/22 hover:text-[#F4D987]"
          >
            WhatsApp
          </a>
          <ShareLinkButton
            url="https://eryawanagung.my.id/wawasan"
            className="inline-flex min-h-10 items-center rounded-full border border-white/20 px-4 py-2 font-sans text-sm font-semibold text-white/78 transition hover:border-[#D4AF37]/40 hover:text-[#D4AF37]"
          />
        </div>
      </div>
    </section>
  );
}
