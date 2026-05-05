'use client';

import { useEffect, useMemo, useState } from 'react';

type LightboxImage = {
  src: string;
  alt: string;
};

type ProjectImageLightboxProps = {
  images: LightboxImage[];
  projectTitle?: string;
};

export default function ProjectImageLightbox({ images, projectTitle }: ProjectImageLightboxProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const totalImages = images.length;

  const activeImage = useMemo(() => {
    if (activeIndex === null) return null;
    return images[activeIndex] || null;
  }, [activeIndex, images]);

  useEffect(() => {
    if (activeIndex === null) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setActiveIndex(null);
      }
      if (event.key === 'ArrowRight' && totalImages > 1) {
        setActiveIndex((prev) => (prev === null ? 0 : (prev + 1) % totalImages));
      }
      if (event.key === 'ArrowLeft' && totalImages > 1) {
        setActiveIndex((prev) => (prev === null ? 0 : (prev - 1 + totalImages) % totalImages));
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIndex, totalImages]);

  if (totalImages === 0) return null;

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        {images.map((image, index) => (
          <figure key={`${image.src}-${index}`} className={index === 0 ? 'md:col-span-2' : ''}>
            <button
              type="button"
              onClick={() => setActiveIndex(index)}
              className="block w-full overflow-hidden rounded-sm border border-white/10 bg-white/[0.02] text-left"
            >
              <img src={image.src} alt={image.alt} className={index === 0 ? 'aspect-[16/9] w-full object-cover' : 'aspect-[4/3] w-full object-cover'} />
            </button>
            {image.alt && image.alt !== projectTitle ? <figcaption className="mt-3 text-sm leading-6 text-white/46">{image.alt}</figcaption> : null}
          </figure>
        ))}
      </div>

      {activeImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveIndex(null)}
        >
          <div className="relative flex max-h-full w-full max-w-6xl items-center justify-center" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              aria-label="Close lightbox"
              onClick={() => setActiveIndex(null)}
              className="absolute right-2 top-2 z-10 rounded-sm border border-white/20 bg-black/60 px-3 py-1 text-xs font-bold uppercase tracking-[0.1em] text-white"
            >
              Close
            </button>

            {totalImages > 1 ? (
              <button
                type="button"
                aria-label="Previous image"
                onClick={() => setActiveIndex((prev) => (prev === null ? 0 : (prev - 1 + totalImages) % totalImages))}
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-sm border border-white/20 bg-black/60 px-3 py-2 text-white"
              >
                Prev
              </button>
            ) : null}

            <img src={activeImage.src} alt={activeImage.alt} className="max-h-[90vh] max-w-[92vw] object-contain" />

            {totalImages > 1 ? (
              <button
                type="button"
                aria-label="Next image"
                onClick={() => setActiveIndex((prev) => (prev === null ? 0 : (prev + 1) % totalImages))}
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-sm border border-white/20 bg-black/60 px-3 py-2 text-white"
              >
                Next
              </button>
            ) : null}
          </div>

          {activeImage.alt && activeImage.alt !== projectTitle ? (
            <p className="pointer-events-none absolute bottom-6 left-1/2 w-full max-w-3xl -translate-x-1/2 px-6 text-center text-sm text-white/70">{activeImage.alt}</p>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
