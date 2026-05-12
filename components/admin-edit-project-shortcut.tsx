'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { isAllowedAdminEmail } from '@/lib/admin-auth';

type AdminEditProjectShortcutProps = {
  projectId?: string | null;
};

export default function AdminEditProjectShortcut({ projectId }: AdminEditProjectShortcutProps) {
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

  if (!projectId || !ready || !isAdmin) return null;

  return (
    <div className="inline-flex flex-col gap-2">
      <Link
        href={`/admin/projects/${projectId}/edit`}
        className="inline-flex items-center rounded-2xl border border-[#D4AF37]/45 bg-[#D4AF37]/[0.08] px-5 py-2.5 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-[#D4AF37] transition motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:border-[#D4AF37]/70 hover:bg-[#D4AF37]/[0.14]"
      >
        Edit Project
      </Link>
      <p className="pl-1 text-xs text-white/50">Shortcut admin untuk memperbarui data project ini.</p>
    </div>
  );
}
