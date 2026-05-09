'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

type InsightLightboxImage = {
  src: string;
  alt?: string | null;
  caption?: string | null;
};

type InsightImageLightboxProps = {
  title: string;
  coverImage?: InsightLightboxImage | null;
  galleryImages: InsightLightboxImage[];
};

export default function InsightImageLightbox({ title, coverImage, galleryImages }: InsightImageLightboxProps) {
  const images = useMemo(() => {
    const list: InsightLightboxImage[] = [];
    if (coverImage?.src) list.push(coverImage);
    for (const image of galleryImages) {
      if (!image.src) continue;
      list.push(image);
    }
    return list;
  }, [coverImage, galleryImages]);

  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);

  const activeImage = activeIndex === null ? null : images[activeIndex] || null;
  const hasMultiple = images.length > 1;

  useEffect(() => {
    if (activeIndex === null) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveIndex(null);
      if (event.key === 'ArrowRight' && hasMultiple) {
        setActiveIndex((prev) => (prev === null ? 0 : (prev + 1) % images.length));
      }
      if (event.key === 'ArrowLeft' && hasMultiple) {
        setActiveIndex((prev) => (prev === null ? 0 : (prev - 1 + images.length) % images.length));
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeIndex, hasMultiple, images.length]);

  const resolvedAlt = (image?: InsightLightboxImage | null, index?: number) => {
    if (!image) return title;
    return image.alt || image.caption || (typeof index === 'number' ? `${title} ${index + 1}` : title);
  };

  return (
    <>
      {coverImage?.src ? (
        <div className="mt-8 overflow-hidden rounded-xl border border-white/10 sm:mt-10">
          <button
            type="button"
            onClick={() => setActiveIndex(0)}
            className="block w-full bg-black/30 text-left transition duration-200 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/70"
            aria-label="Buka gambar utama dalam lightbox"
          >
            <img src={coverImage.src} alt={resolvedAlt(coverImage, 0)} className="h-auto max-h-[380px] w-full object-cover sm:max-h-[520px]" />
          </button>
        </div>
      ) : null}

      {galleryImages.length > 0 ? (
        <section className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-4">
          {galleryImages.slice(0, 4).map((img, idx) => {
            const mappedIndex = coverImage?.src ? idx + 1 : idx;
            return (
              <div key={`${img.src}-${idx}`} className="overflow-hidden rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={() => setActiveIndex(mappedIndex)}
                  className="block w-full bg-black/30 transition duration-200 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/70"
                  aria-label={`Buka gambar ${idx + 1} dalam lightbox`}
                >
                  <img src={img.src} alt={resolvedAlt(img, idx + 1)} className="h-32 w-full object-cover sm:h-40" />
                </button>
              </div>
            );
          })}
        </section>
      ) : null}

      {activeImage ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 sm:p-5"
          role="dialog"
          aria-modal="true"
          onClick={() => setActiveIndex(null)}
        >
          <div
            className="relative w-full max-w-6xl scale-100 opacity-100 transition duration-200"
            onClick={(event) => event.stopPropagation()}
          >
            <img src={activeImage.src} alt={resolvedAlt(activeImage, activeIndex ?? undefined)} className="mx-auto max-h-[84vh] w-auto max-w-full rounded-lg object-contain sm:max-h-[88vh]" />

            <button
              ref={closeButtonRef}
              type="button"
              aria-label="Tutup lightbox"
              onClick={() => setActiveIndex(null)}
              className="absolute right-2 top-2 rounded-full border border-[#D4AF37]/60 bg-black/75 px-3 py-2 font-sans text-xs text-[#D4AF37]"
            >
              Tutup
            </button>

            {hasMultiple ? (
              <>
                <button
                  type="button"
                  aria-label="Gambar sebelumnya"
                  onClick={() => setActiveIndex((prev) => (prev === null ? 0 : (prev - 1 + images.length) % images.length))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-[#D4AF37]/60 bg-black/75 px-3 py-2 font-sans text-xl leading-none text-[#D4AF37]"
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Gambar berikutnya"
                  onClick={() => setActiveIndex((prev) => (prev === null ? 0 : (prev + 1) % images.length))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-[#D4AF37]/60 bg-black/75 px-3 py-2 font-sans text-xl leading-none text-[#D4AF37]"
                >
                  ›
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
