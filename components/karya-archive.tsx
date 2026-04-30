'use client';

import Link from 'next/link';
import { MoveRight, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Project } from '@/lib/types';

type Props = { projects: Project[] };
type SortOption = 'newest' | 'oldest' | 'az';

type FilterKey = 'designCategory' | 'designStyle' | 'areaType';

function getProjectDate(project: Project) {
  const time = new Date(project.created_at).getTime();
  return Number.isFinite(time) ? time : 0;
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

function FilterChips({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return (
    <div>
      <p className="mb-3 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-white/38">{label}</p>
      <div className="flex flex-wrap gap-3">
        {options.map((item) => {
          const active = item === value;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              className={`rounded-full border px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] transition duration-300 ${
                active
                  ? 'border-[#D4AF37]/55 bg-[#D4AF37]/12 text-[#D4AF37]'
                  : 'border-white/10 text-white/45 hover:border-[#D4AF37]/35 hover:text-[#D4AF37]'
              }`}
            >
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
  return (
    <span className="rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
      {children}
    </span>
  );
}

export default function KaryaArchive({ projects }: Props) {
  const [search, setSearch] = useState('');
  const [designCategory, setDesignCategory] = useState('Semua');
  const [designStyle, setDesignStyle] = useState('Semua');
  const [areaType, setAreaType] = useState('Semua');
  const [sort, setSort] = useState<SortOption>('newest');

  const filterOptions = useMemo(() => ({
    designCategory: uniqueOptions(projects, 'design_category'),
    designStyle: uniqueOptions(projects, 'design_style'),
    areaType: uniqueOptions(projects, 'area_type'),
  }), [projects]);

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();

    return projects
      .filter((project) => {
        const matchesSearch = !query || project.title.toLowerCase().includes(query);
        const matchesDesignCategory = designCategory === 'Semua' || project.design_category === designCategory;
        const matchesDesignStyle = designStyle === 'Semua' || project.design_style === designStyle;
        const matchesAreaType = areaType === 'Semua' || project.area_type === areaType;
        return matchesSearch && matchesDesignCategory && matchesDesignStyle && matchesAreaType;
      })
      .sort((a, b) => {
        if (sort === 'oldest') return getProjectDate(a) - getProjectDate(b);
        if (sort === 'az') return a.title.localeCompare(b.title);
        return getProjectDate(b) - getProjectDate(a);
      });
  }, [areaType, designCategory, designStyle, projects, search, sort]);

  if (projects.length === 0) {
    return (
      <section className="pb-24">
        <div className="flex min-h-[320px] items-center justify-center rounded-sm border border-white/10 bg-white/[0.018] p-8 text-center md:p-12">
          <div className="max-w-xl">
            <p className="font-display text-4xl font-normal leading-[1.08] tracking-[-0.035em] text-white/90 md:text-5xl">Belum ada karya</p>
            <p className="mx-auto mt-5 max-w-lg text-base leading-7 text-white/52 md:text-lg">
              Portfolio sedang disiapkan. Project yang dipublikasikan dari CMS akan tampil di halaman ini.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="pb-24">
      <div className="rounded-sm border border-white/10 bg-white/[0.018] p-5 md:p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <label className="mb-3 block font-mono text-[10px] font-black uppercase tracking-[0.24em] text-white/38">Search by Title</label>
            <div className="flex items-center gap-3 rounded-sm border border-white/10 bg-black/20 px-4 py-3 transition duration-300 focus-within:border-[#D4AF37]/45">
              <Search size={17} className="text-white/36" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari judul project..."
                className="w-full bg-transparent text-sm text-white/80 outline-none placeholder:text-white/30"
              />
            </div>
          </div>

          <div className="min-w-[190px]">
            <label className="mb-3 block font-mono text-[10px] font-black uppercase tracking-[0.24em] text-white/38">Sort</label>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortOption)}
              className="w-full rounded-sm border border-white/10 bg-[#090909] px-4 py-3 text-sm text-white/72 outline-none transition duration-300 hover:border-[#D4AF37]/35 focus:border-[#D4AF37]/45"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="az">A-Z</option>
            </select>
          </div>
        </div>

        <div className="mt-7 grid gap-6">
          <FilterChips label="Kategori Desain" options={filterOptions.designCategory} value={designCategory} onChange={setDesignCategory} />
          <FilterChips label="Gaya Desain" options={filterOptions.designStyle} value={designStyle} onChange={setDesignStyle} />
          <FilterChips label="Area / Ruang" options={filterOptions.areaType} value={areaType} onChange={setAreaType} />
        </div>
      </div>

      {filteredProjects.length === 0 ? (
        <div className="mt-10 flex min-h-[260px] items-center justify-center rounded-sm border border-white/10 bg-white/[0.018] p-8 text-center">
          <p className="max-w-md text-lg leading-8 text-white/58">Tidak ada karya yang sesuai dengan filter ini.</p>
        </div>
      ) : (
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
          {filteredProjects.map((project, index) => (
            <Link
              key={project.id}
              href={`/karya/${project.slug}`}
              className="group relative overflow-hidden rounded-sm border border-white/12 bg-gradient-to-br from-white/[0.035] to-white/[0.012] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#D4AF37]/35 md:p-8"
            >
              {project.cover_image ? (
                <div className="mb-8 aspect-[16/10] overflow-hidden rounded-sm border border-white/10 bg-white/[0.02]">
                  <img src={project.cover_image} alt={project.title} className="h-full w-full object-cover opacity-85 transition duration-500 group-hover:scale-[1.03] group-hover:opacity-100" />
                </div>
              ) : (
                <div className="mb-8 flex aspect-[16/10] items-center justify-center rounded-sm border border-white/10 bg-white/[0.025] text-center text-sm text-white/32">
                  Cover image belum tersedia
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.32em] text-[#D4AF37]">Project {String(index + 1).padStart(2, '0')}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge>{project.design_category}</Badge>
                  <Badge>{project.design_style}</Badge>
                  <Badge>{project.area_type}</Badge>
                </div>
              </div>

              <h2 className="font-display mt-5 max-w-2xl text-4xl font-normal leading-[1.02] tracking-[-0.03em] text-white/92 md:text-5xl">
                {project.title}
              </h2>

              <div className="mt-10 space-y-6 border-t border-white/10 pt-8">
                <div>
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.26em] text-white/45">Problem</p>
                  <p className="mt-3 text-base leading-[1.65] text-white/68 md:text-lg">{truncateText(project.problem || 'Masalah ruang belum didefinisikan.')}</p>
                </div>
                <div>
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.26em] text-white/45">Impact</p>
                  <p className="mt-3 text-base leading-[1.65] text-white/68 md:text-lg">{truncateText(project.impact || 'Ruang menjadi lebih terarah, efisien, dan mudah digunakan.')}</p>
                </div>
              </div>

              <span className="mt-10 inline-flex items-center gap-3 font-mono text-xs font-black uppercase tracking-[0.18em] text-[#D4AF37]">
                Lihat Studi Kasus <MoveRight size={18} className="transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
