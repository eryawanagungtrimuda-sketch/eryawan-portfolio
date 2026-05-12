'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { isAllowedAdminEmail } from '@/lib/admin-auth';

type AdminEditWawasanShortcutProps = {
  insightId?: string | null;
};

export default function AdminEditWawasanShortcut({ insightId }: AdminEditWawasanShortcutProps) {
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkAdminSession() {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase.auth.getUser();
        const allowed = isAllowedAdminEmail(data.user?.email);

        if (!mounted) return;
        setIsAdmin(allowed);
        setReady(true);
      } catch {
        if (!mounted) return;
        setIsAdmin(false);
        setReady(true);
      }
    }

    checkAdminSession();

    return () => {
      mounted = false;
    };
  }, []);

  if (!insightId || !ready || !isAdmin) return null;

  return (
    <Link
      href={`/admin/insights/${insightId}/edit`}
      className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#D4AF37]/45 bg-[#D4AF37]/[0.06] px-5 py-2.5 text-center font-sans text-sm leading-none text-[#D4AF37] transition motion-safe:duration-300 hover:border-[#D4AF37]/70 hover:bg-[#D4AF37]/[0.14]"
    >
      Edit Wawasan
    </Link>
  );
}
