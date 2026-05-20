'use client';

import { useEffect, useState } from 'react';
import { isAllowedAdminEmail } from '@/lib/admin-auth';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase';

export default function AdminFooterShortcut() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsAdmin(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email;
      setIsAdmin(isAllowedAdminEmail(email));
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email;
      setIsAdmin(isAllowedAdminEmail(email));
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  if (!isAdmin) return null;

  return (
    <a
      href="/admin"
      aria-label="Panel admin"
      className="select-none text-[9px] tracking-[0.28em] text-white/[0.05] transition hover:text-[#C8A951]/40 focus-visible:text-[#C8A951]/70 focus-visible:outline-none"
    >
      Panel
    </a>
  );
}
