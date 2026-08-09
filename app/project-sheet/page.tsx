import type { Metadata } from 'next';
import Link from 'next/link';

import ProjectSheetDocument from '@/components/project-sheet-document';
import { getPublishedProjects } from '@/lib/projects';
import { absoluteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Project Sheet | Eryawan Agung Trimuda',
  description: 'Selected interior design projects by Eryawan Agung Trimuda in a concise editorial project sheet.',
  alternates: { canonical: absoluteUrl('/project-sheet') },
};

export default async function ProjectSheetPage() {
  const projects = await getPublishedProjects();

  return (
    <main id="main-content" className="project-sheet-page">
      <nav className="project-sheet-toolbar" aria-label="Project Sheet navigation">
        <Link href="/karya">← Back to works</Link>
        <Link className="project-sheet-download" href="/project-sheet/preview">Download Project Sheet</Link>
      </nav>
      <ProjectSheetDocument projects={projects} />
    </main>
  );
}
