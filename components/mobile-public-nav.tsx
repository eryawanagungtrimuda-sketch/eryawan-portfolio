'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Beranda' },
  { href: '/karya', label: 'Karya' },
  { href: '/wawasan', label: 'Wawasan' },
  { href: '/kontak', label: 'Kontak' },
];

const hiddenPrefixes = ['/admin', '/editor', '/compose', '/login'];

function isPublicRoute(pathname: string) {
  if (hiddenPrefixes.some((prefix) => pathname.startsWith(prefix))) return false;
  if (pathname.startsWith('/api')) return false;
  return true;
}

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MobilePublicNav() {
  const pathname = usePathname() || '/';

  if (!isPublicRoute(pathname)) return null;

  return (
    <nav aria-label="Navigasi utama mobile" className="fixed inset-x-0 bottom-0 z-40 px-4 pb-[calc(env(safe-area-inset-bottom)+0.8rem)] pt-2 md:hidden">
      <div className="mx-auto flex max-w-md items-center justify-between gap-2 rounded-full border border-white/15 bg-[#0d0c0a]/90 px-2 py-2 backdrop-blur">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`inline-flex min-h-11 flex-1 items-center justify-center rounded-full px-3 py-2 text-center font-sans text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807] ${
                active
                  ? 'border border-[#D4AF37]/45 bg-[#D4AF37]/10 text-[#D4AF37]'
                  : 'border border-transparent text-white/70 hover:border-white/15 hover:text-white'
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
