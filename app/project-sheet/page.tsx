import type { Metadata } from 'next';
import Link from 'next/link';

import ProjectSheetDocument from '@/components/project-sheet-document';
import { getPublishedProjects } from '@/lib/projects';
import { absoluteUrl } from '@/lib/site-url';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Project Sheet | Eryawan Agung Trimuda',
  description: 'Pilihan karya desain Eryawan Agung Trimuda, mencakup arsitektur dan interior dengan pendekatan yang merespons konteks, bentuk, dan pengalaman ruang.',
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
