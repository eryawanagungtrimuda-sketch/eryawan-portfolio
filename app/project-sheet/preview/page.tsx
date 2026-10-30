import type { Metadata } from 'next';
import Link from 'next/link';

import ProjectSheetDocument from '@/components/project-sheet-document';
import ProjectSheetPrintButton from '@/components/project-sheet-print-button';
import { getPublishedProjects } from '@/lib/projects';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Preview Project Sheet | Eryawan Agung Trimuda', robots: { index: false, follow: true } };

type Props = {
  searchParams?: {
    projects?: string;
    title?: string;
  };
};

export default async function ProjectSheetPreviewPage({ searchParams }: Props) {
  const allProjects = await getPublishedProjects();
  const hasCustomSelection = typeof searchParams?.projects === 'string';
  const requestedIds = hasCustomSelection
    ? searchParams!.projects!.split(',').map((id) => id.trim()).filter(Boolean)
    : [];
  const projects = hasCustomSelection
    ? requestedIds
        .map((id) => allProjects.find((project) => project.id === id))
        .filter((project): project is (typeof allProjects)[number] => Boolean(project))
    : allProjects;
  const sheetTitle = searchParams?.title?.trim().slice(0, 80) || undefined;
  const sheetIntro = sheetTitle
    ? 'Koleksi proyek terkurasi yang disusun khusus untuk kebutuhan presentasi klien.'
    : undefined;

  return (
    <main id="main-content" className="project-sheet-page">
      <nav className="project-sheet-toolbar" aria-label="Project Sheet preview controls">
        <Link href={hasCustomSelection ? '/project-sheet/customize' : '/project-sheet'}>
          ← {hasCustomSelection ? 'Back to selection' : 'Back to Project Sheet'}
        </Link>
        <ProjectSheetPrintButton />
      </nav>
      <p className="project-sheet-preview-label">
        A4 portrait preview{hasCustomSelection ? ` · ${projects.length} selected projects` : ''}
      </p>
      <ProjectSheetDocument projects={projects} preview sheetTitle={sheetTitle} sheetIntro={sheetIntro} />
    </main>
  );
}
