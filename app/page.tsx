import { ArrowDown, ArrowUp, ArrowUpRight, CheckCircle2, Compass, Instagram, Mail, MoveRight, Search, Zap } from 'lucide-react';

const framework = [
  {
    title: 'Context Reading',
    description: 'Membaca konteks ruang, perilaku, dan nilai investasi secara mendalam sebelum keputusan visual dibuat.',
    icon: Search,
    number: '01',
    code: 'READ',
  },
  {
    title: 'Spatial Logic',
    description: 'Mengubah kompleksitas kebutuhan menjadi sistem ruang yang jelas, efisien, dan mudah dijalankan.',
    icon: Compass,
    number: '02',
    code: 'PLAN',
  },
  {
    title: 'Strategic Solution',
    description: 'Merancang keputusan desain dengan alasan logis, prioritas yang tegas, dan dampak yang dapat dibaca.',
    icon: Zap,
    number: '03',
    code: 'ACT',
  },
];

const differentiations = [
  {
    title: 'Bukan Sekadar Visual Menarik.',
    description: 'Setiap proyek berbasis analisis mendalam dan struktur keputusan yang terarah.',
  },
  {
    title: 'Bukan Sekadar Mengikuti Tren.',
    description: 'Pendekatan kami berbasis konteks tapak dan tujuan fungsional jangka panjang.',
  },
  {
    title: 'Bukan Sekadar Ruang.',
    description: 'Kami merancang sistem yang mendukung performa dan kesejahteraan manusia di dalamnya.',
  },
];

const decisions = [
  'Optimalisasi sirkulasi linear mengurangi gesekan fungsi dan meningkatkan efisiensi waktu.',
  'Integrasi pantry mengurangi friksi sirkulasi dan mempercepat ritme aktivitas.',
  'Variabel pencahayaan alami adalah komponen krusial dalam pembentukan atmosfer ruang yang logis.',
];

const impacts = [
  { label: 'Efisiensi Sirkulasi', direction: 'up' },
  { label: 'Waktu Ambil Keputusan', direction: 'down' },
  { label: 'Revisi Desain', direction: 'down' },
  { label: 'Clarity Brief', direction: 'up' },
];

