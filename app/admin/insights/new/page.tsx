import AdminAuthGuard from '@/components/admin-auth-guard';
import InsightForm from '@/components/insight-form';

export default function NewInsightPage() {
  return (
    <AdminAuthGuard>
      <main id="admin-shell" className="min-h-screen bg-[#080807] px-5 py-10 text-[#F4F1EA]">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-5xl">Tambah Wawasan</h1>
          <InsightForm />
        </div>
      </main>
    </AdminAuthGuard>
  );
}
