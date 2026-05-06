import Link from 'next/link';

export default function KontakPage() {
  return (
    <main className="min-h-screen bg-[#080807] px-5 py-16 font-sans text-[#F4F1EA] md:px-10 lg:px-16">
      <section className="mx-auto max-w-3xl rounded-sm border border-white/10 bg-white/[0.02] p-8 md:p-12">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#D4AF37]">Kontak</p>
        <h1 className="font-display mt-5 text-4xl font-normal leading-[1.08] tracking-[-0.03em] md:text-5xl">Mari Diskusikan Project Interior Anda</h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-white/68 md:text-lg">Untuk konsultasi project baru, kolaborasi, atau review desain, hubungi Eryawan Studio melalui email berikut.</p>
        <a href="mailto:eryawanagungtrimuda@gmail.com" className="mt-8 inline-flex rounded-sm border border-[#D4AF37] bg-[#D4AF37] px-6 py-3 font-mono text-xs font-black uppercase tracking-[0.16em] text-black transition hover:bg-[#E2C866]">eryawanagungtrimuda@gmail.com</a>
        <div className="mt-5">
          <Link href="/" className="inline-flex rounded-sm border border-white/14 px-6 py-3 font-mono text-xs font-black uppercase tracking-[0.16em] text-white/78 transition hover:border-[#D4AF37]/40 hover:text-[#D4AF37]">Kembali ke Beranda</Link>
        </div>
      </section>
    </main>
  );
}
