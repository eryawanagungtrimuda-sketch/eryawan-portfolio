'use client';

import { MoveLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

type BackButtonProps = {
  label: string;
  fallbackHref: string;
  className?: string;
};

export default function BackButton({ label, fallbackHref, className = '' }: BackButtonProps) {
  const router = useRouter();

  function handleBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  }

  return (
    <button
      type="button"
      onClick={handleBack}
      className={`inline-flex items-center gap-3 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-white/48 transition duration-300 hover:-translate-x-0.5 hover:text-[#C8A951] ${className}`}
    >
      <MoveLeft size={15} />
      {label}
    </button>
  );
}
