import Link from 'next/link';
import { MoveLeft } from 'lucide-react';

const strategicDecisions = [
  'Membagi ruang berdasarkan intensitas aktivitas: fokus, kolaborasi, transisi, dan kebutuhan privasi.',
  'Mengarahkan alur kerja agar pengguna ruang tidak saling mengganggu saat aktivitas berlangsung bersamaan.',
  'Menggunakan komposisi visual untuk memperjelas orientasi ruang, bukan sebagai elemen dekoratif semata.',
];

const executions = [
  {
    title: 'Zoning',
    body: 'Zona fokus dan zona kolaborasi dibuat lebih terbaca agar pengguna memahami kapan ruang mendukung konsentrasi dan kapan ruang mendukung interaksi.',
  },
  {
    title: 'Layout',
    body: 'Pergerakan antar-area disusun agar tidak menciptakan distraksi berulang dan tetap mendukung ritme kerja yang fleksibel.',
  },
  {
    title: 'Material & Visual',
    body: 'Elemen material dan visual digunakan untuk membangun ketenangan, orientasi, dan konsistensi pengalaman ruang kerja.',
  },
];

const impacts = [
  'Aktivitas fokus dan kolaborasi lebih mudah berjalan tanpa saling mengganggu.',
  'Pengalaman ruang meningkat karena pengguna dapat membaca fungsi area dengan lebih cepat.',
  'Keputusan desain lebih mudah dipahami oleh pengambil keputusan karena setiap area memiliki alasan fungsi yang jelas.',
  'Ruang kerja menjadi lebih terarah, nyaman, dan produktif untuk penggunaan harian.',
];

export default function WorkspaceInteriorCaseStudy() {
  return (
    <main className="min-h-screen bg-[#080807] px-5 py-8 font-sans text-[#F4F1EA] md:px-10 lg:px-16 lg:py-12">
      <div className="mx-auto max-w-6xl">
        <Link href="/#portfolio" className="inline-flex items-center gap-3 font-mono text-[11px] font-black uppercase tracking-[0.22em] text-[#D4AF37] transition hover:text-[#E2C866]">
          <MoveLeft size={16} />
          Kembali ke Portfolio
        </Link>

        <section className="py-20 md:py-28">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#D4AF37] md:text-[11px]">Case Study 02</p>
          <h1 className="font-display mt-6 max-w-5xl text-5xl font-normal leading-[1.05] tracking-[-0.04em] md:text-7xl">
            Workspace Interior
          </h1>
          <p className="mt-8 max-w-4xl text-xl leading-[1.65] text-white/76 md:text-2xl">
            Tantangan utama ruang kerja ini adalah membangun keseimbangan antara fokus, kolaborasi, dan fleksibilitas tanpa membuat ruang terasa padat atau membingungkan.
          </p>
        </section>

        <section className="grid gap-10 border-y border-white/10 py-14 lg:grid-cols-[0.82fr_1.18fr] lg:gap-16">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.32em] text-[#D4AF37]">Opening</p>
            <h2 className="font-display mt-4 text-4xl font-normal leading-[1.12] tracking-[-0.035em] md:text-5xl">
              Ruang kerja gagal ketika fungsi saling bertabrakan.
            </h2>
          </div>
          <p className="text-lg leading-[1.75] text-white/70 md:text-xl">
            Produktivitas tidak hanya ditentukan oleh jumlah meja atau gaya visual. Ruang kerja perlu membantu pengguna memahami kapan harus fokus, kapan berkolaborasi, dan bagaimana bergerak tanpa mengganggu aktivitas lain.
          </p>
        </section>

        <section className="grid gap-8 py-20 lg:grid-cols-5">
          <article className="border-l border-white/10 pl-6 lg:col-span-5 lg:grid lg:grid-cols-[0.8fr_2fr] lg:gap-12 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-8">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white/35">01</p>
              <h2 className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-[#D4AF37]">Context</h2>
            </div>
            <p className="mt-4 max-w-3xl text-lg leading-[1.75] text-white/72 lg:mt-0">
              Area kerja harus menampung aktivitas dengan intensitas berbeda: pekerjaan fokus, diskusi cepat, kolaborasi, dan transisi antar-tim. Kebutuhannya kompleks, tetapi ruang harus tetap mudah dibaca oleh pengguna.
            </p>
          </article>

          <article className="border-l border-white/10 pl-6 lg:col-span-5 lg:grid lg:grid-cols-[0.8fr_2fr] lg:gap-12 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-8">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white/35">02</p>
              <h2 className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-[#D4AF37]">Core Problem</h2>
            </div>
            <p className="mt-4 max-w-3xl text-lg leading-[1.75] text-white/72 lg:mt-0">
              Masalah paling kritis adalah fungsi ruang yang belum terbagi secara tegas. Aktivitas fokus dan interaksi berpotensi saling mengganggu, sehingga ruang terasa kurang mendukung ritme kerja yang produktif.
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
          <div className="aspect-[16/9] w-full rounded-sm border border-white/10 bg-[radial-gradient(circle_at_70%_25%,rgba(212,175,55,0.18),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.075),rgba(255,255,255,0.012))]" />
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/48">
            Visual mendukung pembacaan zoning: area fokus, kolaborasi, dan transisi dibuat lebih mudah dikenali agar pengguna memahami fungsi ruang tanpa instruksi tambahan.
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
            Desain ruang kerja yang kuat bukan hanya terlihat profesional. Ia membantu orang bekerja, bergerak, dan mengambil keputusan dengan lebih jelas.
          </p>
        </section>
      </div>
    </main>
  );
}
