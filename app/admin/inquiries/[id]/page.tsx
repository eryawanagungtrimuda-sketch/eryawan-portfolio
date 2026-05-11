import AdminAuthGuard from '@/components/admin-auth-guard';
import AdminInquiryDetail from '@/components/admin-inquiry-detail';
import ContextualBackButton from '@/components/contextual-back-button';

export default async function AdminInquiryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AdminAuthGuard>
      <main id="admin-shell" className="min-h-screen bg-[#080807] px-5 py-10 font-sans text-[#F4F1EA] md:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <ContextualBackButton fallbackHref="/admin/inquiries" label="← Kembali ke Sebelumnya" className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white/35 hover:text-[#D4AF37]" />
          <h1 className="mt-4 text-4xl">Detail Inquiry Project</h1>
          <p className="mt-2 max-w-3xl text-sm text-white/65">Ringkasan brief, kontak, status, dan draft proposal untuk calon project ini.</p>
          <section className="py-8"><AdminInquiryDetail id={id} /></section>
        </div>
      </main>
    </AdminAuthGuard>
  );
}
