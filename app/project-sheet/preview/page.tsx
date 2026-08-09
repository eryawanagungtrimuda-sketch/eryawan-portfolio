import type { Metadata } from 'next';
import Link from 'next/link';

import ProjectSheetDocument from '@/components/project-sheet-document';
import ProjectSheetPrintButton from '@/components/project-sheet-print-button';
import { getPublishedProjects } from '@/lib/projects';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'Preview Project Sheet | Eryawan Agung Trimuda', robots: { index: false, follow: true } };

export default async function ProjectSheetPreviewPage() {
  const projects = await getPublishedProjects();
  return (
    <main id="main-content" className="project-sheet-page">
      <nav className="project-sheet-toolbar" aria-label="Project Sheet preview controls">
        <Link href="/project-sheet">← Back to Project Sheet</Link>
        <ProjectSheetPrintButton />
      </nav>
      <p className="project-sheet-preview-label">A4 portrait preview</p>
      <ProjectSheetDocument projects={projects} preview />
    </main>
  );
}
