'use client';

import Link from 'next/link';
import { ArrowUpRight, Mail, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import ShareLinkButton from '@/components/share-link-button';
import { dedupeAreaTags, getAreaTagLabel, normalizeAreaTag } from '@/lib/area-tags';
import type { Project, ProjectWithArchiveImages } from '@/lib/types';

type Props = { projects: ProjectWithArchiveImages[] };
type SortOption = 'newest' | 'oldest' | 'year_desc' | 'year_asc' | 'status';

function getProjectDate(project: Project) {
  const time = new Date(project.created_at).getTime();
  return Number.isFinite(time) ? time : 0;
}

function getProjectYear(project: Project) {
  if (typeof project.completion_year === 'number' && Number.isFinite(project.completion_year)) return project.completion_year;
  const year = new Date(project.created_at).getFullYear();
  return Number.isFinite(year) ? year : 0;
}

function normalize(value?: string | null) {
  return (value || '').trim().toLowerCase();
}


const displayLabelMap: Record<string, string> = {
  'Commercial Interior': 'Interior Komersial',
  'Office / Workspace Interior': 'Interior Kantor / Ruang Kerja',
  'Public / Government Interior': 'Interior Publik / Pemerintahan',
  'Residential Interior': 'Interior Residensial',
  Contemporary: 'Kontemporer',
  Minimalist: 'Minimalis',
  Modern: 'Modern',
};


function getDisplayLabel(value?: string | null) {
  const normalized = (value || '').trim();
  if (!normalized) return '';
  return displayLabelMap[normalized] || normalized;
}

function localizeFilterValue(value: string) {
  const map: Record<string, string> = {
    ...displayLabelMap,
    'Concept / Konsep': 'Konsep',
    'Done / Selesai': 'Selesai',
  };
  return map[value] || value;
}

function truncateText(value?: string | null, limit = 150) {
  if (!value) return '';
  if (value.length <= limit) return value;
  return `${value.slice(0, limit).trim()}...`;
}

function uniqueOptions(projects: ProjectWithArchiveImages[], key: keyof Project) {
  const values = projects.map((project) => project[key]);
  const unique = Array.from(new Set(values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0).map((value) => value.trim())));
  return ['Semua', ...unique.sort((a, b) => a.localeCompare(b)).map(localizeFilterValue)];
}

function getProjectFilterAreaTags(project: ProjectWithArchiveImages) {
  const archiveImageTags = (project.archive_images || []).flatMap((image) => image.area_tags || []);
  return dedupeAreaTags([project.area_type, ...(project.area_tags || []), ...archiveImageTags]);
}

function limitedAreaTags(project: ProjectWithArchiveImages, max = 2) {
  const category = normalize(project.category || project.design_category);
  const tags = getProjectFilterAreaTags(project).filter((tag) => normalize(tag) !== category);
  return {
    visible: tags.slice(0, max),
    overflow: Math.max(tags.length - max, 0),
  };
}

function getProjectTeaser(project: Project) {
  const projectTeaser = project.problem || project.solution || project.impact || project.dampak;
  if (projectTeaser?.trim()) return projectTeaser.trim();
  return `Dari brief awal sampai detail akhir, ${project.title} memperlihatkan bagaimana desain interior yang terarah mampu membentuk pengalaman ruang yang lebih hangat dan berkarakter.`;
}

function getProjectStatus(project: Project) {
  if (project.project_status === 'selesai') return 'Selesai';
  if (project.project_status === 'berjalan') return 'Berjalan';
  if (project.project_status === 'konsep') return 'Konsep';
  return project.impact?.trim() || project.dampak?.trim() ? 'Selesai' : 'Konsep';
}

