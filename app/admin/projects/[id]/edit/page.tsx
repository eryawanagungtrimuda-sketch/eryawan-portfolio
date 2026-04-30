import AdminAuthGuard from '@/components/admin-auth-guard';
import AdminProjectEditor from '@/components/admin-project-editor';
import BackButton from '@/components/back-button';

type Props = {
  params: { id: string };
};

export default function EditProjectPage({ params }: Props) {
  return (
    <AdminAuthGuard>
      <main id="admin-shell" className="min-h-screen bg-[#080807] px-5 py-10 font-sans text-[#F4F1EA] md:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="border-b border-white/10 pb-8">
            <BackButton label="Kembali ke Dashboard" fallbackHref="/admin/dashboard" />
            <p className="mt-6 font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white/35">Admin / Projects / Edit Project</p>
            <h1 className="font-display mt-4 text-5xl font-normal leading-[1.05] tracking-[-0.04em]">Edit Project</h1>
            <p className="mt-4 max-w-2xl text-white/56">Kelola konten case study, gallery images, cover selection, dan narasi project.</p>
          </div>
          <section className="py-10">
            <AdminProjectEditor id={params.id} />
          </section>
        </div>
      </main>
    </AdminAuthGuard>
  );
}
