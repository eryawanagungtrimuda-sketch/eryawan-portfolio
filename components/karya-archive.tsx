'use client';

import Link from 'next/link';
import { MoveRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Project } from '@/lib/types';

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
      <p className="mb-3 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-white/38">{label}</p>
      <div className="flex flex-wrap gap-2.5">
        {options.map((item) => {
          const active = item === value;
          return (
            <button key={item} type="button" onClick={() => onChange(item)} className={`rounded-full border px-3.5 py-2 font-mono text-[10px] font-black uppercase tracking-[0.14em] transition duration-300 ${
              active ? 'border-[#D4AF37]/55 bg-[#D4AF37]/12 text-[#D4AF37]' : 'border-white/10 text-white/45 hover:border-[#D4AF37]/35 hover:text-[#D4AF37]'
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
  return <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-white/50">{children}</span>;
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
    return <section className="pb-24"><div className="flex min-h-[320px] items-center justify-center rounded-sm border border-white/10 bg-white/[0.018] p-8 text-center md:p-12"><div className="max-w-xl"><p className="font-display text-4xl font-normal leading-[1.08] tracking-[-0.035em] text-white/90 md:text-5xl">Belum ada karya</p><p className="mx-auto mt-5 max-w-lg text-base leading-7 text-white/52 md:text-lg">Portfolio sedang disiapkan. Project yang dipublikasikan dari CMS akan tampil di halaman ini.</p></div></div></section>;
  }

  return (
    <section className="pb-24">
      <div className="rounded-sm border border-white/10 bg-white/[0.018] p-5 md:p-7 lg:p-8">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <div>
            <label className="mb-3 block font-mono text-[10px] font-black uppercase tracking-[0.24em] text-white/38">Cari Karya</label>
            <div className="flex items-center gap-3 rounded-sm border border-white/10 bg-black/20 px-4 py-3 transition duration-300 focus-within:border-[#D4AF37]/45">
              <Search size={17} className="text-white/36" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari karya, kategori, style, area, atau narasi..." className="w-full bg-transparent text-sm text-white/80 outline-none placeholder:text-white/30" />
            </div>
          </div>

          <div>
            <label className="mb-3 block font-mono text-[10px] font-black uppercase tracking-[0.24em] text-white/38">Urutkan</label>
            <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)} className="w-full rounded-sm border border-white/10 bg-[#090909] px-4 py-3 text-sm text-white/72 outline-none transition duration-300 hover:border-[#D4AF37]/35 focus:border-[#D4AF37]/45">
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
              return <button key={tag} type="button" onClick={() => setSelectedAreaTags((prev) => prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag])} className={`rounded-full border px-3.5 py-2 font-mono text-[10px] font-black uppercase tracking-[0.14em] transition duration-300 ${active ? 'border-[#D4AF37]/55 bg-[#D4AF37]/12 text-[#D4AF37]' : 'border-white/10 text-white/45 hover:border-[#D4AF37]/35 hover:text-[#D4AF37]'}`}>{tag}</button>;
            })}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
          <p className="text-sm text-white/62">Menampilkan {filteredProjects.length} dari {projects.length} karya</p>
          <button type="button" onClick={resetFilters} className="rounded-sm border border-white/12 px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white/68 transition duration-300 hover:border-[#D4AF37]/40 hover:text-[#D4AF37]">Reset Filter</button>
        </div>

        {activeFilters.length > 0 ? <div className="mt-4 flex flex-wrap gap-2">{activeFilters.map((item) => <Badge key={item}>{item}</Badge>)}</div> : null}
      </div>

      {filteredProjects.length === 0 ? <div className="mt-10 flex min-h-[260px] items-center justify-center rounded-sm border border-white/10 bg-white/[0.018] p-8 text-center"><p className="max-w-md text-lg leading-8 text-white/58">Tidak ada karya yang sesuai dengan filter ini.</p></div> : (
        <div className="mt-12 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {filteredProjects.map((project, index) => (
            <article key={project.id} className="group relative flex h-full flex-col overflow-hidden rounded-sm border border-white/12 bg-gradient-to-br from-white/[0.035] to-white/[0.012] p-5 md:p-6">
              {project.cover_image ? <div className="mb-6 aspect-[16/10] overflow-hidden rounded-sm border border-white/10 bg-white/[0.02]"><img src={project.cover_image} alt={project.title} className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100" /></div> : <div className="mb-6 flex aspect-[16/10] items-center justify-center rounded-sm border border-white/10 bg-white/[0.025] text-center text-sm text-white/32">Cover image belum tersedia</div>}
              <div className="flex flex-wrap items-start justify-between gap-3"><p className="font-mono text-[10px] font-black uppercase tracking-[0.32em] text-[#D4AF37]">Project {String(index + 1).padStart(2, '0')}</p><div className="flex flex-wrap justify-end gap-2">{buildProjectBadges(project).map((badge) => <Badge key={`${project.id}-${normalize(badge)}`}>{badge}</Badge>)}</div></div>
              <h2 className="font-display mt-5 line-clamp-2 max-w-2xl text-3xl font-normal leading-[1.08] tracking-[-0.03em] text-white/92 md:text-4xl">{project.title}</h2>
              <div className="mt-6 space-y-5 border-t border-white/10 pt-6"><div><p className="font-mono text-[10px] font-black uppercase tracking-[0.26em] text-white/45">Kategori</p><p className="mt-2.5 text-sm leading-[1.7] text-white/68 md:text-base">{project.category || project.design_category || 'Kategori project belum ditentukan.'}</p></div>{project.problem?.trim() ? <div><p className="font-mono text-[10px] font-black uppercase tracking-[0.26em] text-white/45">Problem</p><p className="mt-2.5 text-sm leading-[1.7] text-white/68 md:text-base">{truncateText(project.problem, 110)}</p></div> : null}</div>
              <Link href={`/karya/${project.slug}`} className="mt-8 inline-flex items-center gap-3 rounded-sm border border-[#D4AF37] bg-[#D4AF37] px-5 py-3 font-mono text-xs font-black uppercase tracking-[0.18em] text-black transition hover:bg-[#E2C866]">Lihat Studi Kasus <MoveRight size={18} className="transition group-hover:translate-x-1" /></Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