const portfolioWorks = [
  {
    title: 'Alana Resident',
    category: 'Interior — Rumah Tinggal',
    image: '/portfolio/alana-resident.jpg',
  },
  {
    title: 'Citraland: JADE Lakefront Hillside Living',
    category: 'Interior — Rumah Tinggal',
    image: '/portfolio/jade-lakefront.jpg',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#080807] font-sans text-[#f5f1e8]">
      <section
        id="home"
        className="relative flex min-h-screen flex-col overflow-hidden bg-cover bg-center px-6 py-7 md:px-10 lg:px-16 xl:px-24"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(8,8,7,0.91) 0%, rgba(8,8,7,0.73) 34%, rgba(8,8,7,0.43) 62%, rgba(8,8,7,0.16) 100%), linear-gradient(180deg, rgba(8,8,7,0.32) 0%, rgba(8,8,7,0.08) 42%, rgba(8,8,7,0.64) 100%), url('/hero.jpg')",
        }}
      >
        <nav className="relative z-10 flex items-start justify-between gap-8">
          <a href="#home" className="group inline-flex flex-col gap-1">
            <span className="text-lg font-black uppercase leading-none tracking-[0.16em] text-[#ffc400] md:text-2xl">
              Eryawan Studio
            </span>
            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.34em] text-white/72">
              Ruang yang masuk akal
            </span>
          </a>

          <div className="hidden items-center gap-12 text-sm font-bold text-white/82 lg:flex">
            <a className="border-b-2 border-[#ffc400] pb-3 text-[#ffc400]" href="#home">Beranda</a>
            <a className="pb-3 transition hover:text-[#ffc400]" href="#portfolio">Karya</a>
            <a className="pb-3 transition hover:text-[#ffc400]" href="#framework">Wawasan</a>
            <a className="pb-3 transition hover:text-[#ffc400]" href="#contact">Kontak</a>
          </div>

          <a
            href="mailto:eryawanagungtrimuda@gmail.com"
            className="hidden rounded-md bg-[#ffc400] px-7 py-4 font-mono text-[11px] font-black uppercase tracking-[0.22em] text-[#080807] shadow-[0_16px_40px_rgba(255,196,0,0.18)] transition hover:bg-[#ffd84d] md:inline-flex"
          >
            Hubungi Studio
          </a>
        </nav>

        <div className="relative z-10 grid flex-1 items-center pt-20 lg:grid-cols-[1fr_0.58fr] lg:pt-10">
          <div className="max-w-5xl lg:pl-14 xl:pl-20">
            <p className="mb-8 font-mono text-[11px] font-black uppercase tracking-[0.58em] text-[#ffc400]">
              Strategic Design Intelligence
            </p>

            <h1 className="font-display max-w-5xl text-[clamp(4.2rem,8.9vw,9.4rem)] font-normal uppercase leading-[0.79] tracking-[-0.06em] text-white">
              Desain Sebagai<br />
              <span className="block text-[#ffc400] italic tracking-[-0.075em]">Keputusan</span>
              <span className="block text-[#ffc400] italic tracking-[-0.075em]">Strategis.</span>
            </h1>

            <div className="mt-7 flex max-w-3xl flex-col gap-3 md:flex-row md:items-end">
              <p className="max-w-2xl text-lg italic leading-8 text-white/72 md:text-2xl">
                “Mengubah ruang menjadi keputusan yang berdampak jangka panjang.”
              </p>
              <span className="font-signature text-4xl leading-none text-[#ffc400]/86 md:text-5xl">Eryawan</span>
            </div>

            <div className="mt-12 flex flex-col gap-4 sm:flex-row">
              <a
                href="mailto:eryawanagungtrimuda@gmail.com"
                className="inline-flex items-center justify-center rounded-md bg-[#ffc400] px-8 py-5 font-mono text-[11px] font-black uppercase tracking-[0.22em] text-[#080807] transition hover:bg-[#ffd84d] md:px-10"
              >
                Mulai Konsultasi Strategis
              </a>
              <a
                href="#framework"
                className="inline-flex items-center justify-center rounded-md border border-white/12 bg-[#11151b]/78 px-8 py-5 font-mono text-[11px] font-black uppercase tracking-[0.22em] text-white/88 backdrop-blur transition hover:border-[#ffc400]/60 hover:text-[#ffc400] md:px-10"
              >
                Eksplorasi Framework
              </a>
            </div>
          </div>

          <aside className="mt-16 hidden max-w-sm self-end justify-self-end border-l border-white/20 pl-7 pb-20 lg:block">
            <p className="font-mono text-[11px] font-black uppercase tracking-[0.34em] text-[#ffc400]">Studio Principle</p>
            <p className="mt-5 text-xl font-medium leading-8 text-white/70">
              Desain bukan dekorasi. Ia adalah proses menentukan apa yang paling masuk akal untuk ruang, fungsi, dan nilai aset.
            </p>
          </aside>
        </div>

        <div className="relative z-10 hidden items-center justify-between pb-2 text-white/62 md:flex">
          <div className="flex items-center gap-5">
            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 font-mono text-sm">N</span>
            <span className="h-10 w-px bg-white/22" />
            <span className="text-sm font-medium">Scroll untuk eksplorasi</span>
          </div>
          <a
            href="#contact"
            className="flex h-14 w-14 items-center justify-center rounded-md bg-[#ffc400] text-[#080807] transition hover:bg-[#ffd84d]"
            aria-label="Hubungi studio"
          >
            <ArrowUpRight size={20} />
          </a>
        </div>
      </section>

      <section id="framework" className="relative overflow-hidden bg-[#30302f] px-5 py-24 md:px-10 lg:px-16 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,196,0,0.10),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_55%)]" />
        <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px bg-white/[0.035]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.74fr_1.26fr] lg:items-end">
            <div>
              <p className="font-mono text-[11px] font-black uppercase tracking-[0.52em] text-[#ffc400]">Framework</p>
              <h2 className="font-display mt-5 max-w-2xl text-5xl font-normal leading-[0.96] tracking-[-0.04em] text-white md:text-7xl">
                Cara Kami Berpikir
              </h2>
            </div>
            <div>
              <blockquote className="font-display max-w-4xl text-3xl italic leading-[1.06] tracking-[-0.015em] text-white/72 md:text-5xl">
                “Desain bukan gaya. Ia adalah sistem keputusan yang berdampak.”
              </blockquote>
              <p className="mt-7 max-w-2xl text-base leading-8 text-white/46">
                Framework ini menjaga proses desain tetap objektif: membaca konteks, menyusun logika ruang, lalu memilih solusi yang paling bernilai.
              </p>
            </div>
          </div>

          <div className="mt-20 grid gap-8 lg:grid-cols-3">
            {framework.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="group border-t border-[#ffc400]/35 pt-8">
                  <div className="mb-14 flex items-center justify-between">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-xs font-black uppercase tracking-[0.28em] text-white/34">{item.number}</span>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-[#ffc400]/70">{item.code}</span>
                    </div>
                    <span className="grid h-12 w-12 place-items-center border border-[#ffc400]/35 text-[#ffc400] transition group-hover:bg-[#ffc400] group-hover:text-[#080807]">
                      <Icon size={21} strokeWidth={1.9} />
                    </span>
                  </div>
                  <h3 className="font-display text-3xl font-normal uppercase leading-none tracking-[-0.02em] text-white md:text-4xl">
                    {item.title}
                  </h3>
                  <p className="mt-5 max-w-sm text-base leading-8 text-white/44 transition group-hover:text-white/64">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="px-5 py-24 md:px-10 lg:px-16 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="font-mono text-[11px] font-black uppercase tracking-[0.42em] text-[#d6a84f]">Design Decisions</p>
            <h2 className="font-display mt-5 text-6xl font-normal leading-[0.9] tracking-[-0.045em] md:text-8xl">Desain = Keputusan</h2>
          </div>
          <div className="space-y-5">
            {decisions.map((decision, index) => (
              <div key={decision} className="grid gap-5 border-t border-[#d6a84f]/20 py-7 md:grid-cols-[80px_1fr]">
                <span className="font-mono text-sm font-black text-[#d6a84f]">0{index + 1}</span>
                <p className="text-xl font-medium leading-8 text-[#f5f1e8]/78">{decision}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="impact" className="relative overflow-hidden bg-[#142233] px-5 py-28 text-white md:px-10 lg:px-16 lg:py-36">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,196,0,0.055),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.018),transparent_42%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="text-center">
            <p className="font-mono text-[11px] font-black uppercase tracking-[0.52em] text-[#ffc400]">Impact</p>
            <h2 className="font-display mt-5 text-5xl font-normal leading-[0.95] tracking-[-0.04em] text-white md:text-7xl">
              Dampak yang Terukur
            </h2>
          </div>

          <div className="mt-20 grid gap-14 md:grid-cols-2 lg:grid-cols-4">
            {impacts.map((impact) => (
              <div key={impact.label} className="flex flex-col items-center text-center">
                <div className="mb-5 text-[#7d6726]">
                  {impact.direction === 'up' ? (
                    <ArrowUp size={58} strokeWidth={1.7} />
                  ) : (
                    <ArrowDown size={58} strokeWidth={1.7} />
                  )}
                </div>
                <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-[#a9b3c0]">
                  {impact.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-20 max-w-3xl text-center">
            <p className="text-lg italic leading-8 text-white/55 md:text-2xl">
              “Desain yang terukur menghasilkan keputusan yang lebih pasti.”
            </p>
            <p className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/24">
              * Parameter optimasi pada setiap fase kolaborasi.
            </p>
          </div>
        </div>
      </section>

      <section id="differentiation" className="relative overflow-hidden bg-[#30302f] px-5 py-24 md:px-10 lg:px-16 lg:py-32">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#ffc400]/12" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-[#080807]/50" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="font-mono text-[11px] font-black uppercase tracking-[0.56em] text-[#ffc400]">Differentiation</p>
            <h2 className="font-display mt-6 text-5xl font-normal leading-[0.95] tracking-[-0.045em] text-white md:text-7xl">
              Apa yang Membedakan
            </h2>
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-3">
            {differentiations.map((item) => (
              <article key={item.title} className="group">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="mt-1 shrink-0 text-[#ffc400]" size={18} strokeWidth={2.4} />
                  <div>
                    <h3 className="text-lg font-black uppercase leading-snug tracking-[-0.035em] text-white md:text-xl">
                      {item.title}
                    </h3>
                    <div className="mt-6 border-l border-white/12 pl-6">
                      <p className="max-w-sm text-base leading-8 text-white/38 transition group-hover:text-white/58">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="portfolio" className="relative overflow-hidden bg-[#142233] px-5 py-24 text-white md:px-10 lg:px-16 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.018),transparent_38%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.42fr] lg:items-center">
            <div>
              <p className="font-mono text-[11px] font-black uppercase tracking-[0.52em] text-[#ffc400]">Portfolio Framework</p>
              <h2 className="font-display mt-6 max-w-4xl text-5xl font-normal leading-[0.95] tracking-[-0.045em] text-white md:text-7xl">
                Hasil Perancangan Terukur
              </h2>
              <div className="mt-10 flex items-start gap-8">
                <span className="mt-2 h-10 w-px bg-[#ffc400]/50" />
                <p className="max-w-3xl text-2xl italic leading-9 text-white/42 md:text-3xl">
                  “Strategi terlihat jelas dalam hasil yang nyata.”
                </p>
              </div>
            </div>

            <a href="#contact" className="group inline-flex items-center gap-4 justify-self-start font-mono text-xs font-black uppercase tracking-[0.18em] text-white transition hover:text-[#ffc400] lg:justify-self-end">
              Lihat Semua Karya
              <MoveRight className="text-[#ffc400] transition group-hover:translate-x-1" size={20} />
            </a>
          </div>

          <div className="mt-20 grid gap-10 lg:grid-cols-2">
            {portfolioWorks.map((work) => (
              <article key={work.title} className="group relative min-h-[390px] overflow-hidden rounded-sm bg-[#0d0e10] md:min-h-[440px]">
                <img src={work.image} alt={work.title} className="absolute inset-0 h-full w-full object-cover opacity-62 transition duration-700 group-hover:scale-105 group-hover:opacity-78" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,7,0.18)_0%,rgba(8,8,7,0.42)_38%,rgba(8,8,7,0.94)_100%)]" />
                <div className="relative z-10 flex min-h-[390px] flex-col justify-end p-8 md:min-h-[440px] md:p-12">
                  <p className="font-mono text-[11px] font-black uppercase tracking-[0.42em] text-[#ffc400]">
                    {work.category}
                  </p>
                  <h3 className="font-display mt-5 max-w-2xl text-4xl font-normal leading-none tracking-[-0.035em] text-white md:text-5xl">
                    {work.title}
                  </h3>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="relative overflow-hidden bg-[#050505] px-5 py-24 text-white md:px-10 lg:px-16 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,196,0,0.04),transparent_28%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-5xl text-center">
            <p className="font-mono text-[11px] font-black uppercase tracking-[0.52em] text-[#ffc400]">
              Mulai Kolaborasi
            </p>
            <h2 className="font-display mt-8 text-5xl font-normal italic leading-[0.98] tracking-[-0.05em] text-white md:text-7xl lg:text-8xl">
              Bangun Ruang yang Bekerja untuk Anda.
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-xl leading-8 text-white/42 md:text-2xl">
              Saatnya Mengubah Ruang Menjadi Aset Bernilai.
            </p>

            <a
              href="mailto:eryawanagungtrimuda@gmail.com"
              className="mt-14 inline-flex min-w-[300px] items-center justify-center rounded-[4px] bg-[#ffc400] px-10 py-6 font-mono text-xs font-black uppercase tracking-[0.34em] text-[#080807] transition hover:bg-[#ffd84d] md:min-w-[420px]"
            >
              Konsultasi Eksklusif
            </a>

            <p className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/18">
              Respon langsung oleh desainer, bukan bot.
            </p>

            <div className="mt-8 flex items-center justify-center gap-8 text-white/38">
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-[#ffc400]"
                aria-label="Instagram"
              >
                <Instagram size={20} strokeWidth={1.8} />
              </a>
              <a
                href="mailto:eryawanagungtrimuda@gmail.com"
                className="transition hover:text-[#ffc400]"
                aria-label="Email"
              >
                <Mail size={20} strokeWidth={1.8} />
              </a>
            </div>
          </div>

          <div className="mt-20 h-px w-full bg-white/8" />

          <div className="mt-14 flex flex-col gap-6 font-mono text-[11px] font-bold uppercase tracking-[0.22em] text-white/24 md:flex-row md:items-center md:justify-between">
            <p>© 2026 Eryawan Studio — Strategic Design & Spatial Logic</p>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-8">
              <span>Panel</span>
              <span>Surabaya • Melayani Indonesia</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
