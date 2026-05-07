import Link from 'next/link';
import AdminAuthGuard from '@/components/admin-auth-guard';
import InsightForm from '@/components/insight-form';

export default function NewInsightPage() {
  return (
    <AdminAuthGuard>
      <main id="admin-shell" className="min-h-screen bg-[#080807] px-4 py-10 text-[#F4F1EA] sm:px-5 md:px-8 lg:px-12">
        <div className="mx-auto max-w-4xl space-y-6">
          <Link href="/admin/insights" className="inline-flex rounded-lg border border-white/20 px-4 py-2 text-sm text-white/90 hover:bg-white/5">← Kembali ke Kelola Wawasan</Link>
          <div>
            <h1 className="font-display text-[2rem] font-normal tracking-[-0.02em] sm:text-[2.4rem] md:text-5xl">Tambah Wawasan</h1>
            <p className="mt-2 text-sm text-white/70 md:text-base">Buat draft wawasan baru lalu tinjau hasil AI sebelum dipublikasikan.</p>
          </div>
          <InsightForm />
        </div>
      </main>
    </AdminAuthGuard>
  );
}
