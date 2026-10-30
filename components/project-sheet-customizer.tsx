'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, FileDown, Search, X } from 'lucide-react';

import { dedupeAreaTags } from '@/lib/area-tags';
import { isSupabaseStorageUrl } from '@/lib/is-supabase-storage-url';
import type { ProjectWithArchiveImages } from '@/lib/types';

type Props = {
  projects: ProjectWithArchiveImages[];
};

const allOption = '__all__';
const defaultTitle = 'Selected Interior Portfolio';

function projectCover(project: ProjectWithArchiveImages) {
  return project.cover_image || project.archive_images?.find((image) => image.image_url)?.image_url || null;
}

function projectTags(project: ProjectWithArchiveImages) {
  return dedupeAreaTags([
    ...(project.area_tags || []),
    project.area_type,
    ...(project.archive_images || []).flatMap((image) => image.area_tags || []),
  ]);
}

function projectSearchText(project: ProjectWithArchiveImages) {
  return [
    project.title,
    project.category,
    project.design_category,
    project.design_style,
    project.area_type,
    ...(project.area_tags || []),
    ...projectTags(project),
  ].filter(Boolean).join(' ').toLocaleLowerCase('id-ID');
}

export default function ProjectSheetCustomizer({ projects }: Props) {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(allOption);
  const [areaFilter, setAreaFilter] = useState(allOption);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sheetTitle, setSheetTitle] = useState(defaultTitle);

  const categories = useMemo(
    () => Array.from(new Set(projects.map((project) => project.category?.trim()).filter((value): value is string => Boolean(value)))).sort((a, b) => a.localeCompare(b)),
    [projects],
  );
  const areas = useMemo(
    () => Array.from(new Set(projects.flatMap(projectTags))).sort((a, b) => a.localeCompare(b)),
    [projects],
  );

  const filteredProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('id-ID');
    return projects.filter((project) => {
      if (categoryFilter !== allOption && project.category !== categoryFilter) return false;
      if (areaFilter !== allOption && !projectTags(project).some((tag) => tag.toLocaleLowerCase('id-ID') === areaFilter.toLocaleLowerCase('id-ID'))) return false;
      if (normalizedQuery && !projectSearchText(project).includes(normalizedQuery)) return false;
      return true;
    });
  }, [projects, query, categoryFilter, areaFilter]);

  const selectedProjects = useMemo(
    () => selectedIds.map((id) => projects.find((project) => project.id === id)).filter((project): project is ProjectWithArchiveImages => Boolean(project)),
    [projects, selectedIds],
  );

  function toggleProject(id: string) {
    setSelectedIds((current) => current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]);
  }

  function addFilteredProjects() {
    setSelectedIds((current) => {
      const next = [...current];
      filteredProjects.forEach((project) => {
        if (!next.includes(project.id)) next.push(project.id);
      });
      return next;
    });
  }

  function moveSelected(index: number, direction: -1 | 1) {
    setSelectedIds((current) => {
      const next = [...current];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  }

  function openPreview() {
    if (selectedProjects.length === 0) return;
    const params = new URLSearchParams();
    params.set('projects', selectedProjects.map((project) => project.id).join(','));
    if (sheetTitle.trim()) params.set('title', sheetTitle.trim().slice(0, 80));
    window.location.assign(`/project-sheet/preview?${params.toString()}`);
  }

  return (
    <div className="psc-shell">
      <nav className="psc-toolbar" aria-label="Project Sheet navigation">
        <Link href="/project-sheet">← Back to Project Sheet</Link>
        <span>CLIENT-READY PORTFOLIO</span>
      </nav>

      <header className="psc-intro">
        <p className="psc-kicker">CUSTOM PROJECT SHEET</p>
        <h1>Pilih karya yang paling relevan.</h1>
        <p>Filter berdasarkan kategori dan area, lalu pilih serta susun proyek untuk presentasi klien. PDF hanya akan memuat proyek yang Anda pilih.</p>
      </header>

      <section className="psc-title-field" aria-label="Judul Project Sheet">
        <label htmlFor="psc-title">Judul presentasi</label>
        <input
          id="psc-title"
          value={sheetTitle}
          maxLength={80}
          onChange={(event) => setSheetTitle(event.target.value)}
          placeholder="Contoh: Hospitality Interior Portfolio"
        />
      </section>

      <div className="psc-workspace">
        <section className="psc-library" aria-label="Daftar proyek">
          <div className="psc-section-heading">
            <div>
              <p className="psc-kicker">01 · PROJECT LIBRARY</p>
              <h2>Temukan proyek</h2>
            </div>
            <span className="psc-count">{filteredProjects.length} proyek</span>
          </div>

          <div className="psc-filters">
            <label className="psc-search">
              <Search size={16} aria-hidden="true" />
              <span className="sr-only">Cari proyek</span>
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari nama, gaya, kategori…" />
            </label>
            <label className="psc-filter-field">
              <span>Kategori proyek</span>
              <select
                value={categoryFilter}
                onChange={(event) => {
                  const value = event.target.value;
                  setCategoryFilter(value);
                  if (sheetTitle === defaultTitle && value !== allOption) setSheetTitle(`${value} Portfolio`);
                  if (sheetTitle !== defaultTitle && categories.includes(sheetTitle.replace(/ Portfolio$/, '')) && value === allOption) setSheetTitle(defaultTitle);
                }}
              >
                <option value={allOption}>Semua kategori</option>
                {categories.map((category) => <option key={category} value={category}>{category}</option>)}
              </select>
            </label>
            <label className="psc-filter-field">
              <span>Area / tag</span>
              <select value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)}>
                <option value={allOption}>Semua area</option>
                {areas.map((area) => <option key={area} value={area}>{area}</option>)}
              </select>
            </label>
          </div>

          <div className="psc-filter-actions">
            <p>Centang proyek yang ingin dimasukkan ke PDF.</p>
            <button type="button" onClick={addFilteredProjects} disabled={filteredProjects.length === 0}>Pilih hasil filter</button>
          </div>

          <div className="psc-project-list">
            {filteredProjects.map((project) => {
              const selected = selectedIds.includes(project.id);
              const cover = projectCover(project);
              const tags = projectTags(project).slice(0, 3);
              return (
                <label className={`psc-project-card${selected ? ' is-selected' : ''}`} key={project.id}>
                  <span className="psc-project-check">
                    <input type="checkbox" checked={selected} onChange={() => toggleProject(project.id)} />
                  </span>
                  <span className="psc-project-thumb">
                    {cover ? (
                      <Image
                        src={cover}
                        alt=""
                        fill
                        unoptimized={isSupabaseStorageUrl(cover)}
                        sizes="112px"
                      />
                    ) : <span>EA</span>}
                  </span>
                  <span className="psc-project-copy">
                    <strong>{project.title}</strong>
                    <small>{project.category || project.design_category || 'Kategori belum diisi'}{project.completion_year ? ` · ${project.completion_year}` : ''}</small>
                    {tags.length > 0 ? <span className="psc-tags">{tags.map((tag) => <em key={tag}>{tag}</em>)}</span> : null}
                  </span>
                </label>
              );
            })}
            {filteredProjects.length === 0 ? <p className="psc-empty">Tidak ada proyek yang cocok. Coba ubah kata kunci atau filter.</p> : null}
          </div>
        </section>

        <aside className="psc-selection" aria-label="Urutan proyek terpilih">
          <div className="psc-section-heading">
            <div>
              <p className="psc-kicker">02 · YOUR SELECTION</p>
              <h2>Urutan PDF</h2>
            </div>
            <span className="psc-count">{selectedProjects.length} dipilih</span>
          </div>
          <p className="psc-selection-hint">Gunakan panah untuk mengatur urutan. Proyek di posisi pertama akan muncul lebih awal.</p>

          {selectedProjects.length > 0 ? (
            <ol className="psc-selected-list">
              {selectedProjects.map((project, index) => (
                <li key={project.id}>
                  <span className="psc-selected-number">{String(index + 1).padStart(2, '0')}</span>
                  <span className="psc-selected-name">{project.title}</span>
                  <span className="psc-reorder">
                    <button type="button" aria-label={`Pindahkan ${project.title} ke atas`} onClick={() => moveSelected(index, -1)} disabled={index === 0}><ArrowUp size={14} /></button>
                    <button type="button" aria-label={`Pindahkan ${project.title} ke bawah`} onClick={() => moveSelected(index, 1)} disabled={index === selectedProjects.length - 1}><ArrowDown size={14} /></button>
                    <button type="button" aria-label={`Hapus ${project.title} dari pilihan`} onClick={() => toggleProject(project.id)}><X size={14} /></button>
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <div className="psc-selection-empty">
              <FileDown size={25} aria-hidden="true" />
              <p>Belum ada proyek dipilih.</p>
              <span>Pilih satu atau beberapa proyek di sebelah kiri.</span>
            </div>
          )}

          <div className="psc-selection-footer">
            <button type="button" className="psc-clear" onClick={() => setSelectedIds([])} disabled={selectedIds.length === 0}>Kosongkan pilihan</button>
            <button type="button" className="psc-preview-button" onClick={openPreview} disabled={selectedProjects.length === 0}>
              <FileDown size={16} aria-hidden="true" />
              Preview & unduh PDF ({selectedProjects.length})
            </button>
            <p>Project Sheet lengkap tetap tersedia terpisah. Tidak ada proyek yang diubah atau dihapus dari website.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
