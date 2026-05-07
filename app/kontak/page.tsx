import Link from 'next/link';

export default function KontakPage() {
  return (
    <main className="min-h-screen bg-[#080807] px-4 py-12 font-sans text-[#F4F1EA] sm:px-5 md:px-8 lg:px-12">
      <section className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.02] p-6 motion-safe:animate-[fade-in-up_800ms_ease-out_forwards] sm:p-8 md:p-12">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#D4AF37]">Kontak</p>
        <h1 className="font-display mt-5 text-4xl font-normal leading-[1.08] tracking-[-0.03em] md:text-5xl">Mari Diskusikan Project Interior Anda</h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-white/62 md:text-lg">Untuk konsultasi project baru, kolaborasi, atau review desain, hubungi Eryawan Studio melalui email berikut.</p>
        <a href="mailto:eryawanagungtrimuda@gmail.com" className="mt-8 inline-flex min-h-11 max-w-full break-all rounded-full border border-[#D4AF37] bg-[#D4AF37] px-4 py-3 font-mono text-[11px] font-black uppercase tracking-[0.12em] text-black transition motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:bg-[#E2C866] sm:px-6 sm:text-xs sm:tracking-[0.16em]">eryawanagungtrimuda@gmail.com</a>
        <div className="mt-5">
          <Link href="/" className="inline-flex rounded-full border border-white/14 px-6 py-3 font-mono text-xs font-black uppercase tracking-[0.16em] text-white/66 transition hover:border-[#D4AF37]/40 hover:text-[#D4AF37]">Kembali ke Beranda</Link>
        </div>
      </section>
    </main>
  );
}
