'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminEmail, createSupabaseBrowserClient } from '@/lib/supabase';

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState(adminEmail);
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (email.toLowerCase() !== adminEmail.toLowerCase()) {
        setMessage('Email ini tidak terdaftar sebagai admin.');
        return;
      }

      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        setMessage(error.message);
        return;
      }

      router.push('/admin/dashboard');
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Login gagal.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleLogin} className="mt-10 space-y-6 rounded-sm border border-white/10 bg-white/[0.025] p-6 md:p-8">
      <div>
        <label>Email Admin</label>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      </div>
      <div>
        <label>Password</label>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      </div>
      {message ? <p className="text-sm leading-6 text-red-300">{message}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-[4px] bg-[#D4AF37] px-6 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#080807] transition hover:bg-[#E2C866] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? 'Memproses...' : 'Masuk Admin'}
      </button>
    </form>
  );
}
