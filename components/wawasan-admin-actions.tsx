'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { isAllowedAdminEmail } from '@/lib/admin-auth';
import SocialComposerModal from '@/components/social-composer-modal';
import AdminEditWawasanShortcut from '@/components/admin-edit-wawasan-shortcut';

type Props = {
  insightId: string;
  slug: string;
};

export default function WawasanAdminActions({ insightId, slug }: Props) {
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAdminSession() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        if (!mounted) return;
        setIsAdmin(isAllowedAdminEmail(data.user?.email));
      } catch {
        if (!mounted) return;
        setIsAdmin(false);
      } finally {
        if (mounted) setReady(true);
      }
    }

    checkAdminSession();
    return () => {
      mounted = false;
    };
  }, []);

  if (!ready || !isAdmin) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 md:left-auto md:right-6 md:w-auto">
      <div className="mx-auto flex max-w-md items-center gap-2 rounded-2xl border border-white/10 bg-[#090908]/85 p-2 shadow-[0_0_0_1px_rgba(255,255,255,0.04),0_10px_25px_rgba(0,0,0,0.45)] backdrop-blur md:mx-0 md:max-w-none">
        <SocialComposerModal
          contentType="wawasan"
          slug={slug}
          wrapperClassName="contents"
          buttonClassName="font-sans inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-[#D4AF37]/70 bg-[#D4AF37]/20 px-4 py-2.5 text-sm font-semibold text-[#E6C676] transition motion-safe:duration-300 hover:bg-[#D4AF37]/30 md:flex-none"
        />
        <AdminEditWawasanShortcut
          insightId={insightId}
          className="premium-interactive inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border border-white/20 bg-white/[0.02] px-4 py-2.5 text-center font-sans text-sm leading-none text-white/80 transition motion-safe:duration-300 hover:border-[#D4AF37]/45 hover:bg-white/[0.05] hover:text-[#D4AF37] md:flex-none"
        />
      </div>
    </div>
  );
}
