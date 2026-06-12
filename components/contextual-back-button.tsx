'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';

type ContextualBackButtonProps = {
  fallbackHref: string;
  label?: string;
  className?: string;
  ariaLabel?: string;
  preferFallback?: boolean;
};

export default function ContextualBackButton({
  fallbackHref,
  label = '← Kembali ke Sebelumnya',
  className,
  ariaLabel = 'Kembali ke halaman sebelumnya',
  preferFallback = false,
}: ContextualBackButtonProps) {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const referrer = document.referrer;
    const hasSameOriginReferrer = referrer.startsWith(window.location.origin);

    if (!preferFallback && hasSameOriginReferrer) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  const linkClassName = `focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807] ${className ?? ''}`.trim();

  return (
    <Link
      href={fallbackHref}
      onClick={handleClick}
      className={linkClassName}
      aria-label={ariaLabel}
    >
      {label}
    </Link>
  );
}
