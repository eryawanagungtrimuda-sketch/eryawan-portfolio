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
    <button
      type="button"
      aria-label="Panel admin"
      // Keep admin-only visibility from `isAdmin`, but force the trigger to render on mobile
      // with an explicit inline-block display so it no longer disappears in small breakpoints.
      className="inline-block select-none text-[9px] tracking-[0.28em] text-white/45 transition hover:text-[#C8A951]/55 focus-visible:text-[#C8A951]/75 focus-visible:outline-none"
      onClick={() => {
        window.location.href = '/admin';
      }}
    >
      Panel
    </button>
  );
}
