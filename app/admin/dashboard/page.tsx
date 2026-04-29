import Link from 'next/link';
import AdminAuthGuard from '@/components/admin-auth-guard';

export default function AdminDashboardPage() {
  return (
    <AdminAuthGuard>
      <main id="admin-shell" className="min-h-screen bg-[#080807] px-5 py-10 font-sans text-[#F4F1EA] md:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.42em] text-[#D4AF37]">Admin Dashboard</p>
              <h1 className="font-display mt-4 text-5xl font-normal leading-[1.05] tracking-[-0.04em]">Kelola Portfolio</h1>
            </div>
            <Link href="/admin/projects/new" className="rounded-[4px] bg-[#D4AF37] px-6 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#080807] transition hover:bg-[#E2C866]">
              Tambah Project
            </Link>
          </div>

          <section className="grid gap-6 py-12 md:grid-cols-3">
            <Link href="/admin/projects" className="rounded-sm border border-white/10 bg-white/[0.025] p-7 transition hover:border-[#D4AF37]/35">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white/35">01</p>
              <h2 className="font-display mt-8 text-3xl font-normal">Projects</h2>
              <p className="mt-4 text-sm leading-6 text-white/56">Tambah, edit, hapus, publish, draft, dan set featured project.</p>
            </Link>
            <Link href="/karya" className="rounded-sm border border-white/10 bg-white/[0.025] p-7 transition hover:border-[#D4AF37]/35">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white/35">02</p>
              <h2 className="font-display mt-8 text-3xl font-normal">Public Karya</h2>
              <p className="mt-4 text-sm leading-6 text-white/56">Lihat halaman public yang mengambil data dari Supabase.</p>
            </Link>
            <Link href="/" className="rounded-sm border border-white/10 bg-white/[0.025] p-7 transition hover:border-[#D4AF37]/35">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white/35">03</p>
              <h2 className="font-display mt-8 text-3xl font-normal">Homepage</h2>
              <p className="mt-4 text-sm leading-6 text-white/56">Homepage tetap aman dengan fallback jika Supabase belum dikonfigurasi.</p>
            </Link>
          </section>
        </div>
      </main>
    </AdminAuthGuard>
  );
}
