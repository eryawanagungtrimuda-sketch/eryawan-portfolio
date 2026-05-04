import BackButton from '@/components/back-button';

const wawasanArticles = [
  {
    id: 'tren-interior-pinterest',
    category: 'Trend Analysis',
    title: 'Membaca Tren Interior dari Pinterest',
    summary:
      'Menyaring referensi visual dari Pinterest untuk memetakan pola warna, bentuk furnitur, dan preferensi ruang yang sedang naik, lalu diterjemahkan menjadi keputusan desain yang relevan untuk konteks proyek nyata.',
    labels: ['Pinterest Review', 'Trend Watch'],
  },
  {
    id: 'desain-unik-efektif',
    category: 'Design Strategy',
    title: 'Kenapa Desain Unik Tidak Selalu Efektif',
    summary:
      'Membahas kapan elemen unik justru menambah kompleksitas operasional, biaya perawatan, atau menurunkan kenyamanan pengguna, serta bagaimana menyeimbangkan karakter visual dan fungsi ruang.',
    labels: ['Project Insight', 'AI Visual Reading'],
  },
  {
    id: 'review-ruang-komersial',
    category: 'Commercial Review',
    title: 'Review Ruang Komersial yang Menarik Perhatian',
    summary:
      'Studi singkat tentang ruang komersial yang berhasil membangun first impression kuat melalui pengaturan lighting, ritme layout, dan narasi material tanpa mengorbankan efisiensi aktivitas.',
    labels: ['Project Insight', 'Trend Watch'],
  },
];

export default function WawasanPage() {
  return (
    <main className="min-h-screen bg-[#080807] px-5 py-16 font-sans text-[#F4F1EA] md:px-10 lg:px-16 lg:py-20 xl:px-24">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-16">
        <div>
          <BackButton label="Kembali ke Beranda" fallbackHref="/" />
        </div>

        <section className="relative overflow-hidden border border-[#C8A951]/20 bg-[#111110] px-6 py-12 md:px-10 md:py-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_16%,rgba(200,169,81,0.12),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0))]" />
          <div className="relative max-w-4xl">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#C8A951] md:text-[11px]">Insight Hub</p>
            <h1 className="font-display mt-5 text-[clamp(2.2rem,4.8vw,4.8rem)] font-normal uppercase leading-[1.08] tracking-[-0.04em] text-[#F4F1EA]">
              Wawasan Desain
            </h1>
            <p className="mt-6 max-w-3xl text-base leading-[1.8] text-white/72 md:text-xl">
              Catatan, analisis, dan review desain untuk membaca arah ruang secara lebih strategis.
            </p>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.44em] text-[#C8A951] md:text-[11px]">Article Structure</p>
              <h2 className="font-display mt-4 text-4xl font-normal leading-[1.1] tracking-[-0.03em] text-[#F4F1EA] md:text-5xl">
                Artikel & Insight
              </h2>
            </div>
            <p className="max-w-2xl text-sm leading-[1.8] text-white/58 md:text-base">
              Struktur saat ini disiapkan sebagai konten statis agar mudah dikembangkan menjadi sumber data dinamis (misalnya Supabase) untuk artikel, analisis visual, dan review berbasis AI di tahap berikutnya.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {wawasanArticles.map((article) => (
              <article
                key={article.id}
                className="group flex h-full flex-col border border-white/12 bg-white/[0.02] p-6 transition duration-300 hover:-translate-y-1 hover:border-[#C8A951]/35 hover:bg-white/[0.035]"
              >
                <p className="font-mono text-[11px] font-bold uppercase tracking-[0.24em] text-[#C8A951]">{article.category}</p>
                <h3 className="font-display mt-4 text-[1.85rem] font-normal leading-[1.14] tracking-[-0.02em] text-[#F4F1EA]">
                  {article.title}
                </h3>
                <p className="mt-4 flex-1 text-sm leading-[1.8] text-white/68 md:text-base">{article.summary}</p>

                <div className="mt-7 flex flex-wrap gap-2">
                  {article.labels.map((label) => (
                    <span
                      key={label}
                      className="rounded-sm border border-[#C8A951]/35 bg-[#C8A951]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#E4CD89]"
                    >
                      {label}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="border border-white/10 bg-[#0F0F0E] px-6 py-8 md:px-10 md:py-10">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.44em] text-[#C8A951] md:text-[11px]">Future Capability</p>
          <h2 className="font-display mt-4 text-3xl font-normal tracking-[-0.02em] text-[#F4F1EA] md:text-4xl">AI Visual Reading</h2>
          <p className="mt-4 max-w-4xl text-sm leading-[1.9] text-white/70 md:text-base">
            Ke depan, setiap gambar desain dapat dibaca sebagai bahan analisis untuk menghasilkan narasi wawasan yang lebih cepat, hemat kuota, dan tetap strategis.
          </p>
        </section>
      </div>
    </main>
  );
}
