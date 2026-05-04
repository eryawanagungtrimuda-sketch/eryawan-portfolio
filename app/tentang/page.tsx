const pengalamanNyata = [
  {
    title: 'Residensial & Hospitality',
    description:
      'Menata ruang tinggal dan komersial dengan fokus pada alur aktivitas, kenyamanan harian, dan kualitas pengalaman ruang.',
  },
  {
    title: 'Workspace & Corporate',
    description:
      'Membantu organisasi merancang ruang kerja yang mendukung kolaborasi, fokus individu, dan efisiensi operasional tim.',
  },
  {
    title: 'Design Development',
    description:
      'Mengawal proses dari konsep sampai keputusan teknis agar desain tidak berhenti di visual, tetapi siap dieksekusi dengan terukur.',
  },
];

const nilaiDibawa = [
  'Membaca konteks proyek sebelum menawarkan bentuk.',
  'Menyusun keputusan desain berdasarkan prioritas fungsi dan dampak jangka panjang.',
  'Menjembatani bahasa desain dengan bahasa bisnis agar arah proyek lebih jelas.',
  'Mengarahkan proses kolaborasi lintas pihak dengan struktur diskusi yang terukur.',
];

const kontribusiPerusahaan = [
  {
    title: 'Kejelasan Arah Proyek',
    detail: 'Membantu tim menyamakan prioritas sehingga keputusan desain tidak berjalan parsial atau reaktif.',
  },
  {
    title: 'Efisiensi Proses Keputusan',
    detail: 'Mengurangi revisi berulang melalui argumen desain yang terstruktur dan mudah divalidasi.',
  },
  {
    title: 'Dampak Bisnis yang Terukur',
    detail: 'Merancang ruang yang mendukung performa pengguna, citra brand, dan keberlanjutan operasional.',
  },
];

const diferensiasiSenior = [
  'Tidak berhenti pada estetika: setiap keputusan punya alasan strategis.',
  'Mampu melihat proyek sebagai sistem, bukan kumpulan elemen visual.',
  'Terbiasa mengambil keputusan di bawah batasan waktu, biaya, dan kompleksitas stakeholder.',
  'Mengubah brief yang samar menjadi arah desain yang jelas, logis, dan dapat dieksekusi.',
];

export default function TentangPage() {
  return (
    <main className="min-h-screen bg-[#080807] font-sans text-[#F4F1EA]">
      <section className="relative overflow-hidden px-5 py-20 md:px-10 lg:px-16 lg:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(200,169,81,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#C8A951] md:text-[11px]">Tentang</p>
          <h1 className="font-display mt-5 max-w-5xl text-5xl font-normal leading-[1.08] tracking-[-0.04em] text-[#F4F1EA] md:text-7xl">
            Executive Summary
          </h1>
          <p className="mt-8 max-w-4xl text-lg leading-[1.75] text-white/72 md:text-xl">
            Saya adalah desainer interior dengan <span className="text-[#C8A951]">15+ tahun pengalaman</span> dalam merancang ruang residensial, hospitality, dan workspace. Fokus saya bukan hanya menciptakan visual yang baik, tetapi menyusun keputusan desain yang masuk akal, terukur, dan relevan dengan tujuan pengguna maupun bisnis.
          </p>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#090909] px-5 py-16 md:px-10 md:py-24 lg:px-16 lg:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(200,169,81,0.06),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl">
          <h2 className="font-display text-4xl font-normal leading-[1.1] tracking-[-0.03em] md:text-6xl">Pengalaman Nyata</h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {pengalamanNyata.map((item, index) => (
              <article key={item.title} className="border border-white/10 bg-white/[0.02] p-8 transition duration-300 hover:-translate-y-1 hover:border-[#C8A951]/30 md:p-10">
                <span className="font-mono text-xs font-black uppercase tracking-[0.28em] text-white/45">0{index + 1}</span>
                <h3 className="font-display mt-6 text-3xl font-normal leading-[1.08] tracking-[-0.02em] text-white/90">{item.title}</h3>
                <p className="mt-5 text-base leading-[1.75] text-white/65">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#2D2D2B] px-5 py-16 md:px-10 md:py-24 lg:px-16 lg:py-28">
        <div className="relative mx-auto max-w-7xl">
          <h2 className="font-display text-4xl font-normal leading-[1.1] tracking-[-0.03em] text-[#F4F1EA] md:text-6xl">Nilai yang Dibawa</h2>
          <div className="mt-10 grid gap-4">
            {nilaiDibawa.map((item) => (
              <div key={item} className="border border-white/12 bg-white/[0.02] p-6 text-base leading-[1.75] text-white/75 md:text-lg">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#090909] px-5 py-16 md:px-10 md:py-24 lg:px-16 lg:py-28">
        <div className="relative mx-auto max-w-7xl">
          <h2 className="font-display max-w-4xl text-4xl font-normal leading-[1.1] tracking-[-0.03em] text-[#F4F1EA] md:text-6xl">
            Apa yang saya bawa ke perusahaan
          </h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {kontribusiPerusahaan.map((item) => (
              <article key={item.title} className="border border-white/10 bg-white/[0.02] p-8 md:p-10">
                <h3 className="font-display text-3xl font-normal leading-[1.08] tracking-[-0.02em] text-white/90">{item.title}</h3>
                <p className="mt-5 text-base leading-[1.75] text-white/66">{item.detail}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-5 py-16 md:px-10 md:py-24 lg:px-16 lg:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_16%,rgba(200,169,81,0.06),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl">
          <h2 className="font-display text-4xl font-normal leading-[1.1] tracking-[-0.03em] text-[#F4F1EA] md:text-6xl">Diferensiasi senior</h2>
          <ul className="mt-10 grid gap-4">
            {diferensiasiSenior.map((item) => (
              <li key={item} className="border border-[#C8A951]/25 bg-[#C8A951]/[0.06] p-6 text-base leading-[1.75] text-white/80 md:text-lg">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
