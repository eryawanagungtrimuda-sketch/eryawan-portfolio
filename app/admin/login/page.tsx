import Link from 'next/link';
import AdminLoginForm from '@/components/admin-login-form';

export default function AdminLoginPage() {
  return (
    <main id="admin-shell" className="min-h-screen bg-[#080807] px-5 py-10 font-sans text-[#F4F1EA] md:px-10 lg:px-16">
      <div className="mx-auto max-w-md py-16">
        <Link href="/" className="font-display text-3xl uppercase tracking-[0.06em] text-[#D4AF37]">
          Eryawan Studio
        </Link>
        <p className="mt-5 font-mono text-[10px] font-black uppercase tracking-[0.36em] text-white/38">Admin Panel</p>
        <h1 className="font-display mt-6 text-5xl font-normal leading-[1.05] tracking-[-0.04em]">
          Masuk untuk mengelola karya.
        </h1>
        <p className="mt-5 text-base leading-7 text-white/58">
          Login hanya untuk admin yang terdaftar. Gunakan akun Supabase Auth dengan email owner.
        </p>
        <AdminLoginForm />
      </div>
    </main>
  );
}
