'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { isAllowedAdminEmail } from '@/lib/admin-auth';
import SocialComposerModal from '@/components/social-composer-modal';

type Props = {
  slug: string;
};

export default function WawasanAdminActions({ slug }: Props) {
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
    <div className="pointer-events-none fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
      <div className="pointer-events-auto">
        <SocialComposerModal
          contentType="wawasan"
          slug={slug}
          buttonClassName="inline-flex items-center justify-center rounded-full border border-[#D4AF37]/60 bg-[#0B0A08]/90 px-7 py-3 font-sans text-sm font-semibold text-[#E2C866] shadow-[0_16px_40px_rgba(0,0,0,0.45)] backdrop-blur transition motion-safe:duration-300 hover:border-[#D4AF37]/80 hover:bg-[#0B0A08]"
        />
      </div>
    </div>
  );
}