function getProjectArchiveThumbnail(project: ProjectWithArchiveImages, selectedAreaTags: string[]) {
  const coverFallback = {
    imageUrl: project.cover_image,
    altText: project.title,
    matchedAreaTag: null as string | null,
    isFilterMatchedImage: false,
  };

  if (selectedAreaTags.length === 0) return coverFallback;

  const normalizedSelectedTags = selectedAreaTags
    .map((tag) => ({ raw: getAreaTagLabel(tag), normalized: normalizeAreaTag(tag) }))
    .filter((tag) => tag.normalized.length > 0);

  if (normalizedSelectedTags.length === 0) return coverFallback;

  const matchedImage = (project.archive_images || []).find((image) => {
    if (!image.image_url) return false;
    const imageTags = (image.area_tags || []).map((tag) => normalizeAreaTag(tag)).filter(Boolean);
    return imageTags.some((imageTag) => normalizedSelectedTags.some((selectedTag) => selectedTag.normalized === imageTag));
  });

  if (!matchedImage?.image_url) return coverFallback;

  const imageTags = (matchedImage.area_tags || []).map((tag) => normalizeAreaTag(tag)).filter(Boolean);
  const matchedAreaTag = normalizedSelectedTags.find((selectedTag) => imageTags.includes(selectedTag.normalized))?.raw || null;

  return {
    imageUrl: matchedImage.image_url,
    altText: matchedImage.alt_text?.trim() || project.title,
    matchedAreaTag,
    isFilterMatchedImage: true,
  };
}

