import type { Metadata } from 'next';

import ProjectSheetCustomizer from '@/components/project-sheet-customizer';
import { getPublishedProjects } from '@/lib/projects';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Custom Project Sheet | Eryawan Agung Trimuda',
  description: 'Pilih dan susun proyek yang paling relevan untuk presentasi portfolio kepada klien.',
  robots: { index: false, follow: true },
};

export default async function CustomizeProjectSheetPage() {
  const projects = await getPublishedProjects();

  return (
    <main id="main-content" className="project-sheet-page psc-page">
      <ProjectSheetCustomizer projects={projects} />
    </main>
  );
}
