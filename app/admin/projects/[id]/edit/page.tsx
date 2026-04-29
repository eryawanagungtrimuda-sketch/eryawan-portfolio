import Link from 'next/link';
import AdminAuthGuard from '@/components/admin-auth-guard';
import AdminProjectEditor from '@/components/admin-project-editor';

type Props = {
  params: { id: string };
};

export default function EditProjectPage({ params }: Props) {
  return (
    <AdminAuthGuard>
      <main id="admin-shell" className="min-h-screen bg-[#080807] px-5 py-10 font-sans text-[#F4F1EA] md:px-10 lg:px-16">
        <div className="mx-auto max-w-6xl">
          <div className="border-b border-white/10 pb-8">
            <Link href="/admin/projects" className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white/35">Projects</Link>
            <h1 className="font-display mt-4 text-5xl font-normal leading-[1.05] tracking-[-0.04em]">Edit Project</h1>
            <p className="mt-4 max-w-2xl text-white/56">Kelola konten case study, publish/draft, featured project, dan gallery images.</p>
          </div>
          <section className="py-10">
            <AdminProjectEditor id={params.id} />
          </section>
        </div>
      </main>
    </AdminAuthGuard>
  );
}
