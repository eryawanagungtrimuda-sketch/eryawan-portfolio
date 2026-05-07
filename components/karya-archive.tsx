'use client';

import Link from 'next/link';
import { ArrowUpRight, MoveRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Project } from '@/lib/types';
import RevealOnScroll from '@/components/reveal-on-scroll';

type Props = { projects: Project[] };
type SortOption = 'newest' | 'oldest' | 'az';

function getProjectDate(project: Project) {
  const time = new Date(project.created_at).getTime();
  return Number.isFinite(time) ? time : 0;
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
  const projectTeaser = project.problem || project.solution || project.impact;
  return projectTeaser?.trim() ? projectTeaser : null;
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
            <button key={item} type="button" onClick={() => onChange(item)} className={`min-h-11 rounded-full border px-3.5 py-2 font-mono text-[10px] font-black uppercase tracking-[0.14em] transition motion-safe:duration-500 motion-safe:ease-out ${
              active ? 'border-[#D4AF37]/55 bg-[#D4AF37]/12 text-[#D4AF37]' : 'border-white/10 text-white/45 motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:border-[#D4AF37]/35 hover:text-[#D4AF37] hover:bg-white/[0.04]'
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
  return <span className="rounded-full border border-white/12 bg-white/[0.02] px-3 py-1 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-white/55">{children}</span>;
}

export default function KaryaArchive({ projects }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Semua');
  const [designCategory, setDesignCategory] = useState('Semua');
  const [designStyle, setDesignStyle] = useState('Semua');
  const [selectedAreaTags, setSelectedAreaTags] = useState<string[]>([]);
  const [sort, setSort] = useState<SortOption>('newest');

  const areaTagOptions = useMemo(() => {
    const set = new Set<string>();
    projects.forEach((project) => projectAreaTags(project).forEach((tag) => set.add(tag)));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [projects]);

  const filterOptions = useMemo(() => ({
    category: uniqueOptions(projects, 'category'),
    designCategory: uniqueOptions(projects, 'design_category'),
    designStyle: uniqueOptions(projects, 'design_style'),
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
        return matchesSearch && matchesCategory && matchesDesignCategory && matchesDesignStyle && matchesAreaTags;
      })
      .sort((a, b) => {
        if (sort === 'oldest') return getProjectDate(a) - getProjectDate(b);
        if (sort === 'az') return a.title.localeCompare(b.title);
        return getProjectDate(b) - getProjectDate(a);
      });
  }, [category, designCategory, designStyle, projects, search, selectedAreaTags, sort]);

  const activeFilters = [
    category !== 'Semua' ? `Kategori Project: ${category}` : null,
    designCategory !== 'Semua' ? `Kategori Desain: ${designCategory}` : null,
    designStyle !== 'Semua' ? `Gaya: ${designStyle}` : null,
    ...selectedAreaTags,
    search.trim() ? `Cari: ${search.trim()}` : null,
  ].filter(Boolean) as string[];

  const resetFilters = () => {
    setSearch('');
    setCategory('Semua');
    setDesignCategory('Semua');
    setDesignStyle('Semua');
    setSelectedAreaTags([]);
    setSort('newest');
  };

  if (projects.length === 0) {
    return <section className="pb-24"><div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.018] p-8 text-center md:p-12"><div className="max-w-xl"><p className="font-display text-4xl font-normal leading-[1.08] tracking-[-0.035em] text-white/90 md:text-5xl">Belum ada karya</p><p className="mx-auto mt-5 max-w-lg text-base leading-7 text-white/60 md:text-lg">Portfolio sedang disiapkan. Project yang dipublikasikan dari CMS akan tampil di halaman ini.</p></div></div></section>;
  }

  return (
    <section className="pb-24">
      <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.03] to-white/[0.015] p-5 shadow-[0_28px_60px_rgba(0,0,0,0.22)] transition motion-safe:duration-700 motion-safe:ease-out motion-safe:transform-gpu motion-safe:hover:border-[#C8A951]/35 motion-safe:hover:bg-white/[0.04] md:p-7 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <div>
            <label className="mb-3 block font-mono text-[10px] font-black uppercase tracking-[0.24em] text-white/38">Cari Karya</label>
            <div className="flex items-center gap-3 rounded-2xl border border-white/12 bg-black/25 px-4 py-3.5 transition motion-safe:duration-500 motion-safe:ease-out hover:border-[#C8A951]/35 hover:bg-white/[0.04] focus-within:border-[#D4AF37]/45 focus-within:shadow-[0_0_0_1px_rgba(212,175,55,0.2)]">
              <Search size={17} className="text-white/44" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari karya, kategori, style, area, atau narasi..." className="w-full bg-transparent text-sm text-white/66 outline-none placeholder:text-white/45" />
            </div>
          </div>

          <div>
            <label className="mb-3 block font-mono text-[10px] font-black uppercase tracking-[0.24em] text-white/38">Urutkan</label>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)} className="w-full rounded-2xl border border-white/10 bg-[#090909] px-4 py-3 font-sans text-sm text-white/64 outline-none transition motion-safe:duration-500 motion-safe:ease-out hover:border-[#D4AF37]/35 hover:bg-white/[0.04] focus:border-[#D4AF37]/45">
              <option value="newest">Terbaru</option><option value="oldest">Terlama</option><option value="az">A-Z</option>
            </select>
          </div>
        </div>

        <div className="mt-8 grid gap-6 border-t border-white/10 pt-7 md:mt-9 md:grid-cols-2 lg:grid-cols-3 lg:pt-8">
          <FilterChips label="Kategori Project" options={filterOptions.category} value={category} onChange={setCategory} />
          <FilterChips label="Kategori Desain" options={filterOptions.designCategory} value={designCategory} onChange={setDesignCategory} />
          <FilterChips label="Gaya Desain" options={filterOptions.designStyle} value={designStyle} onChange={setDesignStyle} />
        </div>

        <div className="mt-7 border-t border-white/10 pt-7">
          <p className="mb-3 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-white/38">Area / Ruang</p>
          <div className="flex flex-wrap gap-2.5">
            {areaTagOptions.map((tag) => {
              const active = selectedAreaTags.includes(tag);
              return <button key={tag} type="button" onClick={() => setSelectedAreaTags((prev) => prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag])} className={`min-h-11 rounded-full border px-3.5 py-2 font-mono text-[10px] font-black uppercase tracking-[0.14em] transition motion-safe:duration-500 motion-safe:ease-out ${active ? 'border-[#D4AF37]/55 bg-[#D4AF37]/12 text-[#D4AF37]' : 'border-white/10 text-white/45 motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:border-[#D4AF37]/35 hover:text-[#D4AF37] hover:bg-white/[0.04]'}`}>{tag}</button>;
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <p className="font-sans text-sm text-white/66">Menampilkan {filteredProjects.length} dari {projects.length} karya</p>
          <button type="button" onClick={resetFilters} className="min-h-11 rounded-full border border-white/12 px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white/62 transition motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:border-[#D4AF37]/40 hover:bg-white/[0.04] hover:text-[#D4AF37]">Reset Filter</button>
        </div>

        {activeFilters.length > 0 ? <div className="mt-4 flex flex-wrap gap-2">{activeFilters.map((item) => <Badge key={item}>{item}</Badge>)}</div> : null}
      </div>

      {filteredProjects.length === 0 ? <div className="mt-10 flex min-h-[260px] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.018] p-8 text-center"><p className="max-w-md text-lg leading-8 text-white/66">Tidak ada karya yang sesuai dengan filter ini.</p></div> : (
        <div className="mt-12 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project, index) => (
            <RevealOnScroll key={project.id} delay={(index % 4) * 80}>
            <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/12 bg-gradient-to-br from-white/[0.035] via-white/[0.02] to-black/25 transition motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-1.5 motion-safe:hover:transform-gpu hover:border-[#D4AF37]/50 hover:bg-white/[0.05] hover:shadow-[0_30px_64px_rgba(0,0,0,0.4)]">
              {project.cover_image ? <div className="aspect-[16/10] overflow-hidden border-b border-white/10 bg-white/[0.02]"><img src={project.cover_image} alt={project.title} className="h-full w-full object-cover opacity-88 transition duration-700 group-hover:scale-[1.04] group-hover:opacity-100" /></div> : <div className="flex aspect-[16/10] items-center justify-center border-b border-white/10 bg-white/[0.025] text-center text-sm text-white/46">Cover image belum tersedia</div>}
              <div className="flex h-full flex-col p-5 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3"><p className="font-mono text-[10px] font-black uppercase tracking-[0.32em] text-[#D4AF37]">Project {String(index + 1).padStart(2, '0')}</p><div className="flex flex-wrap justify-end gap-2">{buildProjectBadges(project).map((badge) => <Badge key={`${project.id}-${normalize(badge)}`}>{badge}</Badge>)}</div></div>
                <h2 className="font-display mt-4 line-clamp-2 max-w-2xl text-[2rem] font-normal leading-[1.07] tracking-[-0.03em] text-white/95 md:text-[2.2rem]">{project.title}</h2>
                {getProjectTeaser(project) ? <p className="mt-5 font-sans text-sm leading-[1.75] text-white/62 md:text-[15px]">{truncateText(getProjectTeaser(project), 130)}</p> : null}
                <div className="mt-5 flex flex-wrap items-center gap-2.5 border-t border-white/10 pt-5 text-white/58"><Badge>{project.category || project.design_category || 'Uncategorized'}</Badge>{project.area_type ? <Badge>{project.area_type}</Badge> : null}</div>
                <Link href={`/karya/${project.slug}`} className="mt-7 inline-flex items-center gap-3 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-[#D4AF37] transition motion-safe:duration-500 motion-safe:ease-out hover:text-[#E2C866]">Lihat Studi Kasus <ArrowUpRight size={16} className="transition motion-safe:duration-500 motion-safe:ease-out motion-safe:group-hover:translate-x-1 motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:scale-[1.03]" /></Link>
              </div>
            </article>
            </RevealOnScroll>
          ))}
        </div>
      )}
    </section>
  );
}
