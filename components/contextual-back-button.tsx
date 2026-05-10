'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';

type ContextualBackButtonProps = {
  fallbackHref: string;
  label?: string;
  className?: string;
};

export default function ContextualBackButton({
  fallbackHref,
  label = '← Kembali ke Sebelumnya',
  className,
}: ContextualBackButtonProps) {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const referrer = document.referrer;
    const hasSameOriginReferrer = referrer.startsWith(window.location.origin);

    if (hasSameOriginReferrer) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  return (
    <Link href={fallbackHref} onClick={handleClick} className={className}>
      {label}
    </Link>
  );
}
