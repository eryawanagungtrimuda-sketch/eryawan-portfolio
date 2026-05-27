'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Beranda' },
  { href: '/karya', label: 'Karya' },
  { href: '/wawasan', label: 'Wawasan' },
  { href: '/tentang', label: 'Tentang' },
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

export default function PublicStickyHeader() {
  const pathname = usePathname() || '/';

  if (!isPublicRoute(pathname)) return null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#080807]/88 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-5 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex min-h-10 items-center font-display text-base uppercase tracking-[0.08em] text-[#C8A951] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807] sm:text-lg">
          Eryawan Agung
        </Link>

        <nav aria-label="Navigasi utama" className="flex items-center gap-1 md:gap-2">
          {navItems.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-full px-2.5 py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807] sm:px-4 sm:text-sm ${
                  active
                    ? 'bg-[#C8A951]/15 text-[#D4AF37]'
                    : 'text-white/75 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
