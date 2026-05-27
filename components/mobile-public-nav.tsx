'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Compass, Home, Lightbulb, Mail, UserRound } from 'lucide-react';

const navItems = [
  { href: '/', label: 'Beranda', icon: Home },
  { href: '/karya', label: 'Karya', icon: Compass },
  { href: '/wawasan', label: 'Wawasan', icon: Lightbulb },
  { href: '/tentang', label: 'Tentang', icon: UserRound },
  { href: '/kontak', label: 'Kontak', icon: Mail },
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
    <nav aria-label="Navigasi cepat mobile" className="fixed bottom-[max(5.5rem,calc(env(safe-area-inset-bottom)+5rem))] right-3 z-40 md:hidden">
      <div className="flex flex-col gap-2 rounded-2xl border border-white/15 bg-[#0d0c0a]/88 p-2 backdrop-blur-xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              aria-label={item.label}
              className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807] ${
                active
                  ? 'border border-[#D4AF37]/45 bg-[#D4AF37]/10 text-[#D4AF37]'
                  : 'border border-transparent text-white/70 hover:border-white/15 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
