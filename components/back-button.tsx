'use client';

import ContextualBackButton from '@/components/contextual-back-button';

type BackButtonProps = {
  label?: string;
  fallbackHref: string;
  className?: string;
};

export default function BackButton({ label = '← Kembali ke Sebelumnya', fallbackHref, className = '' }: BackButtonProps) {
  return (
    <ContextualBackButton
      fallbackHref={fallbackHref}
      label={label}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-2.5 text-center font-sans text-sm font-semibold leading-none text-white/80 transition duration-300 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 hover:text-[#D4AF37] ${className}`}
    />
  );
}
