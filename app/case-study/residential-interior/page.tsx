import Link from 'next/link';
import { MoveLeft } from 'lucide-react';

const sections = [
  {
    label: 'Context',
    body: 'Hunian dengan kebutuhan aktivitas harian yang cukup padat, namun alur ruang belum terbaca jelas oleh pengguna ruang.',
  },
  {
    label: 'Problem',
    body: 'Sirkulasi terasa terputus, area publik belum bekerja sebagai penghubung, dan keputusan layout berisiko membuat ruang terasa kurang efisien.',
  },
  {
    label: 'Strategic Decision',
    body: 'Flow ruang disusun ulang dengan prioritas pada zoning, titik aktivitas, dan kemudahan bergerak. Keputusan ini diambil agar fungsi harian lebih terarah dan klien lebih mudah membaca konsekuensi setiap pilihan layout.',
  },
  {
    label: 'Execution',
    body: 'Area aktivitas utama diperjelas, transisi antar-ruang dibuat lebih logis, dan elemen visual diposisikan sebagai pendukung fungsi, bukan pusat perhatian.',
  },
  {
    label: 'Impact',
    body: 'Ruang menjadi lebih efisien, aktivitas harian lebih lancar, keputusan klien lebih cepat, dan revisi layout dapat dikurangi sejak fase awal.',
  },
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
          <p className="mt-8 max-w-3xl text-lg leading-[1.7] text-white/70 md:text-xl">
            Studi kasus singkat tentang bagaimana keputusan layout dan sirkulasi dapat mengubah ruang hunian menjadi lebih efisien, jelas, dan mudah digunakan.
          </p>
        </section>

        <section className="grid gap-8 pb-24 lg:grid-cols-5">
          {sections.map((section, index) => (
            <article key={section.label} className="border-l border-white/10 pl-6 lg:col-span-5 lg:grid lg:grid-cols-[0.8fr_2fr] lg:gap-12 lg:border-l-0 lg:border-t lg:pl-0 lg:pt-8">
              <div>
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-white/35">0{index + 1}</p>
                <h2 className="mt-3 text-sm font-bold uppercase tracking-[0.16em] text-[#D4AF37]">{section.label}</h2>
              </div>
              <p className="mt-4 max-w-3xl text-lg leading-[1.75] text-white/72 lg:mt-0">
                {section.body}
              </p>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
