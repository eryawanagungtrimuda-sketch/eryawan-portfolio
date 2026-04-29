import Link from 'next/link';
import AdminAuthGuard from '@/components/admin-auth-guard';
import AdminProjectsList from '@/components/admin-projects-list';

export default function AdminProjectsPage() {
  return (
    <AdminAuthGuard>
      <main id="admin-shell" className="min-h-screen bg-[#080807] px-5 py-10 font-sans text-[#F4F1EA] md:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 border-b border-white/10 pb-8 md:flex-row md:items-center md:justify-between">
            <div>
              <Link href="/admin/dashboard" className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white/35">Dashboard</Link>
              <h1 className="font-display mt-4 text-5xl font-normal leading-[1.05] tracking-[-0.04em]">Projects</h1>
            </div>
            <Link href="/admin/projects/new" className="rounded-[4px] bg-[#D4AF37] px-6 py-4 text-sm font-semibold uppercase tracking-[0.12em] text-[#080807] transition hover:bg-[#E2C866]">
              Tambah Project
            </Link>
          </div>
          <section className="py-10">
            <AdminProjectsList />
          </section>
        </div>
      </main>
    </AdminAuthGuard>
  );
}
