'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { isAllowedAdminEmail } from '@/lib/admin-auth';
import SocialComposerModal from '@/components/social-composer-modal';

type Props = {
  slug: string;
  placement?: 'floating-mobile' | 'inline-desktop';
};

export default function WawasanAdminActions({ slug, placement = 'floating-mobile' }: Props) {
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

  const isInlineDesktop = placement === 'inline-desktop';

  return (
    <div className={isInlineDesktop ? 'hidden md:block' : 'pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2 md:hidden'}>
      <div className={isInlineDesktop ? '' : 'pointer-events-auto'}>
        <SocialComposerModal
          contentType="wawasan"
          slug={slug}
          buttonClassName={
            isInlineDesktop
              ? 'inline-flex min-h-11 min-w-[200px] items-center justify-center whitespace-nowrap rounded-full border border-[#D4AF37]/60 bg-[#0B0A08]/85 px-8 py-3 font-sans text-sm font-semibold text-[#E2C866] transition motion-safe:duration-300 hover:border-[#D4AF37]/80 hover:bg-[#0B0A08]'
              : 'inline-flex min-w-[210px] max-w-[calc(100vw-48px)] items-center justify-center whitespace-nowrap rounded-full border border-[#D4AF37]/60 bg-[#0B0A08]/90 px-7 py-3 font-sans text-sm font-semibold text-[#E2C866] shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur transition motion-safe:duration-300 hover:border-[#D4AF37]/80 hover:bg-[#0B0A08]'
          }
        />
      </div>
    </div>
  );
}
