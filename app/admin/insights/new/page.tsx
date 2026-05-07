import Link from 'next/link';
import AdminAuthGuard from '@/components/admin-auth-guard';
import InsightForm from '@/components/insight-form';

export default function NewInsightPage() {
  return (
    <AdminAuthGuard>
      <main id="admin-shell" className="min-h-screen bg-[#080807] px-5 py-10 text-[#F4F1EA]">
        <div className="mx-auto max-w-4xl space-y-6">
          <Link href="/admin/insights" className="inline-flex rounded-lg border border-white/20 px-4 py-2 text-sm text-white/90 hover:bg-white/5">← Kembali ke Kelola Wawasan</Link>
          <div>
            <h1 className="text-4xl font-semibold md:text-5xl">Tambah Wawasan</h1>
            <p className="mt-2 text-sm text-white/70 md:text-base">Buat draft wawasan baru lalu tinjau hasil AI sebelum dipublikasikan.</p>
          </div>
          <InsightForm />
        </div>
      </main>
    </AdminAuthGuard>
  );
}
