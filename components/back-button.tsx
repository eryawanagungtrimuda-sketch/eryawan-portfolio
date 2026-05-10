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
      className={`inline-flex items-center gap-3 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-white/48 transition duration-300 hover:-translate-x-0.5 hover:text-[#C8A951] ${className}`}
    />
  );
}