function FilterChips({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <p className="mb-3 font-sans text-[10px] font-black uppercase tracking-[0.24em] text-[#C8A951]">{label}</p>
      <div className="flex flex-wrap gap-2.5">
        {options.map((item) => {
          const active = item === value;
          return (
            <button key={item} type="button" onClick={() => onChange(item)} className={`min-h-11 rounded-[999px] border px-3.5 py-2 font-sans text-[10px] font-black uppercase tracking-[0.14em] transition-all motion-safe:duration-500 motion-safe:ease-out ${
              active ? 'border-[#D4AF37]/45 bg-[#D4AF37]/10 text-[#D4AF37]' : 'border-white/5 text-white/50  hover:border-[#D4AF37]/28 hover:text-[#D4AF37] hover:bg-white/[0.035]'
            }`}>
              {item}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Badge({ children }: { children?: string | null }) {
  if (!children) return null;
  return <span className="rounded-full border border-white/8 bg-white/[0.02] px-3 py-1 font-sans text-[11px] font-semibold text-white/65">{children}</span>;
}

export default function KaryaArchive({ projects }: Props) {
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'hello@eryawanagung.my.id';
  const shareBase = 'https://eryawanagung.my.id';
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Semua');
  const [designCategory, setDesignCategory] = useState('Semua');
  const [designStyle, setDesignStyle] = useState('Semua');
  const [selectedAreaTags, setSelectedAreaTags] = useState<string[]>([]);
  const [projectStatus, setProjectStatus] = useState('Semua');
  const [sort, setSort] = useState<SortOption>('newest');
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const hasSearchQuery = search.trim().length > 0;

  const areaTagOptions = useMemo(() => {
    return dedupeAreaTags(projects.flatMap((project) => [
      project.area_type,
      ...(project.area_tags || []),
      ...((project.archive_images || []).flatMap((image) => image.area_tags || [])),
    ]));
  }, [projects]);

  const filterOptions = useMemo(() => ({
    category: uniqueOptions(projects, 'category'),
    designCategory: uniqueOptions(projects, 'design_category'),
    designStyle: uniqueOptions(projects, 'design_style'),
    status: ['Semua', 'Selesai', 'Berjalan', 'Konsep'],
  }), [projects]);

  const filteredProjects = useMemo(() => {
    const query = normalize(search);

    return projects
      .filter((project) => {
        const projectTags = getProjectFilterAreaTags(project);
        const archiveImageTags = (project.archive_images || []).flatMap((image) => image.area_tags || []);
        const canonicalArchiveTags = dedupeAreaTags(archiveImageTags);
        const searchFields = [
          project.title,
          project.category,
          project.design_category,
          project.design_style,
          project.area_type,
          ...(project.area_tags || []),
          ...archiveImageTags,
          ...canonicalArchiveTags,
          project.problem,
          project.solution,
          project.impact,
        ].map(normalize).join(' ');

        const matchesSearch = !query || searchFields.includes(query);
        const matchesCategory = category === 'Semua' || normalize(localizeFilterValue(project.category || '')) === normalize(category);
        const matchesDesignCategory = designCategory === 'Semua' || normalize(localizeFilterValue(project.design_category || '')) === normalize(designCategory);
        const matchesDesignStyle = designStyle === 'Semua' || normalize(localizeFilterValue(project.design_style || '')) === normalize(designStyle);
        const projectTagKeys = projectTags.map((tag) => normalizeAreaTag(tag)).filter(Boolean);
        const selectedTagKeys = selectedAreaTags.map((tag) => normalizeAreaTag(tag)).filter(Boolean);
        const matchesAreaTags = selectedTagKeys.length === 0 || selectedTagKeys.some((selected) => projectTagKeys.includes(selected));
        const matchesStatus = projectStatus === 'Semua' || normalize(getProjectStatus(project)) === normalize(projectStatus);
        return matchesSearch && matchesCategory && matchesDesignCategory && matchesDesignStyle && matchesAreaTags && matchesStatus;
      })
      .sort((a, b) => {
        if (selectedAreaTags.length > 0) {
          const aMatched = getProjectArchiveThumbnail(a, selectedAreaTags).isFilterMatchedImage ? 1 : 0;
          const bMatched = getProjectArchiveThumbnail(b, selectedAreaTags).isFilterMatchedImage ? 1 : 0;
          if (aMatched !== bMatched) return bMatched - aMatched;
        }
        if (sort === 'year_desc') return getProjectYear(b) - getProjectYear(a);
        if (sort === 'year_asc') return getProjectYear(a) - getProjectYear(b);
        if (sort === 'status') return getProjectStatus(a).localeCompare(getProjectStatus(b));
        if (sort === 'oldest') return getProjectDate(a) - getProjectDate(b);
        return getProjectDate(b) - getProjectDate(a);
      });
  }, [category, designCategory, designStyle, projectStatus, projects, search, selectedAreaTags, sort]);

  const activeFilters = [
    category !== 'Semua' ? `Kategori Proyek: ${category}` : null,
    designCategory !== 'Semua' ? `Kategori Desain: ${designCategory}` : null,
    designStyle !== 'Semua' ? `Gaya: ${designStyle}` : null,
    projectStatus !== 'Semua' ? `Status: ${projectStatus}` : null,
    ...selectedAreaTags,
    search.trim() ? `Cari: ${search.trim()}` : null,
  ].filter(Boolean) as string[];
  const activeFilterCount = [
    category !== 'Semua',
    designCategory !== 'Semua',
    designStyle !== 'Semua',
    projectStatus !== 'Semua',
  ].filter(Boolean).length + selectedAreaTags.length;

  const mobileActiveChips = [
    category !== 'Semua' ? { key: 'category', label: category, onRemove: () => setCategory('Semua') } : null,
    designCategory !== 'Semua' ? { key: 'designCategory', label: designCategory, onRemove: () => setDesignCategory('Semua') } : null,
    designStyle !== 'Semua' ? { key: 'designStyle', label: designStyle, onRemove: () => setDesignStyle('Semua') } : null,
    projectStatus !== 'Semua' ? { key: 'status', label: projectStatus, onRemove: () => setProjectStatus('Semua') } : null,
    ...selectedAreaTags.map((tag) => ({ key: `area-${tag}`, label: tag, onRemove: () => setSelectedAreaTags((prev) => prev.filter((item) => item !== tag)) })),
  ].filter(Boolean) as { key: string; label: string; onRemove: () => void }[];

  const resetFilters = () => {
    setSearch('');
    setCategory('Semua');
    setDesignCategory('Semua');
    setDesignStyle('Semua');
    setProjectStatus('Semua');
    setSelectedAreaTags([]);
    setSort('newest');
  };

  const getProjectShareCopy = (project: Project) => {
    const projectUrl = `${shareBase}/karya/${project.slug}`;
    const teaser = truncateText(getProjectTeaser(project), 110);
    // Prefilled social copy combines title + canonical URL + teaser for quick sharing.
    return `Check this design insight from eryawanagung.my.id: ${project.title} - ${projectUrl}${teaser ? ` | ${teaser}` : ''}`;
  };

  const openMobileFilter = () => setIsMobileFilterOpen(true);
  const closeMobileFilter = () => setIsMobileFilterOpen(false);

  const handleMobilePrimaryAction = () => {
    if (hasSearchQuery) {
      searchInputRef.current?.blur();
      resultsRef.current?.scrollIntoView({
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        block: 'start',
      });
      return;
    }

    openMobileFilter();
  };

  const handleClearSearch = () => {
    setSearch('');
    searchInputRef.current?.focus();
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isMobileFilterOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isMobileFilterOpen]);

  useEffect(() => {
    if (!isMobileFilterOpen) return;

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMobileFilter();
    };

    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, [isMobileFilterOpen]);

  useEffect(() => {
    const container = resultsRef.current;
    if (!container) return;

    const revealNodes = container.querySelectorAll<HTMLElement>('.reveal-on-scroll');
    revealNodes.forEach((node) => node.classList.add('is-visible'));
  }, [filteredProjects]);

  const mobileFilterSheet = isMobileFilterOpen ? (
    <div className="fixed inset-0 z-[9999] lg:hidden" onClick={closeMobileFilter}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        id="karya-mobile-filter-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Filter Karya"
        className="absolute inset-x-0 bottom-0 max-h-[82dvh] overflow-y-auto rounded-t-[28px] border border-white/10 bg-[#0B0B0A] p-5 pb-24 font-sans shadow-[0_-24px_80px_rgba(0,0,0,0.55)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-white/20" />
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-sans text-lg font-semibold text-white">Filter Karya</h2>
            <p className="mt-1 text-sm text-white/58">Pilih filter agar Anda lebih cepat menemukan karya yang relevan.</p>
          </div>
          <button type="button" aria-label="Tutup panel filter" onClick={closeMobileFilter} className="rounded-full border border-white/15 p-2 text-white/80">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-5">
          <FilterChips label="Kategori Proyek" options={filterOptions.category} value={category} onChange={setCategory} />
          <FilterChips label="Kategori Desain" options={filterOptions.designCategory} value={designCategory} onChange={setDesignCategory} />
          <FilterChips label="Gaya Desain" options={filterOptions.designStyle} value={designStyle} onChange={setDesignStyle} />
          <FilterChips label="Status Proyek" options={filterOptions.status} value={projectStatus} onChange={setProjectStatus} />
          <div>
            <p className="mb-3 font-sans text-[10px] font-black uppercase tracking-[0.24em] text-[#C8A951]">Area / Ruang</p>
            <div className="flex flex-wrap gap-2.5">
              {areaTagOptions.map((tag) => {
                const active = selectedAreaTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedAreaTags((prev) => prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag])}
                    className={`min-h-11 rounded-[999px] border px-3.5 py-2 font-sans text-[10px] font-black uppercase tracking-[0.14em] transition-all motion-safe:duration-500 motion-safe:ease-out ${active ? 'border-[#D4AF37]/45 bg-[#D4AF37]/10 text-[#D4AF37]' : 'border-white/5 text-white/50  hover:border-[#D4AF37]/28 hover:text-[#D4AF37] hover:bg-white/[0.035]'}`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="mb-3 font-sans text-[10px] font-black uppercase tracking-[0.24em] text-[#C8A951]">Urutkan</p>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)} className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#090909] px-4 py-2 font-sans text-sm text-white/72 outline-none focus:border-[#D4AF37]/40">
              <option value="newest">Terbaru</option><option value="oldest">Terlama</option>
              <option value="year_desc">Tahun Terbaru</option><option value="year_asc">Tahun Terlama</option><option value="status">Status Proyek</option>
            </select>
          </div>
        </div>
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#0B0B0A] from-70% to-transparent px-5 pb-5 pt-8">
          <div className="pointer-events-auto grid grid-cols-2 gap-3">
            <button type="button" onClick={resetFilters} className="premium-interactive min-h-11 rounded-full border border-white/15 bg-transparent px-4 py-2 font-sans text-sm font-semibold text-white/85 active:translate-y-0 active:scale-[0.98]">Reset</button>
            <button type="button" onClick={closeMobileFilter} className="premium-interactive min-h-11 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-2 font-sans text-sm font-semibold text-[#E2C866] active:translate-y-0 active:scale-[0.98]">Terapkan</button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  if (projects.length === 0) {
    return <section className="pb-24"><div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.018] p-8 text-center md:p-12"><div className="max-w-xl"><p className="font-display text-4xl font-normal leading-[1.08] tracking-[-0.035em] text-white/90 md:text-5xl">Belum ada karya</p><p className="mx-auto mt-5 max-w-lg text-base leading-7 text-white/60 md:text-lg">Karya sedang saya kurasi. Proyek yang dipublikasikan dari CMS akan tampil di halaman ini beserta konteks masalah dan dampaknya.</p></div></div></section>;
  }

  return (
    <section className="mobile-scroll-section mobile-section-breathing pb-28 md:pb-24">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-white/[0.015] p-5 shadow-[0_28px_60px_rgba(0,0,0,0.22)] transition motion-safe:duration-700 motion-safe:ease-out motion-safe:transform-gpu motion-safe:hover:border-[#C8A951]/35 motion-safe:hover:bg-white/[0.04] md:p-7 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <div>
            <label className="mb-3 block font-mono text-[10px] font-black uppercase tracking-[0.24em] text-[#C8A951]">Cari karya berdasarkan konteks</label>
            <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-black/25 px-4 py-3.5 transition-all motion-safe:duration-500 motion-safe:ease-out hover:border-[#C8A951]/30 hover:bg-white/[0.035] focus-within:border-[#D4AF37]/40 focus-within:shadow-[0_0_0_1px_rgba(212,175,55,0.16)]">
              <Search size={17} className="text-white/44" />
              <input
                ref={searchInputRef}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleMobilePrimaryAction();
                }}
                placeholder="Contoh: lobby hotel, workspace, material hangat, efisiensi alur"
                className="w-full bg-transparent text-sm text-white/66 outline-none placeholder:text-white/45"
              />
              {hasSearchQuery ? (
                <button
                  type="button"
                  aria-label="Hapus pencarian"
                  onClick={handleClearSearch}
                  className="rounded-full border border-transparent p-1 text-white/45 transition hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] focus-visible:border-[#D4AF37]/45 focus-visible:bg-[#D4AF37]/10 focus-visible:text-[#E2C866]"
                >
                  <X size={15} />
                </button>
              ) : null}
            </div>
          </div>

          <div className="hidden lg:block">
            <label className="mb-3 block font-mono text-[10px] font-black uppercase tracking-[0.24em] text-[#C8A951]">Urutkan</label>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)} className="w-full rounded-2xl border border-white/5 bg-[#090909] px-4 py-3 font-sans text-sm text-white/64 outline-none transition-all motion-safe:duration-500 motion-safe:ease-out hover:border-[#D4AF37]/30 hover:bg-white/[0.035] focus:border-[#D4AF37]/40">
              <option value="newest">Terbaru</option><option value="oldest">Terlama</option>
              <option value="year_desc">Tahun Terbaru</option><option value="year_asc">Tahun Terlama</option><option value="status">Status Proyek</option>
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-3 lg:hidden">
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              aria-expanded={hasSearchQuery ? undefined : isMobileFilterOpen}
              aria-controls={hasSearchQuery ? undefined : 'karya-mobile-filter-sheet'}
              onClick={handleMobilePrimaryAction}
              className={`min-h-11 rounded-full border px-4 py-2 font-sans text-sm font-semibold transition active:scale-[0.98] ${hasSearchQuery ? 'border-[#D4AF37]/50 bg-[#D4AF37]/20 text-[#F0DA8B] shadow-[0_10px_24px_rgba(212,175,55,0.2)] hover:bg-[#D4AF37]/25' : 'border-[#D4AF37]/35 text-[#D4AF37] hover:bg-[#D4AF37]/10'}`}
            >
              {hasSearchQuery ? 'Cari' : activeFilterCount > 0 ? `Filter ${activeFilterCount}` : 'Filter'}
            </button>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)} className="min-h-11 w-full rounded-full border border-white/10 bg-[#090909] px-4 py-2 font-sans text-sm text-white/72 outline-none focus:border-[#D4AF37]/40 sm:max-w-[220px]">
              <option value="newest">Terbaru</option><option value="oldest">Terlama</option>
              <option value="year_desc">Tahun Terbaru</option><option value="year_asc">Tahun Terlama</option><option value="status">Status Proyek</option>
            </select>
          </div>
          <p className="font-sans text-sm text-white/66">{filteredProjects.length} karya relevan ditemukan</p>
          {mobileActiveChips.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {mobileActiveChips.map((chip) => (
                <button key={chip.key} type="button" onClick={chip.onRemove} className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/35 bg-[#D4AF37]/10 px-3 py-1.5 font-sans text-xs font-semibold text-[#E2C866]">
                  <span className="truncate">{chip.label}</span>
                  <span aria-hidden>×</span>
                </button>
              ))}
              {mobileActiveChips.length > 0 ? <button type="button" onClick={resetFilters} className="font-sans text-xs font-semibold text-white/70 underline-offset-4 hover:text-[#D4AF37] hover:underline">Reset semua</button> : null}
            </div>
          ) : null}
        </div>

        <div className="mt-8 hidden gap-6 border-t border-white/10 pt-7 md:mt-9 md:grid-cols-2 lg:grid lg:grid-cols-3 lg:pt-8">
          <FilterChips label="Kategori Proyek" options={filterOptions.category} value={category} onChange={setCategory} />
          <FilterChips label="Kategori Desain" options={filterOptions.designCategory} value={designCategory} onChange={setDesignCategory} />
          <FilterChips label="Gaya Desain" options={filterOptions.designStyle} value={designStyle} onChange={setDesignStyle} />
          <FilterChips label="Status Proyek" options={filterOptions.status} value={projectStatus} onChange={setProjectStatus} />
        </div>

        <div className="mt-7 hidden border-t border-white/10 pt-7 lg:block">
          <p className="mb-3 font-sans text-[10px] font-black uppercase tracking-[0.24em] text-white/38">Area / Ruang</p>
          <div className="flex flex-wrap gap-2.5">
            {areaTagOptions.map((tag) => {
              const active = selectedAreaTags.includes(tag);
              return <button key={tag} type="button" onClick={() => setSelectedAreaTags((prev) => prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag])} className={`min-h-11 rounded-[999px] border px-3.5 py-2 font-sans text-[10px] font-black uppercase tracking-[0.14em] transition-all motion-safe:duration-500 motion-safe:ease-out ${active ? 'border-[#D4AF37]/45 bg-[#D4AF37]/10 text-[#D4AF37]' : 'border-white/5 text-white/50  hover:border-[#D4AF37]/28 hover:text-[#D4AF37] hover:bg-white/[0.035]'}`}>{tag}</button>;
            })}
          </div>
        </div>

        <div className="mt-6 hidden flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 lg:flex">
          <p className="font-sans text-sm text-white/66">Menampilkan {filteredProjects.length} dari {projects.length} karya yang tersedia</p>
          <button type="button" onClick={resetFilters} className="premium-interactive min-h-11 rounded-[999px] border border-white/5 px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white/62 transition-all motion-safe:duration-500 motion-safe:ease-out hover:border-[#D4AF37]/30 hover:bg-white/[0.035] hover:text-[#D4AF37] active:translate-y-0 active:scale-[0.98]">Reset Filter</button>
        </div>

        {activeFilters.length > 0 ? <div className="mt-4 hidden flex-wrap gap-2 lg:flex">{activeFilters.map((item) => <Badge key={item}>{item}</Badge>)}</div> : null}
      </div>
      {mounted && mobileFilterSheet ? createPortal(mobileFilterSheet, document.body) : null}

      <div ref={resultsRef}>
        {filteredProjects.length === 0 ? <div className="mt-10 flex min-h-[260px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.018] p-8 text-center"><p className="max-w-md text-lg leading-8 text-white/66">Belum ada karya yang cocok dengan kombinasi filter ini.</p></div> : (
          <div className="mt-12 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project, index) => {
            const encodedSubject = encodeURIComponent(`Pertanyaan tentang project: ${project.title}`);
            const encodedBody = encodeURIComponent(`Halo, saya tertarik dengan project "${project.title}" di portfolio Eryawan Agung.\n\nSaya ingin berdiskusi lebih lanjut mengenai kebutuhan desain saya.`);
            const { visible: visibleAreaTags, overflow: areaOverflow } = limitedAreaTags(project);
            const thumbnail = getProjectArchiveThumbnail(project, selectedAreaTags);
            const visualBadgeLabel = selectedAreaTags.length === 1 && thumbnail.matchedAreaTag ? `Sesuai: ${thumbnail.matchedAreaTag}` : 'Visual sesuai filter';
            return <article key={project.id} style={{ '--reveal-delay': `${index * 90}ms`, '--premium-card-border': index === 0 ? 'rgba(212, 175, 55, 0.55)' : 'rgba(255, 255, 255, 0.12)' } as CSSProperties} className={`reveal-on-scroll mobile-card-breathing mobile-card-reveal premium-card-hover premium-oval-card premium-oval-frame group relative flex h-full flex-col border border-transparent bg-gradient-to-br from-white/[0.035] via-white/[0.02] to-black/25 transition motion-safe:duration-500 motion-safe:ease-out hover:bg-white/[0.04] hover:shadow-[0_26px_58px_rgba(0,0,0,0.36)] ${index === 0 ? 'md:col-span-2 xl:col-span-2' : ''}`}>
              {thumbnail.imageUrl ? <button type="button" onClick={() => setLightboxImage({ src: thumbnail.imageUrl!, alt: thumbnail.altText })} className="premium-oval-media-top relative aspect-square border-b border-white/10 bg-white/[0.02]"><img src={thumbnail.imageUrl} alt={thumbnail.altText} className="h-full w-full object-cover opacity-88 transition duration-700 group-hover:scale-[1.04] group-hover:opacity-100" loading="lazy" decoding="async" />{thumbnail.isFilterMatchedImage ? <span className="absolute left-3 top-3 rounded-full border border-[#D4AF37]/45 bg-[#0B0A08]/85 px-2.5 py-1 font-sans text-[10px] font-semibold text-[#E2C866] shadow-[0_6px_18px_rgba(0,0,0,0.34)]">{visualBadgeLabel}</span> : null}</button> : <div className="premium-oval-media-top aspect-square flex items-center justify-center border-b border-white/10 bg-white/[0.025] text-center text-sm text-white/46">Cover image belum tersedia</div>}
              <div className="flex flex-col px-5 pb-5 pt-5 md:px-6 md:pb-6 md:pt-6">
                <div className="flex flex-wrap items-start justify-between gap-3"><p className="font-mono text-[10px] font-black uppercase tracking-[0.32em] text-[#D4AF37]">Project {String(index + 1).padStart(2, '0')}</p></div>
                <h2 className="font-display mt-4 line-clamp-2 max-w-2xl text-[2rem] font-normal leading-[1.07] tracking-[-0.03em] text-white/95 md:text-[2.2rem]">{project.title}</h2>
                {getProjectTeaser(project) ? <p className="mt-5 font-sans text-sm leading-[1.75] text-white/62 md:text-[15px]">{truncateText(getProjectTeaser(project), 130)}</p> : null}
                <p className="mt-2 line-clamp-2 font-sans text-xs leading-relaxed text-white/52">{truncateText(getProjectShareCopy(project), 160)}</p>
                <div className="mt-5 flex flex-wrap items-center gap-2.5 border-t border-white/10 pt-5 text-white/58"><Badge>{getDisplayLabel(project.category || project.design_category) || 'Uncategorized'}</Badge><Badge>{getProjectStatus(project)}</Badge><Badge>{String(getProjectYear(project))}</Badge>{visibleAreaTags.map((tag) => <Badge key={`${project.id}-area-${normalize(tag)}`}>{getAreaTagLabel(tag)}</Badge>)}{areaOverflow > 0 ? <Badge>{`+${areaOverflow}`}</Badge> : null}</div>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href={`/karya/${project.slug}`} className="premium-interactive inline-flex items-center gap-3 rounded-[999px] border border-[#D4AF37]/45 px-4 py-2 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-[#D4AF37] transition-all motion-safe:duration-500 motion-safe:ease-out hover:border-[#E0BF61]/50 hover:bg-[#D4AF37]/10 hover:text-[#E2C866] active:translate-y-0 active:scale-[0.98]">Lihat Proses & Hasil <ArrowUpRight size={16} /></Link>
                  <a href={`mailto:${contactEmail}?subject=${encodedSubject}&body=${encodedBody}`} className="premium-interactive inline-flex items-center gap-2 rounded-[999px] border border-white/5 px-4 py-2 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-white/70 transition-all motion-safe:duration-500 motion-safe:ease-out hover:border-white/20 hover:bg-white/[0.03] hover:text-white active:translate-y-0 active:scale-[0.98]">Email <Mail size={14} /></a>
                  <a href={`https://wa.me/?text=${encodeURIComponent(`Halo, saya tertarik membahas karya "${project.title}" dan peluang kolaborasinya.`)}`} target="_blank" rel="noreferrer" className="premium-interactive inline-flex items-center gap-2 rounded-[999px] border border-white/5 px-4 py-2 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-white/70 transition-all motion-safe:duration-500 motion-safe:ease-out hover:border-white/20 hover:bg-white/[0.03] hover:text-white active:translate-y-0 active:scale-[0.98]">WhatsApp</a>
                </div>
              </div>
            </article>;
            })}
          </div>
        )}
      </div>
      {lightboxImage ? (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setLightboxImage(null)}>
          <div className="relative max-h-[92vh] w-full max-w-6xl" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setLightboxImage(null)} className="absolute right-3 top-3 z-10 rounded-full border border-white/20 bg-black/60 p-2 text-white">
              <X size={18} />
            </button>
            <img src={lightboxImage.src} alt={lightboxImage.alt} className="max-h-[92vh] w-full rounded-xl border border-white/15 object-contain" decoding="async" />
          </div>
        </div>
      ) : null}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 md:inset-x-auto md:right-6 md:justify-end">
        <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/15 bg-[#0B0A08]/90 px-3 py-2 shadow-[0_14px_40px_rgba(0,0,0,0.4)] backdrop-blur">
          <a href={`https://wa.me/?text=${encodeURIComponent('Saya menemukan beberapa studi kasus desain yang menarik untuk dilihat\n\nhttps://eryawanagung.my.id/karya')}`} target="_blank" rel="noreferrer" aria-label="Bagikan daftar karya via WhatsApp" className="inline-flex min-h-10 items-center rounded-full border border-[#D4AF37]/55 bg-[#D4AF37]/16 px-4 py-2 font-sans text-sm font-semibold text-[#E2C866] transition hover:bg-[#D4AF37]/22 hover:text-[#F4D987]">WhatsApp</a>
          <ShareLinkButton url="https://eryawanagung.my.id/karya" className="inline-flex min-h-10 items-center rounded-full border border-white/20 px-4 py-2 font-sans text-sm font-semibold text-white/78 transition hover:border-[#D4AF37]/40 hover:text-[#D4AF37]" />
        </div>
      </div>
    </section>
  );
}
