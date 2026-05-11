import AdminAuthGuard from '@/components/admin-auth-guard';
import ContextualBackButton from '@/components/contextual-back-button';
import AdminProposalDraftExport from '@/components/admin-proposal-draft-export';

export default async function AdminProposalDraftExportPage({ params }: { params: Promise<{ id: string; draftId: string }> }) {
  const { id, draftId } = await params;

  return (
    <AdminAuthGuard>
      <main id="admin-shell" className="min-h-screen bg-[#080807] px-5 py-10 font-sans text-[#F4F1EA] md:px-10 lg:px-16">
        <div className="mx-auto max-w-5xl">
          <div className="no-print">
            <ContextualBackButton fallbackHref={`/admin/inquiries/${id}`} label="← Kembali ke Sebelumnya" className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white/35 hover:text-[#D4AF37]" />
          </div>
          <section className="mt-4">
            <AdminProposalDraftExport id={id} draftId={draftId} />
          </section>
        </div>
      </main>
    </AdminAuthGuard>
  );
}
