import Link from 'next/link';
import { MoveLeft } from 'lucide-react';

const strategicDecisions = [
  'Menyusun ulang alur sirkulasi agar aktivitas harian bergerak lebih linear dan tidak saling mengganggu.',
  'Memperjelas zoning antara area publik, transisi, dan aktivitas utama agar ruang lebih mudah dipahami.',
  'Menempatkan elemen visual sebagai pendukung orientasi ruang, bukan sekadar dekorasi.',
];

const executions = [
  {
    title: 'Zoning',
    body: 'Area aktivitas utama dipisahkan dengan logika yang lebih jelas agar pengguna ruang memahami fungsi setiap area tanpa banyak penyesuaian.',
  },
  {
    title: 'Layout',
    body: 'Titik aktivitas disusun untuk mengurangi pergerakan bolak-balik dan membuat flow harian lebih efisien.',
  },
  {
    title: 'Material & Visual',
    body: 'Pilihan material dan komposisi visual diarahkan untuk menjaga ketenangan ruang sekaligus memperkuat orientasi pengguna.',
  },
];

const impacts = [
  'Aktivitas harian lebih lancar karena alur ruang lebih mudah dibaca.',
  'Keputusan layout lebih cepat disepakati karena prioritas fungsi sudah jelas.',
  'Revisi berkurang karena arah desain tidak hanya bergantung pada preferensi visual.',
  'Ruang terasa lebih efisien, terarah, dan mudah digunakan dalam jangka panjang.',
];

export default function ResidentialInteriorCaseStudy() {
  return (
    <main className="min-h-screen bg-[#080807] px-5 py-8 font-sans text-[#F4F1EA] md:px-10 lg:px-16 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/#portfolio" className="inline-flex items-center gap-3 font-mono text-[11px] font-black uppercase tracking-[0.22em] text-[#D4AF37] transition hover:text-[#E2C866]">
          <MoveLeft size={16} />
          Kembali ke Portfolio
        </Link>

        <section className="py-20 md:py-28">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#D4AF37] md:text-[11px]">Case Study 01</p>
          <h1 className="font-display mt-6 max-w-5xl text-5xl font-normal leading-[1.05] tracking-[-0.04em] md:text-7xl">
            Residential Interior
          </h1>
          <p className="mt-8 max-w-4xl text-xl leading-[1.65] text-white/76 md:text-2xl">
            Tantangan utama proyek ini bukan membuat ruang terlihat menarik, tetapi memperjelas cara ruang bekerja untuk aktivitas harian yang berulang.
          </p>
        </section>

        <section className="grid gap-10 border-y border-white/10 py-14 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.32em] text-[#D4AF37]">Opening</p>
            <h2 className="font-display mt-4 text-4xl font-normal leading-[1.12] tracking-[-0.035em] md:text-5xl">
              Masalah ruang muncul dari alur yang tidak terbaca.
            </h2>
          </div>
          <p className="text-lg leading-[1.75] text-white/70 md:text-xl">
            Dalam hunian, keputusan layout menentukan bagaimana aktivitas kecil terjadi setiap hari. Ketika sirkulasi, zoning, dan titik aktivitas tidak jelas, ruang bisa terlihat baik tetapi tetap melelahkan untuk digunakan.
          </p>
        </section>

        <section className="grid gap-8 py-20 lg:grid-cols-5">
          <article className="border-l border-white/10 pl-6 lg:col-span-5 lg:grid lg:grid-cols-[0.8fr_2fr] lg:gap-12 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-8">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white/35">01</p>
              <h2 className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-[#D4AF37]">Context</h2>
            </div>
            <p className="mt-4 max-w-3xl text-lg leading-[1.75] text-white/72 lg:mt-0">
              Ruang hunian digunakan untuk aktivitas harian yang padat: bergerak, berkumpul, menyimpan, dan beristirahat. Kebutuhan pengguna cukup jelas, tetapi susunan ruang belum membantu mereka membaca alur aktivitas secara natural.
            </p>
          </article>

          <article className="border-l border-white/10 pl-6 lg:col-span-5 lg:grid lg:grid-cols-[0.8fr_2fr] lg:gap-12 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-8">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white/35">02</p>
              <h2 className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-[#D4AF37]">Core Problem</h2>
            </div>
            <p className="mt-4 max-w-3xl text-lg leading-[1.75] text-white/72 lg:mt-0">
              Masalah paling kritis adalah sirkulasi yang belum efisien: area publik terasa terputus, titik aktivitas belum terhubung, dan keputusan layout berpotensi menciptakan ruang yang sulit digunakan dalam rutinitas harian.
            </p>
          </article>

          <article className="border-l border-white/10 pl-6 lg:col-span-5 lg:grid lg:grid-cols-[0.8fr_2fr] lg:gap-12 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-8">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white/35">03</p>
              <h2 className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-[#D4AF37]">Strategic Decision</h2>
            </div>
            <ul className="mt-4 max-w-3xl space-y-5 text-lg leading-[1.7] text-white/72 lg:mt-0">
              {strategicDecisions.map((decision) => (
                <li key={decision} className="border-l border-[#D4AF37]/35 pl-5">{decision}</li>
              ))}
            </ul>
          </article>
        </section>

        <section className="rounded-sm border border-white/10 bg-white/[0.02] p-6 md:p-10">
          <div className="aspect-[16/9] w-full rounded-sm border border-white/10 bg-[radial-gradient(circle_at_30%_20%,rgba(212,175,55,0.20),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.015))]" />
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/48">
            Visual digunakan untuk membaca arah keputusan: alur bergerak, titik aktivitas, dan hubungan antar-area dibuat lebih jelas sebelum masuk ke detail estetika.
          </p>
        </section>

        <section className="grid gap-8 py-20 lg:grid-cols-5">
          <article className="border-l border-white/10 pl-6 lg:col-span-5 lg:grid lg:grid-cols-[0.8fr_2fr] lg:gap-12 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-8">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white/35">04</p>
              <h2 className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-[#D4AF37]">Design Execution</h2>
            </div>
            <div className="mt-4 grid max-w-4xl gap-6 md:grid-cols-3 lg:mt-0">
              {executions.map((item) => (
                <div key={item.title} className="border-t border-white/10 pt-5">
                  <h3 className="text-sm font-bold uppercase tracking-[0.14em] text-white/78">{item.title}</h3>
                  <p className="mt-4 text-base leading-[1.7] text-white/60">{item.body}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="border-l border-white/10 pl-6 lg:col-span-5 lg:grid lg:grid-cols-[0.8fr_2fr] lg:gap-12 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-8">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white/35">05</p>
              <h2 className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-[#D4AF37]">Impact</h2>
            </div>
            <ul className="mt-4 max-w-3xl space-y-4 text-lg leading-[1.7] text-white/72 lg:mt-0">
              {impacts.map((impact) => (
                <li key={impact} className="flex gap-4">
                  <span className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D4AF37]" />
                  <span>{impact}</span>
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="border-t border-white/10 py-16">
          <p className="font-display max-w-4xl text-3xl italic leading-[1.28] tracking-[-0.03em] text-white/86 md:text-5xl">
            Desain yang baik membantu klien mengambil keputusan yang lebih jelas, bukan hanya memilih tampilan yang lebih menarik.
          </p>
        </section>
      </div>
    </main>
  );
}
