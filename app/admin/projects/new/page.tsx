import AdminAuthGuard from '@/components/admin-auth-guard';
import BackButton from '@/components/back-button';
import ProjectForm from '@/components/project-form';

export default function NewProjectPage() {
  return (
    <AdminAuthGuard>
      <main id="admin-shell" className="min-h-screen bg-[#080807] px-4 py-10 font-sans text-[#F4F1EA] sm:px-5 md:px-8 lg:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="border-b border-white/10 pb-8">
            <BackButton label="Kembali ke Dashboard" fallbackHref="/admin/dashboard" />
            <p className="mt-6 font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white/35">Admin / Projects / Tambah Project</p>
            <h1 className="font-display mt-4 text-[2.1rem] font-normal leading-[1.05] tracking-[-0.03em] sm:text-[2.5rem] md:text-5xl">Tambah Project</h1>
            <p className="mt-4 max-w-2xl text-white/56">Buat draft dulu. Setelah tersimpan, kamu bisa upload gambar dan set cover image.</p>
          </div>
          <section className="py-10">
            <ProjectForm />
          </section>
        </div>
      </main>
    </AdminAuthGuard>
  );
}
