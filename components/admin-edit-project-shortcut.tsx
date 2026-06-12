'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { isAllowedAdminEmail } from '@/lib/admin-auth';
import { adminShortcutsEnabled } from '@/lib/admin-shortcuts';
import { getAdminProjectEditHref } from '@/lib/admin-project-return-path';

type AdminEditProjectShortcutProps = {
  projectId?: string | null;
};

export default function AdminEditProjectShortcut({ projectId }: AdminEditProjectShortcutProps) {
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    if (!adminShortcutsEnabled || !projectId) {
      setIsAdmin(false);
      setReady(true);
      return () => {
        mounted = false;
      };
    }

    setReady(false);
    setIsAdmin(false);

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
  }, [projectId]);

  if (!adminShortcutsEnabled || !projectId) return null;
  if (!ready || !isAdmin) return null;

  return (
    <Link
      href={getAdminProjectEditHref(projectId, '/admin/projects')}
      aria-label="Edit project"
      className="premium-interactive inline-flex items-center justify-center rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/[0.06] px-5 py-2.5 text-center font-sans text-sm font-semibold leading-none text-[#D4AF37] transition motion-safe:duration-500 motion-safe:ease-out  hover:border-[#D4AF37]/70 hover:bg-[#D4AF37]/[0.14]"
    >
      Edit
    </Link>
  );
}
