'use client';

import { useMemo, useRef, useState } from 'react';
import InsightImageLightbox, { type InsightLightboxImage } from '@/components/insight-image-lightbox';

interface InsightImageGalleryProps {
  title: string;
  coverImage?: string | null;
  images: InsightLightboxImage[];
}

export default function InsightImageGallery({ title, coverImage, images }: InsightImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const combinedImages = useMemo(() => {
    const list: InsightLightboxImage[] = [];
    if (coverImage) list.push({ image_url: coverImage, alt_text: title });
    for (const image of images) {
      if (image.image_url) list.push(image);
    }
    return list;
  }, [coverImage, images, title]);

  const openLightbox = (index: number, trigger: HTMLElement | null) => {
    triggerRef.current = trigger;
    setActiveIndex(index);
  };

  const closeLightbox = () => {
    setActiveIndex(null);
    triggerRef.current?.focus();
  };

  return (
    <>
      {coverImage ? (
        <div className="mt-8 overflow-hidden rounded-xl border border-white/10 sm:mt-10">
          <button
            type="button"
            onClick={(event) => openLightbox(0, event.currentTarget)}
            className="block w-full bg-black/30 text-left transition duration-200 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/70"
            aria-label="Buka gambar utama dalam lightbox"
          >
            <img src={coverImage} alt={title} className="h-auto max-h-[380px] w-full object-cover sm:max-h-[520px]" decoding="async" />
          </button>
        </div>
      ) : null}

      {images.length > 0 ? (
        <section className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:grid-cols-4">
          {images.slice(0, 4).map((img, idx) => {
            const mappedIndex = coverImage ? idx + 1 : idx;
            return (
              <div key={`${img.image_url}-${idx}`} className="overflow-hidden rounded-lg border border-white/10">
                <button
                  type="button"
                  onClick={(event) => openLightbox(mappedIndex, event.currentTarget)}
                  className="block w-full bg-black/30 transition duration-200 hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/70"
                  aria-label={`Buka gambar ${idx + 1} dalam lightbox`}
                >
                  <img src={img.image_url} alt={img.alt_text || img.caption || `${title} ${idx + 1}`} className="h-32 w-full object-cover sm:h-40" loading="lazy" decoding="async" />
                </button>
              </div>
            );
          })}
        </section>
      ) : null}

      {activeIndex !== null ? (
        <InsightImageLightbox
          images={combinedImages}
          title={title}
          initialIndex={activeIndex}
          onClose={closeLightbox}
          onNavigate={setActiveIndex}
        />
      ) : null}
    </>
  );
}
