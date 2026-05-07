'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { MouseEvent, ReactNode } from 'react';

type SmartBackLinkProps = {
  fallbackHref: string;
  children?: ReactNode;
  label?: string;
  className?: string;
};

export default function SmartBackLink({ fallbackHref, children, label, className }: SmartBackLinkProps) {
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();

    const hasHistory = window.history.length > 1;
    const referrer = document.referrer;
    const hasSameOriginReferrer = referrer ? new URL(referrer).origin === window.location.origin : false;

    if (hasHistory || hasSameOriginReferrer) {
      router.back();
      return;
    }

    router.push(fallbackHref);
  };

  return (
    <Link href={fallbackHref} onClick={handleClick} className={className}>
      {children ?? label}
    </Link>
  );
}
