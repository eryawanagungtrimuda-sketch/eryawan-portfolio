import Image from 'next/image';
import Link from 'next/link';

import { absoluteUrl } from '@/lib/site-url';
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

function projectGalleryTeaser(project: ProjectWithArchiveImages, cover: string | null) {
  return (project.archive_images || [])
    .filter((image) => image.image_url && image.image_url !== cover)
    .slice(0, 4);
}

export default function ProjectSheetDocument({ projects, preview = false }: Props) {
  return (
    <article className={`project-sheet-document${preview ? ' project-sheet-preview-paper' : ''}`}>
      <div className="project-sheet-watermark" aria-hidden="true">EA</div>
      <header className="project-sheet-heading">
        <div>
          <p className="project-sheet-kicker">KARYA DESAIN TERPILIH · PROJECT SHEET</p>
          <h1>Bentuk yang bermakna, ruang yang berkarakter.</h1>
        </div>
        <p className="project-sheet-intro">
          Pilihan karya desain Eryawan Agung Trimuda, mencakup arsitektur dan interior dengan pendekatan yang merespons konteks, bentuk, dan pengalaman ruang.
        </p>
      </header>

      <div className="project-sheet-list">
        {projects.length > 0 ? projects.map((project, index) => {
          const cover = projectCover(project);
          const galleryTeaser = projectGalleryTeaser(project, cover);
          const concept = projectConcept(project);
          const number = String(index + 1).padStart(2, '0');
          const projectHref = `/karya/${project.slug}`;
          const projectUrl = absoluteUrl(projectHref);

          return (
            <section className="project-sheet-project" key={project.id}>
              <div className="project-sheet-visuals">
                <div className="project-sheet-image">
                  {cover ? (
                    <Image
                      src={cover}
                      alt={`Cover ${project.title}`}
                      fill
                      sizes={preview ? '130mm' : '(min-width: 768px) 58vw, 100vw'}
                      quality={90}
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

                <div className="project-sheet-teaser-row">
                  {galleryTeaser.length > 0 ? (
                    <div className="project-sheet-gallery" aria-label={`Gallery teaser ${project.title}`}>
                      {galleryTeaser.map((image, imageIndex) => (
                        <div className="project-sheet-gallery-thumbnail" key={image.id}>
                          <Image
                            src={image.image_url!}
                            alt={image.alt_text || `${project.title}, gallery ${imageIndex + 1}`}
                            fill
                            sizes="96px"
                            quality={85}
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                  <div className="project-sheet-project-link">
                    <Link href={projectHref}>LIHAT PROYEK LENGKAP →</Link>
                    <span>{projectUrl.replace(/^https?:\/\//, '')}</span>
                  </div>
                </div>
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
