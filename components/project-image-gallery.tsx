'use client';

import { useMemo, useState } from 'react';
import ProjectImageLightbox from './project-image-lightbox';

type GalleryImage = { src: string; alt: string; area_tags?: string[] | null };

export default function ProjectImageGallery({ images, projectTitle }: { images: GalleryImage[]; projectTitle: string }) {
  const availableTags = useMemo(() => {
    const tagMap = new Map<string, string>();
    images.forEach((image) => {
      (image.area_tags || []).forEach((tag) => {
        const normalized = tag.trim();
        if (!normalized) return;
        if (!tagMap.has(normalized.toLowerCase())) tagMap.set(normalized.toLowerCase(), normalized);
      });
    });
    return Array.from(tagMap.values()).sort((a, b) => a.localeCompare(b));
  }, [images]);

  const [activeTag, setActiveTag] = useState('All');
  const filteredImages = useMemo(() => {
    if (activeTag === 'All') return images;
    return images.filter((image) => (image.area_tags || []).includes(activeTag));
  }, [activeTag, images]);

  return (
    <div>
      {availableTags.length > 0 ? (
        <div className="mb-6 flex flex-wrap gap-2">
          {['All', ...availableTags].map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => setActiveTag(tag)}
              className={`rounded-full border px-3 py-1 text-xs transition ${activeTag === tag ? 'border-[#D4AF37]/60 bg-[#D4AF37]/15 text-[#D4AF37]' : 'border-white/20 text-white/70 hover:border-[#D4AF37]/35 hover:text-[#D4AF37]'}`}
            >
              {tag}
            </button>
          ))}
        </div>
      ) : null}
      <ProjectImageLightbox images={filteredImages.map((image) => ({ src: image.src, alt: image.alt }))} projectTitle={projectTitle} />
    </div>
  );
}
