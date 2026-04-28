import { ArrowUpRight, BarChart3, CheckCircle2, Compass, Layers3, MoveRight, Target } from 'lucide-react';

const framework = [
  {
    title: 'Context Reading',
    description: 'Membaca konteks ruang, perilaku, dan nilai investasi secara mendalam.',
    icon: Compass,
  },
  {
    title: 'Spatial Logic',
    description: 'Mengubah kompleksitas menjadi sistem ruang yang jelas dan sistematis.',
    icon: Layers3,
  },
  {
    title: 'Strategic Solution',
    description: 'Setiap keputusan desain memiliki alasan logis dan dampak yang terukur.',
    icon: Target,
  },
];

const decisions = [
  'Optimalisasi sirkulasi linear mengurangi gesekan fungsi dan meningkatkan efisiensi waktu.',
  'Integrasi pantry mengurangi friksi sirkulasi dan mempercepat ritme aktivitas.',
  'Variabel pencahayaan alami adalah komponen krusial dalam pembentukan atmosfer ruang yang logis.',
];

const impacts = ['Efisiensi Sirkulasi', 'Waktu Ambil Keputusan', 'Revisi Desain', 'Clarity Brief'];

const portfolio = [
  'Residential Strategy',
  'Interior System',
  'Spatial Planning',
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080807] text-[#f5f1e8]">
      <section
        id="home"
        className="relative flex min-h-screen flex-col bg-cover bg-center px-5 py-6 md:px-10 lg:px-16"
        style={{ backgroundImage: "linear-gradient(90deg, rgba(8,8,7,0.94) 0%, rgba(8,8,7,0.82) 42%, rgba(8,8,7,0.46) 100%), url('/hero.jpg')" }}
      >
        <nav className="relative z-10 flex items-center justify-between border-b border-[#d6a84f]/20 pb-6">
          <a href="#home" className="text-sm font-black uppercase tracking-[0.34em] text-[#d6a84f]">
            Eryawan Studio
          </a>
          <div className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-[0.24em] text-[#f5f1e8]/60 md:flex">
            <a className="transition hover:text-[#d6a84f]" href="#framework">Framework</a>
            <a className="transition hover:text-[#d6a84f]" href="#impact">Impact</a>
            <a className="transition hover:text-[#d6a84f]" href="#portfolio">Portfolio</a>
          </div>
        </nav>

        <div className="relative z-10 grid flex-1 items-end gap-12 pb-12 pt-24 lg:grid-cols-[1fr_0.72fr] lg:pb-20">
          <div>
            <p className="mb-8 text-xs font-bold uppercase tracking-[0.42em] text-[#d6a84f]">Ruang yang masuk akal</p>
            <h1 className="max-w-5xl text-[clamp(3.4rem,11vw,9.5rem)] font-black uppercase leading-[0.82] tracking-[-0.08em]">
              Desain Sebagai<br />Keputusan Strategis.
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-8 text-[#f5f1e8]/72 md:text-xl">
              Mengubah ruang menjadi keputusan yang berdampak jangka panjang.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a href="mailto:eryawanagungtrimuda@gmail.com" className="group inline-flex items-center justify-center gap-3 bg-[#d6a84f] px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-[#080807] transition hover:bg-[#f0c96a]">
                Mulai Konsultasi Strategis <ArrowUpRight size={18} className="transition group-hover:-translate-y-1 group-hover:translate-x-1" />
              </a>
              <a href="#framework" className="inline-flex items-center justify-center gap-3 border border-[#d6a84f]/40 px-7 py-4 text-sm font-black uppercase tracking-[0.16em] text-[#f5f1e8] transition hover:border-[#d6a84f] hover:text-[#d6a84f]">
                Eksplorasi Framework <MoveRight size={18} />
              </a>
            </div>
          </div>

          <aside className="border-l border-[#d6a84f]/25 pl-6 lg:self-end">
            <p className="text-sm uppercase tracking-[0.3em] text-[#f5f1e8]/45">Studio Principle</p>
            <p className="mt-5 max-w-md text-2xl font-semibold leading-snug text-[#f5f1e8]/88">
              Desain bukan dekorasi. Desain adalah proses menentukan apa yang paling masuk akal untuk ruang, fungsi, dan nilai aset.
            </p>
          </aside>
        </div>
      </section>

      <section id="about" className="border-y border-[#d6a84f]/15 px-5 py-24 md:px-10 lg:px-16 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <p className="text-xs font-black uppercase tracking-[0.42em] text-[#d6a84f]">Tentang Kami</p>
          <div>
            <h2 className="max-w-4xl text-4xl font-black uppercase leading-[0.95] tracking-[-0.05em] md:text-6xl">
              Desain dengan Logika,<br />Dibangun dengan Tujuan.
            </h2>
            <p className="mt-8 max-w-3xl text-lg leading-9 text-[#f5f1e8]/68">
              Kami percaya bahwa setiap ruang memiliki potensi untuk memberi dampak nyata. Melalui pendekatan strategis, kami mengubah kebutuhan menjadi keputusan desain yang fungsional, estetis, dan berkelanjutan.
            </p>
          </div>
        </div>
      </section>

      <section id="framework" className="px-5 py-24 md:px-10 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.42em] text-[#d6a84f]">Framework</p>
              <h2 className="mt-5 text-5xl font-black uppercase tracking-[-0.06em] md:text-7xl">Cara Kami Berpikir</h2>
            </div>
            <blockquote className="border-l border-[#d6a84f] pl-6 text-2xl font-semibold leading-snug text-[#f5f1e8]/82 md:text-3xl">
              Desain bukan gaya. Ia adalah sistem keputusan yang berdampak.
            </blockquote>
          </div>

          <div className="mt-16 grid gap-px overflow-hidden border border-[#d6a84f]/18 bg-[#d6a84f]/18 md:grid-cols-3">
            {framework.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="group bg-[#0e0e0c] p-8 transition hover:bg-[#15130f] md:p-10">
                  <Icon className="text-[#d6a84f]" size={32} />
                  <h3 className="mt-16 text-2xl font-black uppercase tracking-[-0.03em]">{item.title}</h3>
                  <p className="mt-5 leading-8 text-[#f5f1e8]/62">{item.description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 md:px-10 lg:px-16 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.42em] text-[#d6a84f]">Design Decisions</p>
            <h2 className="mt-5 text-5xl font-black uppercase tracking-[-0.06em] md:text-7xl">Desain = Keputusan</h2>
          </div>
          <div className="space-y-5">
            {decisions.map((decision, index) => (
              <div key={decision} className="grid gap-5 border-t border-[#d6a84f]/20 py-7 md:grid-cols-[80px_1fr]">
                <span className="text-sm font-black text-[#d6a84f]">0{index + 1}</span>
                <p className="text-xl font-medium leading-8 text-[#f5f1e8]/78">{decision}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="impact" className="bg-[#d6a84f] px-5 py-24 text-[#080807] md:px-10 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.42em] text-[#080807]/60">Impact</p>
              <h2 className="mt-5 text-5xl font-black uppercase tracking-[-0.06em] md:text-7xl">Dampak yang Terukur</h2>
            </div>
            <BarChart3 size={56} className="hidden md:block" />
          </div>
          <div className="mt-16 grid gap-px bg-[#080807]/20 md:grid-cols-4">
            {impacts.map((impact) => (
              <div key={impact} className="bg-[#d6a84f] p-7 md:min-h-48 md:p-8">
                <CheckCircle2 size={24} />
                <p className="mt-12 text-2xl font-black uppercase leading-tight tracking-[-0.04em]">{impact}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="portfolio" className="px-5 py-24 md:px-10 lg:px-16 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.42em] text-[#d6a84f]">Portfolio</p>
              <h2 className="mt-5 max-w-4xl text-5xl font-black uppercase tracking-[-0.06em] md:text-7xl">Hasil Perancangan Terukur</h2>
            </div>
            <p className="text-2xl font-semibold leading-snug text-[#f5f1e8]/78">Strategi terlihat jelas dalam hasil yang nyata.</p>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {portfolio.map((item, index) => (
              <article key={item} className="group relative min-h-[420px] overflow-hidden border border-[#d6a84f]/18 bg-[#11110f] p-7">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(214,168,79,0.26),transparent_34%),linear-gradient(135deg,rgba(245,241,232,0.08),transparent)] opacity-80 transition group-hover:scale-105" />
                <div className="relative flex h-full flex-col justify-between">
                  <span className="text-sm font-black text-[#d6a84f]">0{index + 1}</span>
                  <div>
                    <h3 className="text-3xl font-black uppercase tracking-[-0.05em]">{item}</h3>
                    <p className="mt-4 leading-7 text-[#f5f1e8]/58">Placeholder project untuk studi kasus terukur, visual final, dan keputusan strategis di balik perancangan.</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="px-5 pb-8 md:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl bg-[#f5f1e8] px-6 py-16 text-[#080807] md:px-12 lg:px-16 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.52fr] lg:items-end">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.42em] text-[#080807]/50">Closing CTA</p>
              <h2 className="mt-5 max-w-4xl text-5xl font-black uppercase leading-[0.9] tracking-[-0.07em] md:text-7xl">
                Bangun Ruang yang Bekerja untuk Anda.
              </h2>
              <p className="mt-8 text-xl font-medium text-[#080807]/62">Saatnya mengubah ruang menjadi aset bernilai.</p>
            </div>
            <a href="mailto:eryawanagungtrimuda@gmail.com" className="group inline-flex items-center justify-center gap-3 bg-[#080807] px-8 py-5 text-sm font-black uppercase tracking-[0.16em] text-[#f5f1e8] transition hover:bg-[#d6a84f] hover:text-[#080807]">
              Konsultasi Eksklusif <ArrowUpRight size={18} className="transition group-hover:-translate-y-1 group-hover:translate-x-1" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
