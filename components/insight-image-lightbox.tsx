'use client';

import { useEffect, useRef } from 'react';

export type InsightLightboxImage = {
  image_url: string;
  alt_text?: string | null;
  caption?: string | null;
};

interface InsightImageLightboxProps {
  images: InsightLightboxImage[];
  title: string;
  initialIndex?: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export default function InsightImageLightbox({ images, title, initialIndex = 0, onClose, onNavigate }: InsightImageLightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const hasMultiple = images.length > 1;
  const activeImage = images[initialIndex] ?? null;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight' && hasMultiple) onNavigate((initialIndex + 1) % images.length);
      if (event.key === 'ArrowLeft' && hasMultiple) onNavigate((initialIndex - 1 + images.length) % images.length);
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [hasMultiple, images.length, initialIndex, onClose, onNavigate]);

  if (!activeImage) return null;

  const resolvedAlt = activeImage.alt_text || activeImage.caption || `${title} ${initialIndex + 1}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-5" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="relative w-full max-w-6xl scale-100 opacity-100 transition duration-200" onClick={(event) => event.stopPropagation()}>
        <img src={activeImage.image_url} alt={resolvedAlt} className="mx-auto max-h-[84vh] w-auto max-w-full rounded-lg object-contain sm:max-h-[88vh]" />

        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Tutup lightbox"
          onClick={onClose}
          className="absolute right-2 top-2 rounded-full border border-[#D4AF37]/60 bg-black/75 px-3 py-2 font-sans text-xs text-[#D4AF37] transition hover:bg-black/90"
        >
          Tutup
        </button>

        {hasMultiple ? (
          <>
            <button
              type="button"
              aria-label="Gambar sebelumnya"
              onClick={() => onNavigate((initialIndex - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-[#D4AF37]/60 bg-black/75 px-3 py-2 font-sans text-xl leading-none text-[#D4AF37] transition hover:bg-black/90"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="Gambar berikutnya"
              onClick={() => onNavigate((initialIndex + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-[#D4AF37]/60 bg-black/75 px-3 py-2 font-sans text-xl leading-none text-[#D4AF37] transition hover:bg-black/90"
            >
              ›
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
}
