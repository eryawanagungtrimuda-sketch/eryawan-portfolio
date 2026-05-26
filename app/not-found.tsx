import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-[#080807] px-4 py-16 font-sans text-[#F4F1EA] sm:px-6 lg:px-12">
      <section className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center sm:p-10">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#D4AF37]">404</p>
        <h1 className="font-display mt-4 text-4xl font-normal leading-[1.08] tracking-[-0.03em] sm:text-5xl">Halaman Tidak Ditemukan</h1>
        <p className="mt-5 text-base leading-7 text-white/62 sm:text-lg">Tautan yang Anda buka mungkin sudah dipindahkan atau tidak tersedia. Silakan kembali ke beranda atau jelajahi karya terbaru.</p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#D4AF37] bg-[#D4AF37] px-6 py-2.5 text-sm font-semibold text-black">Kembali ke Beranda</Link>
          <Link href="/karya" className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-6 py-2.5 text-sm font-semibold text-white/85 hover:border-[#D4AF37]/50 hover:text-[#D4AF37]">Lihat Karya</Link>
        </div>
      </section>
    </main>
  );
}
