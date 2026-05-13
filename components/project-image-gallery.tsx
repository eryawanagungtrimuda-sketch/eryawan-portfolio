'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { getAreaTagLabel } from '@/lib/area-tags';
import { getGalleryImageFrameStyle, getGalleryImageStyle } from '@/lib/project-image-display';

type GalleryImage = { src: string; alt: string; area_tags?: string[] | null; display_ratio?: string | null; object_position?: string | null; crop_x?: number | null; crop_y?: number | null; crop_zoom?: number | null };

function normalizeImageSrc(src?: string | null) {
  return (src || '').trim().replace(/[?#].*$/, '').replace(/\/$/, '');
}

export default function ProjectImageGallery({ images, projectTitle, coverImage }: { images: GalleryImage[]; projectTitle: string; coverImage?: string | null }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const combinedImages = useMemo(() => {
    const normalizedImages = images
      .map((image) => ({ ...image, src: image.src?.trim() || '' }))
      .filter((image) => Boolean(image.src));

    const normalizedCover = normalizeImageSrc(coverImage);
    const coverMatch = normalizedCover
      ? normalizedImages.find((image) => normalizeImageSrc(image.src) === normalizedCover)
      : undefined;

    const baseImages = coverMatch
      ? [coverMatch, ...normalizedImages.filter((image) => image !== coverMatch)]
      : normalizedCover
        ? [{ src: coverImage!.trim(), alt: projectTitle, display_ratio: 'landscape', object_position: 'center' }, ...normalizedImages]
        : normalizedImages;

    const seen = new Set<string>();
    return baseImages.filter((image) => {
      const normalizedSrc = normalizeImageSrc(image.src);
      if (!normalizedSrc || seen.has(normalizedSrc)) return false;
      seen.add(normalizedSrc);
      return true;
    });
  }, [coverImage, images, projectTitle]);

  const availableTags = useMemo(() => {
    const tagMap = new Map<string, string>();
    combinedImages.forEach((image) => {
      (image.area_tags || []).forEach((tag) => {
        const normalized = tag.trim();
        if (!normalized) return;
        if (!tagMap.has(normalized.toLowerCase())) tagMap.set(normalized.toLowerCase(), normalized);
      });
    });
    return Array.from(tagMap.values()).sort((a, b) => a.localeCompare(b));
  }, [combinedImages]);

  const [activeTag, setActiveTag] = useState('All');
  const filteredImages = useMemo(() => {
    if (activeTag === 'All') return combinedImages;
    return combinedImages.filter((image) => (image.area_tags || []).includes(activeTag));
  }, [activeTag, combinedImages]);

  const hasMultiple = filteredImages.length > 1;
  const activeImage = activeIndex !== null ? filteredImages[activeIndex] : null;

  useEffect(() => {
    if (activeIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveIndex(null);
      if (event.key === 'ArrowRight' && hasMultiple) setActiveIndex((prev) => (prev === null ? 0 : (prev + 1) % filteredImages.length));
      if (event.key === 'ArrowLeft' && hasMultiple) setActiveIndex((prev) => (prev === null ? 0 : (prev - 1 + filteredImages.length) % filteredImages.length));
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeIndex, filteredImages.length, hasMultiple]);

  const closeLightbox = () => {
    setActiveIndex(null);
    triggerRef.current?.focus();
  };

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
              {tag === 'All' ? 'Semua' : getAreaTagLabel(tag)}
            </button>
          ))}
        </div>
      ) : null}

      {filteredImages.length > 0 ? (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {filteredImages.map((image, index) => (
              <figure key={`${image.src}-${index}`} className={index === 0 ? 'md:col-span-2' : ''}>
                <button
                  type="button"
                  onClick={(event) => {
                    triggerRef.current = event.currentTarget;
                    setActiveIndex(index);
                  }}
                  className="block w-full rounded-sm border border-white/10 bg-white/[0.02] text-left"
                >
                  <div className="relative w-full overflow-hidden rounded-sm" style={getGalleryImageFrameStyle(image)}>
                    <img
                      src={image.src}
                      alt={image.alt || `${projectTitle} ${index + 1}`}
                      className="absolute inset-0 h-full w-full object-cover"
                      style={getGalleryImageStyle(image)}
                    />
                  </div>
                </button>
              </figure>
            ))}
          </div>

          {activeImage ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-5" role="dialog" aria-modal="true" onClick={closeLightbox}>
              <div className="relative w-full max-w-6xl scale-100 opacity-100 transition duration-200" onClick={(event) => event.stopPropagation()}>
                <img src={activeImage.src} alt={activeImage.alt || projectTitle} className="mx-auto max-h-[84vh] w-auto max-w-full rounded-lg object-contain sm:max-h-[88vh]" />
                <button type="button" aria-label="Tutup lightbox" onClick={closeLightbox} className="absolute right-2 top-2 rounded-full border border-[#D4AF37]/60 bg-black/75 px-3 py-2 font-sans text-xs text-[#D4AF37] transition hover:bg-black/90">Tutup</button>
                {hasMultiple ? (
                  <>
                    <button type="button" aria-label="Gambar sebelumnya" onClick={() => setActiveIndex((prev) => (prev === null ? 0 : (prev - 1 + filteredImages.length) % filteredImages.length))} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-[#D4AF37]/60 bg-black/75 px-3 py-2 font-sans text-xl leading-none text-[#D4AF37] transition hover:bg-black/90">‹</button>
                    <button type="button" aria-label="Gambar berikutnya" onClick={() => setActiveIndex((prev) => (prev === null ? 0 : (prev + 1) % filteredImages.length))} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-[#D4AF37]/60 bg-black/75 px-3 py-2 font-sans text-xl leading-none text-[#D4AF37] transition hover:bg-black/90">›</button>
                  </>
                ) : null}
              </div>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
