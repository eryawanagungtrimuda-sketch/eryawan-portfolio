'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

const navItems = [
  { href: '/', label: 'Beranda' },
  { href: '/karya', label: 'Karya' },
  { href: '/wawasan', label: 'Wawasan' },
  { href: '/tentang', label: 'Tentang' },
  { href: '/kontak', label: 'Kontak' },
];

const hiddenPrefixes = ['/admin', '/editor', '/compose', '/login'];
const allowedRoutes = ['/karya', '/wawasan', '/kontak'];

function isPublicRoute(pathname: string) {
  if (hiddenPrefixes.some((prefix) => pathname.startsWith(prefix))) return false;
  if (pathname.startsWith('/api')) return false;
  return true;
}

function isAllowedRoute(pathname: string) {
  return allowedRoutes.includes(pathname);
}

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MobilePublicNav() {
  const pathname = usePathname() || '/';
  const [hasOpenModal, setHasOpenModal] = useState(false);

  const shouldHide = useMemo(() => !isPublicRoute(pathname) || !isAllowedRoute(pathname), [pathname]);

  useEffect(() => {
    const computeModalOpen = () => {
      setHasOpenModal(Boolean(document.querySelector('[role="dialog"][aria-modal="true"]')));
    };

    computeModalOpen();
    const observer = new MutationObserver(computeModalOpen);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['aria-modal', 'role'] });

    return () => observer.disconnect();
  }, []);

  if (shouldHide || hasOpenModal) return null;

  return (
    <nav
      aria-label="Navigasi cepat mobile"
      className="fixed bottom-[max(1rem,calc(env(safe-area-inset-bottom)+0.5rem))] left-1/2 z-40 w-[min(94vw,32rem)] -translate-x-1/2 md:hidden"
    >
      <div className="flex items-center justify-between gap-1 rounded-full border border-[#C8A951]/30 bg-[#0d0c0a]/90 p-1.5 shadow-[0_14px_30px_rgba(0,0,0,0.42)] backdrop-blur-xl">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex min-h-9 flex-1 items-center justify-center rounded-full px-2 py-2 text-[0.7rem] font-sans font-semibold uppercase tracking-[0.08em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807] ${
                active
                  ? 'bg-[#C8A951]/16 text-[#D4AF37]'
                  : 'text-white/78 hover:bg-white/5 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
