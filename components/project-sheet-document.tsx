import Image from 'next/image';

import type { ProjectWithArchiveImages } from '@/lib/types';

type Props = {
  projects: ProjectWithArchiveImages[];
  preview?: boolean;
};

function projectConcept(project: ProjectWithArchiveImages) {
  return project.keputusan_desain || project.pendekatan || project.solution || project.konteks || project.problem;
}

function projectCover(project: ProjectWithArchiveImages) {
  return project.cover_image || project.archive_images?.find((image) => image.image_url)?.image_url || null;
}

export default function ProjectSheetDocument({ projects, preview = false }: Props) {
  return (
    <article className={`project-sheet-document${preview ? ' project-sheet-preview-paper' : ''}`}>
      <div className="project-sheet-watermark" aria-hidden="true">EA</div>
      <header className="project-sheet-heading">
        <div>
          <p className="project-sheet-kicker">Selected interior works · Project sheet</p>
          <h1>Spaces shaped<br />with intention.</h1>
        </div>
        <p className="project-sheet-intro">
          A concise selection of interior projects by Eryawan Agung Trimuda, presented through context, style, and design direction.
        </p>
      </header>

      <div className="project-sheet-list">
        {projects.length > 0 ? projects.map((project, index) => {
          const cover = projectCover(project);
          const concept = projectConcept(project);
          const number = String(index + 1).padStart(2, '0');

          return (
            <section className="project-sheet-project" key={project.id}>
              <div className="project-sheet-image">
                {cover ? (
                  <Image
                    src={cover}
                    alt={`Cover ${project.title}`}
                    fill
                    sizes={preview ? '130mm' : '(min-width: 768px) 58vw, 100vw'}
                    className="object-cover"
                    priority={index === 0}
                  />
                ) : (
                  <div className="project-sheet-image-fallback" aria-label="Cover project belum tersedia">
                    <span>{number}</span>
                    <small>Image forthcoming</small>
                  </div>
                )}
              </div>

              <div className="project-sheet-details">
                <p className="project-sheet-number">{number}</p>
                <h2>{project.title}</h2>
                <dl>
                  {project.completion_year ? <div><dt>Year</dt><dd>{project.completion_year}</dd></div> : null}
                  {project.design_style ? <div><dt>Style</dt><dd>{project.design_style}</dd></div> : null}
                  {concept ? <div className="project-sheet-concept"><dt>Concept</dt><dd>{concept}</dd></div> : null}
                </dl>
              </div>
            </section>
          );
        }) : (
          <p className="project-sheet-empty">The project selection is currently being curated.</p>
        )}
      </div>

      <footer className="project-sheet-authorship">
        <span>ERYAWAN AGUNG TRIMUDA</span>
        <span>ERYAWAN STUDIO</span>
        <span>eryawanagung.my.id</span>
      </footer>
    </article>
  );
}
