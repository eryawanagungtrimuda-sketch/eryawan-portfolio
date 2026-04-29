'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminEmail, createSupabaseBrowserClient } from '@/lib/supabase';

export default function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkSession() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        const email = data.user?.email?.toLowerCase();
        const isAllowed = Boolean(email && email === adminEmail.toLowerCase());

        if (!mounted) return;
        setAllowed(isAllowed);
        setReady(true);

        if (!isAllowed) router.replace('/admin/login');
      } catch {
        if (!mounted) return;
        setAllowed(false);
        setReady(true);
        router.replace('/admin/login');
      }
    }

    checkSession();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (!ready) {
    return (
      <main id="admin-shell" className="min-h-screen bg-[#080807] px-5 py-10 text-[#F4F1EA] md:px-10">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-white/45">Memeriksa sesi admin...</p>
      </main>
    );
  }

  if (!allowed) {
    return (
      <main id="admin-shell" className="min-h-screen bg-[#080807] px-5 py-10 text-[#F4F1EA] md:px-10">
        <Link href="/admin/login" className="text-[#D4AF37]">Masuk admin</Link>
      </main>
    );
  }

  return <>{children}</>;
}
