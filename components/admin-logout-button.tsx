'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabaseClient';

export default function AdminLogoutButton() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const supabase = getSupabaseClient();
        const { data } = await supabase.auth.getUser();
        if (mounted) setEmail(data.user?.email || '');
      } catch {
        if (mounted) setEmail('');
      }
    }

    loadUser();

    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogout() {
    setLoading(true);

    try {
      const supabase = getSupabaseClient();
      await supabase.auth.signOut();
      router.replace('/admin/login');
      router.refresh();
    } catch {
      router.replace('/admin/login');
      router.refresh();
    }
  }

  return (
    <div className="flex flex-col gap-3 md:items-end">
      {email ? (
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
          {email}
        </p>
      ) : null}
      <button
        type="button"
        onClick={handleLogout}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-[4px] border border-white/12 bg-white/[0.018] px-5 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-white/62 transition duration-300 hover:border-[#D4AF37]/35 hover:text-[#D4AF37] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
}
