'use client';

import { useEffect, useState } from 'react';
import { isAllowedAdminEmail } from '@/lib/admin-auth';
import { createSupabaseBrowserClient, isSupabaseConfigured } from '@/lib/supabase';

const adminPanelLink = process.env.NEXT_PUBLIC_ADMIN_PANEL_URL || '/admin/dashboard';

export default function MobileAdminQuickAccess() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsAdmin(false);
      return;
    }

    const supabase = createSupabaseBrowserClient();

    // Initial auth check: only show button when current logged-in user email is an allowed admin email.
    supabase.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email;
      setIsAdmin(isAllowedAdminEmail(email));
    });

    // Keep visibility in sync after login/logout or token refresh events.
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email;
      setIsAdmin(isAllowedAdminEmail(email));
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Hide entire sticky container for guests/non-admin users.
  if (!isAdmin) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-40 px-4 md:hidden">
      <a
        href={adminPanelLink}
        aria-label="Buka panel admin"
        className="mobile-admin-quick-access pointer-events-auto mx-auto flex min-h-11 w-full max-w-xs items-center justify-center rounded-full border border-[#D4AF37]/45 bg-[#0B0B0A]/95 px-5 py-3 font-mono text-xs font-bold uppercase tracking-[0.16em] text-[#D4AF37] shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur transition duration-300 hover:scale-[1.02] hover:shadow-[0_14px_34px_rgba(212,175,55,0.2)] focus-visible:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807] active:scale-[0.98]"
      >
        Panel Admin
      </a>
    </div>
  );
}
