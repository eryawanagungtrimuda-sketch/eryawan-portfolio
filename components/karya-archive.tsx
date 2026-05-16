'use client';

import Link from 'next/link';
import { ArrowUpRight, Mail, Search, X } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Project } from '@/lib/types';

type Props = { projects: Project[] };
type SortOption = 'newest' | 'oldest' | 'year_desc' | 'year_asc' | 'status';

function getProjectDate(project: Project) {
  const time = new Date(project.created_at).getTime();
  return Number.isFinite(time) ? time : 0;
}

function getProjectYear(project: Project) {
  const year = new Date(project.created_at).getFullYear();
  return Number.isFinite(year) ? year : 0;
}

function normalize(value?: string | null) {
  return (value || '').trim().toLowerCase();
}

function truncateText(value?: string | null, limit = 150) {
  if (!value) return '';
  if (value.length <= limit) return value;
  return `${value.slice(0, limit).trim()}...`;
}

function uniqueOptions(projects: Project[], key: keyof Project) {
  const values = projects.map((project) => project[key]);
  const unique = Array.from(new Set(values.filter((value): value is string => typeof value === 'string' && value.trim().length > 0).map((value) => value.trim())));
  return ['Semua', ...unique.sort((a, b) => a.localeCompare(b))];
}

function projectAreaTags(project: Project) {
  const set = new Set<string>();
  if (project.area_type?.trim()) set.add(project.area_type.trim());
  (project.area_tags || []).forEach((tag) => {
    if (tag?.trim()) set.add(tag.trim());
  });
  return Array.from(set);
}

function getProjectTeaser(project: Project) {
  const projectTeaser = project.problem || project.solution || project.impact || project.dampak;
  return projectTeaser?.trim() ? projectTeaser : null;
}

function getProjectStatus(project: Project) {
  return project.impact?.trim() || project.dampak?.trim() ? 'Selesai' : 'Konsep';
}

function buildProjectBadges(project: Project, max = 4) {
  const deduped: string[] = [];
  const seen = new Set<string>();

  const addBadge = (value?: string | null) => {
    const trimmed = value?.trim();
    if (!trimmed) return;

    const normalized = normalize(trimmed);
    if (!normalized || seen.has(normalized)) return;

    seen.add(normalized);
    deduped.push(trimmed);
  };

  addBadge(project.category || project.design_category);
  addBadge(project.design_style);
  addBadge(project.area_type);
  (project.area_tags || []).forEach(addBadge);

  return deduped.slice(0, max);
}

