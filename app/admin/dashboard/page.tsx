import Link from 'next/link';
import AdminAuthGuard from '@/components/admin-auth-guard';
import AdminDashboardCMS from '@/components/admin-dashboard-cms';
import AdminLogoutButton from '@/components/admin-logout-button';

export default function AdminDashboardPage() {
  return (
    <AdminAuthGuard>
      <main id="admin-shell" className="min-h-screen bg-[#080807] px-5 py-10 font-sans text-[#F4F1EA] md:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.42em] text-[#D4AF37]">Admin Dashboard</p>
              <h1 className="font-display mt-4 text-5xl font-normal leading-[1.05] tracking-[-0.04em]">Kelola Portfolio</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-white/55">
                Pantau status project, kelola konten, dan update portfolio tanpa menyentuh kode.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/" className="rounded-sm border border-white/10 px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white/52 transition duration-300 hover:border-[#D4AF37]/35 hover:text-[#D4AF37]">
                  Lihat Website
                </Link>
                <Link href="/karya" className="rounded-sm border border-white/10 px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white/52 transition duration-300 hover:border-[#D4AF37]/35 hover:text-[#D4AF37]">
                  Lihat Semua Karya
                </Link>
                <Link href="/admin/case-history" className="rounded-sm border border-white/10 px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white/52 transition duration-300 hover:border-[#D4AF37]/35 hover:text-[#D4AF37]">
                  Case History
                </Link>
              </div>
            </div>
            <AdminLogoutButton />
          </div>

          <AdminDashboardCMS />
        </div>
      </main>
    </AdminAuthGuard>
  );
}