function FilterChips({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <p className="mb-3 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-[#C8A951]">{label}</p>
      <div className="flex flex-wrap gap-2.5">
        {options.map((item) => {
          const active = item === value;
          return (
            <button key={item} type="button" onClick={() => onChange(item)} className={`min-h-11 rounded-[999px] border px-3.5 py-2 font-mono text-[10px] font-black uppercase tracking-[0.14em] transition-all motion-safe:duration-500 motion-safe:ease-out ${
              active ? 'border-[#D4AF37]/45 bg-[#D4AF37]/10 text-[#D4AF37]' : 'border-white/5 text-white/50 motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:border-[#D4AF37]/28 hover:text-[#D4AF37] hover:bg-white/[0.035]'
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
    const set = new Set<string>();
    projects.forEach((project) => projectAreaTags(project).forEach((tag) => set.add(tag)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [projects]);

  const filterOptions = useMemo(() => ({
    category: uniqueOptions(projects, 'category'),
    designCategory: uniqueOptions(projects, 'design_category'),
    designStyle: uniqueOptions(projects, 'design_style'),
    status: ['Semua', 'Selesai', 'Konsep'],
  }), [projects]);

  const filteredProjects = useMemo(() => {
    const query = normalize(search);

    return projects
      .filter((project) => {
        const projectTags = projectAreaTags(project);
        const searchFields = [
          project.title,
          project.category,
          project.design_category,
          project.design_style,
          project.area_type,
          ...(project.area_tags || []),
          project.problem,
          project.solution,
          project.impact,
        ].map(normalize).join(' ');

        const matchesSearch = !query || searchFields.includes(query);
        const matchesCategory = category === 'Semua' || normalize(project.category) === normalize(category);
        const matchesDesignCategory = designCategory === 'Semua' || normalize(project.design_category) === normalize(designCategory);
        const matchesDesignStyle = designStyle === 'Semua' || normalize(project.design_style) === normalize(designStyle);
        const matchesAreaTags = selectedAreaTags.length === 0 || selectedAreaTags.some((selected) => projectTags.some((tag) => normalize(tag) === normalize(selected)));
        const matchesStatus = projectStatus === 'Semua' || normalize(getProjectStatus(project)) === normalize(projectStatus);
        return matchesSearch && matchesCategory && matchesDesignCategory && matchesDesignStyle && matchesAreaTags && matchesStatus;
      })
      .sort((a, b) => {
        if (sort === 'year_desc') return getProjectYear(b) - getProjectYear(a);
        if (sort === 'year_asc') return getProjectYear(a) - getProjectYear(b);
        if (sort === 'status') return getProjectStatus(a).localeCompare(getProjectStatus(b));
        if (sort === 'oldest') return getProjectDate(a) - getProjectDate(b);
        return getProjectDate(b) - getProjectDate(a);
      });
  }, [category, designCategory, designStyle, projectStatus, projects, search, selectedAreaTags, sort]);

  const activeFilters = [
    category !== 'Semua' ? `Kategori Project: ${category}` : null,
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

  const mobileFilterSheet = isMobileFilterOpen ? (
    <div className="fixed inset-0 z-[9999] lg:hidden" onClick={closeMobileFilter}>
      <div className="absolute inset-0 bg-black/70" />
      <div
        id="karya-mobile-filter-sheet"
        role="dialog"
        aria-modal="true"
        aria-label="Filter Karya"
        className="absolute inset-x-0 bottom-0 max-h-[82dvh] overflow-y-auto rounded-t-[28px] border border-white/10 bg-[#0B0B0A] p-5 pb-24 shadow-[0_-24px_80px_rgba(0,0,0,0.55)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-white/20" />
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-sans text-lg font-semibold text-white">Filter Karya</h2>
            <p className="mt-1 text-sm text-white/58">Pilih kategori untuk mempersempit hasil.</p>
          </div>
          <button type="button" aria-label="Tutup panel filter" onClick={closeMobileFilter} className="rounded-full border border-white/15 p-2 text-white/80">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-5">
          <FilterChips label="Kategori Project" options={filterOptions.category} value={category} onChange={setCategory} />
          <FilterChips label="Kategori Desain" options={filterOptions.designCategory} value={designCategory} onChange={setDesignCategory} />
          <FilterChips label="Gaya Desain" options={filterOptions.designStyle} value={designStyle} onChange={setDesignStyle} />
          <FilterChips label="Status Proyek" options={filterOptions.status} value={projectStatus} onChange={setProjectStatus} />
          <div>
            <p className="mb-3 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-[#C8A951]">Area / Ruang</p>
            <div className="flex flex-wrap gap-2.5">
              {areaTagOptions.map((tag) => {
                const active = selectedAreaTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedAreaTags((prev) => prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag])}
                    className={`min-h-11 rounded-[999px] border px-3.5 py-2 font-mono text-[10px] font-black uppercase tracking-[0.14em] transition-all motion-safe:duration-500 motion-safe:ease-out ${active ? 'border-[#D4AF37]/45 bg-[#D4AF37]/10 text-[#D4AF37]' : 'border-white/5 text-white/50 motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:border-[#D4AF37]/28 hover:text-[#D4AF37] hover:bg-white/[0.035]'}`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
          <div>
            <p className="mb-3 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-[#C8A951]">Urutkan</p>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)} className="min-h-11 w-full rounded-2xl border border-white/10 bg-[#090909] px-4 py-2 font-sans text-sm text-white/72 outline-none focus:border-[#D4AF37]/40">
              <option value="newest">Terbaru</option><option value="oldest">Terlama</option>
              <option value="year_desc">Tahun Terbaru</option><option value="year_asc">Tahun Terlama</option><option value="status">Status Proyek</option>
            </select>
          </div>
        </div>
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-10 bg-gradient-to-t from-[#0B0B0A] from-70% to-transparent px-5 pb-5 pt-8">
          <div className="pointer-events-auto grid grid-cols-2 gap-3">
            <button type="button" onClick={resetFilters} className="min-h-11 rounded-full border border-white/15 bg-transparent px-4 py-2 font-sans text-sm font-semibold text-white/85">Reset</button>
            <button type="button" onClick={closeMobileFilter} className="min-h-11 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/10 px-4 py-2 font-sans text-sm font-semibold text-[#E2C866]">Terapkan</button>
          </div>
        </div>
      </div>
    </div>
  ) : null;

  if (projects.length === 0) {
    return <section className="pb-24"><div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.018] p-8 text-center md:p-12"><div className="max-w-xl"><p className="font-display text-4xl font-normal leading-[1.08] tracking-[-0.035em] text-white/90 md:text-5xl">Belum ada karya</p><p className="mx-auto mt-5 max-w-lg text-base leading-7 text-white/60 md:text-lg">Portfolio sedang disiapkan. Project yang dipublikasikan dari CMS akan tampil di halaman ini.</p></div></div></section>;
  }

  return (
    <section className="reveal-on-scroll pb-24">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-white/[0.015] p-5 shadow-[0_28px_60px_rgba(0,0,0,0.22)] transition motion-safe:duration-700 motion-safe:ease-out motion-safe:transform-gpu motion-safe:hover:border-[#C8A951]/35 motion-safe:hover:bg-white/[0.04] md:p-7 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <div>
            <label className="mb-3 block font-mono text-[10px] font-black uppercase tracking-[0.24em] text-[#C8A951]">Cari Karya</label>
            <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-black/25 px-4 py-3.5 transition-all motion-safe:duration-500 motion-safe:ease-out hover:border-[#C8A951]/30 hover:bg-white/[0.035] focus-within:border-[#D4AF37]/40 focus-within:shadow-[0_0_0_1px_rgba(212,175,55,0.16)]">
              <Search size={17} className="text-white/44" />
              <input
                ref={searchInputRef}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') handleMobilePrimaryAction();
                }}
                placeholder="Cari karya, kategori, style, area, atau narasi..."
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
          <p className="font-sans text-sm text-white/66">{filteredProjects.length} karya ditemukan</p>
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
          <FilterChips label="Kategori Project" options={filterOptions.category} value={category} onChange={setCategory} />
          <FilterChips label="Kategori Desain" options={filterOptions.designCategory} value={designCategory} onChange={setDesignCategory} />
          <FilterChips label="Gaya Desain" options={filterOptions.designStyle} value={designStyle} onChange={setDesignStyle} />
          <FilterChips label="Status Proyek" options={filterOptions.status} value={projectStatus} onChange={setProjectStatus} />
        </div>

        <div className="mt-7 hidden border-t border-white/10 pt-7 lg:block">
          <p className="mb-3 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-white/38">Area / Ruang</p>
          <div className="flex flex-wrap gap-2.5">
            {areaTagOptions.map((tag) => {
              const active = selectedAreaTags.includes(tag);
              return <button key={tag} type="button" onClick={() => setSelectedAreaTags((prev) => prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag])} className={`min-h-11 rounded-[999px] border px-3.5 py-2 font-mono text-[10px] font-black uppercase tracking-[0.14em] transition-all motion-safe:duration-500 motion-safe:ease-out ${active ? 'border-[#D4AF37]/45 bg-[#D4AF37]/10 text-[#D4AF37]' : 'border-white/5 text-white/50 motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:border-[#D4AF37]/28 hover:text-[#D4AF37] hover:bg-white/[0.035]'}`}>{tag}</button>;
            })}
          </div>
        </div>

        <div className="mt-6 hidden flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 lg:flex">
          <p className="font-sans text-sm text-white/66">Menampilkan {filteredProjects.length} dari {projects.length} karya</p>
          <button type="button" onClick={resetFilters} className="min-h-11 rounded-[999px] border border-white/5 px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white/62 transition-all motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:border-[#D4AF37]/30 hover:bg-white/[0.035] hover:text-[#D4AF37]">Reset Filter</button>
        </div>

        {activeFilters.length > 0 ? <div className="mt-4 hidden flex-wrap gap-2 lg:flex">{activeFilters.map((item) => <Badge key={item}>{item}</Badge>)}</div> : null}
      </div>
      {mounted && mobileFilterSheet ? createPortal(mobileFilterSheet, document.body) : null}

      <div ref={resultsRef}>
        {filteredProjects.length === 0 ? <div className="mt-10 flex min-h-[260px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.018] p-8 text-center"><p className="max-w-md text-lg leading-8 text-white/66">Tidak ada karya yang sesuai dengan filter ini.</p></div> : (
          <div className="mt-12 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {filteredProjects.map((project, index) => {
            const encodedSubject = encodeURIComponent(`Pertanyaan tentang project: ${project.title}`);
            const encodedBody = encodeURIComponent(`Halo, saya tertarik dengan project "${project.title}" di portfolio Eryawan Agung.\n\nSaya ingin berdiskusi lebih lanjut mengenai kebutuhan desain saya.`);
            return <article key={project.id} className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-gradient-to-br from-white/[0.035] via-white/[0.02] to-black/25 transition motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-1 motion-safe:hover:transform-gpu hover:bg-white/[0.04] hover:shadow-[0_26px_58px_rgba(0,0,0,0.36)] ${index === 0 ? 'border-[#D4AF37]/55 md:col-span-2 xl:col-span-2' : 'border-white/12 hover:border-[#D4AF37]/35'}`}>
              {project.cover_image ? <button type="button" onClick={() => setLightboxImage({ src: project.cover_image!, alt: project.title })} className={`overflow-hidden border-b border-white/10 bg-white/[0.02] ${index === 0 ? 'aspect-[21/10]' : 'aspect-[16/10]'}`}><img src={project.cover_image} alt={project.title} className="h-full w-full object-cover opacity-88 transition duration-700 group-hover:scale-[1.04] group-hover:opacity-100" loading="lazy" decoding="async" /></button> : <div className="flex aspect-[16/10] items-center justify-center border-b border-white/10 bg-white/[0.025] text-center text-sm text-white/46">Cover image belum tersedia</div>}
              <div className="flex h-full flex-col p-5 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3"><p className="font-mono text-[10px] font-black uppercase tracking-[0.32em] text-[#D4AF37]">Project {String(index + 1).padStart(2, '0')}</p><div className="flex flex-wrap justify-end gap-2">{buildProjectBadges(project).map((badge) => <Badge key={`${project.id}-${normalize(badge)}`}>{badge}</Badge>)}</div></div>
                <h2 className="font-display mt-4 line-clamp-2 max-w-2xl text-[2rem] font-normal leading-[1.07] tracking-[-0.03em] text-white/95 md:text-[2.2rem]">{project.title}</h2>
                {getProjectTeaser(project) ? <p className="mt-5 font-sans text-sm leading-[1.75] text-white/62 md:text-[15px]">{truncateText(getProjectTeaser(project), 130)}</p> : null}
                <div className="mt-5 flex flex-wrap items-center gap-2.5 border-t border-white/10 pt-5 text-white/58"><Badge>{project.category || project.design_category || 'Uncategorized'}</Badge><Badge>{getProjectStatus(project)}</Badge><Badge>{String(getProjectYear(project))}</Badge>{project.area_type ? <Badge>{project.area_type}</Badge> : null}</div>
                <div className="mt-7 flex flex-wrap gap-3">
                  <Link href={`/karya/${project.slug}`} className="inline-flex items-center gap-3 rounded-[999px] border border-[#D4AF37]/45 px-4 py-2 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-[#D4AF37] transition-all motion-safe:duration-500 motion-safe:ease-out hover:-translate-y-0.5 hover:border-[#E0BF61]/50 hover:bg-[#D4AF37]/10 hover:text-[#E2C866]">Detail Proyek <ArrowUpRight size={16} /></Link>
                  <a href={`mailto:${contactEmail}?subject=${encodedSubject}&body=${encodedBody}`} className="inline-flex items-center gap-2 rounded-[999px] border border-white/5 px-4 py-2 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-white/70 transition-all motion-safe:duration-500 motion-safe:ease-out hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.03] hover:text-white">Email <Mail size={14} /></a>
                  <a href={`https://wa.me/?text=${encodeURIComponent(`Halo, saya tertarik dengan karya "${project.title}"`)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-[999px] border border-white/5 px-4 py-2 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-white/70 transition-all motion-safe:duration-500 motion-safe:ease-out hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.03] hover:text-white">WhatsApp</a>
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
    </section>
  );
}
