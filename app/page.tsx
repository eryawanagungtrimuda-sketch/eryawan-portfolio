import { ArrowDown, ArrowUp, CheckCircle2, Compass, Instagram, Mail, MessageSquare, MoveRight, Search, Zap } from 'lucide-react';

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

const decisions = [
  {
    title: 'Optimalisasi sirkulasi linear mengurangi gesekan fungsi dan meningkatkan efisiensi waktu.',
    description: 'Menghilangkan hambatan dalam pergerakan harian untuk menciptakan alur hidup yang lebih tenang.',
  },
  {
    title: 'Integrasi pantry mengurangi friksi sirkulasi dan mempercepat ritme aktivitas.',
    description: 'Menciptakan keterbukaan visual sekaligus memperluas impresi ruang secara signifikan.',
  },
  {
    title: 'Variabel pencahayaan alami adalah komponen krusial dalam pembentukan atmosfer ruang yang logis.',
    description: 'Bukan sekadar estetika, tapi keputusan strategis untuk kesehatan mental dan efisiensi energi.',
  },
];

const impacts = [
  { label: 'Efisiensi Sirkulasi', direction: 'up' },
  { label: 'Waktu Ambil Keputusan', direction: 'down' },
  { label: 'Revisi Desain', direction: 'down' },
  { label: 'Clarity Brief', direction: 'up' },
];

const differentiations = [
  {
    title: 'Bukan sekadar visual menarik.',
    description: 'Setiap proyek berbasis analisis mendalam dan struktur keputusan yang terarah.',
  },
  {
    title: 'Bukan sekadar mengikuti tren.',
    description: 'Pendekatan kami berbasis konteks tapak dan tujuan fungsional jangka panjang.',
  },
  {
    title: 'Bukan sekadar ruang.',
    description: 'Kami merancang sistem yang mendukung performa dan kesejahteraan manusia di dalamnya.',
  },
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
    <main className="min-h-screen overflow-hidden bg-[#080807] font-sans text-[#F4F1EA]">
      <section
        id="home"
        className="relative flex min-h-screen flex-col overflow-hidden bg-cover bg-center px-5 py-6 md:px-10 lg:px-20 xl:px-32"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(8,8,7,0.92) 0%, rgba(8,8,7,0.78) 34%, rgba(8,8,7,0.46) 66%, rgba(8,8,7,0.18) 100%), linear-gradient(180deg, rgba(8,8,7,0.38) 0%, rgba(8,8,7,0.08) 45%, rgba(8,8,7,0.78) 100%), url('/hero.jpg')",
        }}
      >
        <nav className="relative z-10 flex items-start justify-between gap-8">
          <a href="#home" className="group inline-flex flex-col gap-1.5">
            <span className="font-display text-2xl font-normal uppercase leading-none tracking-[0.06em] text-[#ffc400] transition duration-300 group-hover:text-[#ffd84d] md:text-[1.8rem]">
              Eryawan Studio
            </span>
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.34em] text-white/55">
              Ruang yang masuk akal
            </span>
          </a>

          <div className="hidden items-start gap-8 text-sm font-semibold text-white/78 lg:flex">
            <a className="border-b border-[#ffc400] pb-3 text-[#ffc400] transition duration-300" href="#home">Beranda</a>
            <a className="pb-3 transition duration-300 hover:text-[#ffc400]" href="#portfolio">Karya</a>
            <a className="pb-3 transition duration-300 hover:text-[#ffc400]" href="#framework">Wawasan</a>
            <a className="pb-3 transition duration-300 hover:text-[#ffc400]" href="#contact">Kontak</a>
          </div>

          <a
            href="mailto:eryawanagungtrimuda@gmail.com"
            className="hidden rounded-[4px] bg-[#ffc400] px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-[#080807] shadow-[0_18px_44px_rgba(255,196,0,0.16)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#ffd84d] md:inline-flex"
          >
            Hubungi Studio
          </a>
        </nav>

        <div className="relative z-10 grid flex-1 items-center pt-16 lg:grid-cols-[1fr_0.5fr] lg:pt-4">
          <div className="max-w-5xl lg:pl-8 xl:pl-14">
            <p className="mb-7 font-mono text-[10px] font-black uppercase tracking-[0.58em] text-[#ffc400] md:text-[11px]">
              Strategic Design Intelligence
            </p>

            <h1 className="font-display max-w-5xl text-[clamp(3.3rem,6.4vw,7.05rem)] font-normal uppercase leading-[1.01] tracking-[-0.052em] text-[#F4F1EA] drop-shadow-[0_16px_34px_rgba(0,0,0,0.42)]">
              Desain Sebagai<br />
              <span className="block text-[#ffc400] italic tracking-[-0.065em]">Keputusan</span>
              <span className="block text-[#ffc400] italic tracking-[-0.065em]">Strategis.</span>
            </h1>

            <p className="mt-7 max-w-[700px] text-lg italic leading-8 text-white/75 drop-shadow-md md:text-[1.32rem]">
              “Mengubah ruang menjadi keputusan yang berdampak jangka panjang.”
            </p>

            <div className="mt-12 flex flex-col gap-4 sm:flex-row">
              <a
                href="mailto:eryawanagungtrimuda@gmail.com"
                className="inline-flex min-w-[292px] items-center justify-center rounded-[4px] bg-[#ffc400] px-8 py-4 text-sm font-semibold uppercase tracking-[0.1em] text-[#080807] transition duration-300 hover:-translate-y-0.5 hover:bg-[#ffd84d]"
              >
                Mulai Konsultasi Strategis
              </a>
              <a
                href="#framework"
                className="inline-flex min-w-[250px] items-center justify-center rounded-[4px] border border-white/25 bg-[#11151b]/68 px-8 py-4 text-sm font-semibold uppercase tracking-[0.1em] text-white/82 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-[#ffc400]/45 hover:text-[#ffc400]"
              >
                Eksplorasi Framework
              </a>
            </div>
          </div>
        </div>

        <div className="relative z-10 hidden items-center justify-between pb-2 md:flex">
          <div className="flex items-center gap-5 text-white/55">
            <span className="h-11 w-px bg-white/25" />
            <span className="text-sm font-medium">Scroll untuk eksplorasi</span>
          </div>
          <a
            href="#contact"
            className="flex h-14 w-14 items-center justify-center rounded-[4px] bg-[#ffc400] text-[#080807] shadow-[0_16px_36px_rgba(255,196,0,0.14)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#ffd84d]"
            aria-label="Hubungi studio"
          >
            <MessageSquare size={20} strokeWidth={2} />
          </a>
        </div>
      </section>

      <section id="framework" className="relative overflow-hidden bg-[#2D2D2B] px-5 py-20 md:px-10 md:py-24 lg:px-16 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,196,0,0.09),transparent_27%),linear-gradient(180deg,rgba(255,255,255,0.035),transparent_58%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#ffc400] md:text-[11px]">Framework</p>
              <h2 className="font-display mt-5 max-w-2xl text-5xl font-normal leading-[1.02] tracking-[-0.04em] text-[#F4F1EA] md:text-7xl">
                Cara Kami Berpikir
              </h2>
            </div>
            <blockquote className="font-display max-w-4xl text-3xl italic leading-[1.12] tracking-[-0.015em] text-white/72 md:text-5xl">
              “Desain bukan gaya. Ia adalah sistem keputusan yang berdampak.”
            </blockquote>
          </div>

          <div className="mt-18 grid gap-6 md:mt-20 lg:grid-cols-3">
            {framework.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="group border border-white/10 bg-[#262624]/35 p-7 transition duration-300 hover:-translate-y-1 hover:border-[#ffc400]/30 hover:bg-[#2A2A28]/70 md:p-9">
                  <div className="mb-16 flex items-center justify-between">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-xs font-black uppercase tracking-[0.28em] text-white/36">{item.number}</span>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-[#ffc400]/75">{item.code}</span>
                    </div>
                    <span className="grid h-12 w-12 place-items-center border border-[#ffc400]/35 text-[#ffc400] transition duration-300 group-hover:border-[#ffc400]/60 group-hover:bg-[#ffc400]/10">
                      <Icon size={21} strokeWidth={1.8} />
                    </span>
                  </div>
                  <h3 className="font-display text-3xl font-normal uppercase leading-none tracking-[-0.02em] text-[#F4F1EA] md:text-4xl">
                    {item.title}
                  </h3>
                  <p className="mt-5 max-w-sm text-base leading-8 text-white/62">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="design-decisions" className="relative overflow-hidden bg-[#070707] px-5 py-20 text-white md:px-10 md:py-24 lg:px-16 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.016),transparent_42%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.78fr_1.22fr] lg:gap-24">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#ffc400] md:text-[11px]">Design Decisions</p>
            <h2 className="font-display mt-6 text-5xl font-normal leading-[1.02] tracking-[-0.04em] text-[#F4F1EA] md:text-7xl">
              Desain = Keputusan
            </h2>
            <p className="mt-8 max-w-xl text-xl italic leading-9 text-white/58 md:text-2xl">
              “Estetika adalah efek samping dari keputusan-keputusan fungsional yang diambil dengan sadar.”
            </p>
            <a href="#portfolio" className="group mt-10 inline-flex items-center gap-4 border-b border-[#ffc400]/35 pb-1 font-mono text-[11px] font-black uppercase tracking-[0.18em] text-[#ffc400] transition duration-300 hover:border-white/40 hover:text-white">
              Lihat bukti di proyek
              <MoveRight size={18} className="transition duration-300 group-hover:translate-x-1" />
            </a>
          </div>

          <div className="space-y-12 lg:pt-3">
            {decisions.map((decision, index) => (
              <article key={decision.title} className="group relative border-l border-white/10 pl-8 transition duration-300 hover:border-[#ffc400]/30 md:pl-10">
                <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-[#ffc400]/70 opacity-70 transition duration-300 group-hover:opacity-100" />
                <p className="mb-4 font-mono text-[10px] font-black uppercase tracking-[0.26em] text-white/28">0{index + 1}</p>
                <h3 className="max-w-2xl text-xl font-black leading-7 tracking-[-0.035em] text-[#F4F1EA] md:text-2xl">
                  {decision.title}
                </h3>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/48 md:text-lg">
                  {decision.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="impact" className="relative overflow-hidden bg-[#142030] px-5 py-20 text-white md:px-10 md:py-24 lg:px-16 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(255,196,0,0.055),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.018),transparent_44%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="text-center">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#ffc400] md:text-[11px]">Impact</p>
            <h2 className="font-display mt-5 text-5xl font-normal leading-[1.02] tracking-[-0.04em] text-[#F4F1EA] md:text-7xl">
              Dampak yang Terukur
            </h2>
          </div>

          <div className="mt-18 grid gap-6 md:mt-20 md:grid-cols-2 lg:grid-cols-4">
            {impacts.map((impact, index) => (
              <div key={impact.label} className="group border border-white/8 bg-white/[0.015] px-6 py-9 text-center transition duration-300 hover:-translate-y-1 hover:border-[#ffc400]/25 hover:bg-white/[0.035]">
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-white/28">0{index + 1}</p>
                <div className="mt-8 flex justify-center text-[#ffc400]/62 transition duration-300 group-hover:text-[#ffc400]">
                  {impact.direction === 'up' ? <ArrowUp size={62} strokeWidth={1.5} /> : <ArrowDown size={62} strokeWidth={1.5} />}
                </div>
                <p className="mt-7 font-mono text-xs font-black uppercase tracking-[0.2em] text-white/70">
                  {impact.direction === 'up' ? '↑ ' : '↓ '}{impact.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-18 max-w-3xl text-center md:mt-20">
            <p className="text-lg italic leading-8 text-white/58 md:text-2xl">
              “Desain yang terukur menghasilkan keputusan yang lebih pasti.”
            </p>
            <p className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/26">
              * Parameter optimasi pada setiap fase kolaborasi.
            </p>
          </div>
        </div>
      </section>

      <section id="differentiation" className="relative overflow-hidden bg-[#2D2D2B] px-5 py-20 md:px-10 md:py-24 lg:px-16 lg:py-32">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#ffc400]/12" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.56em] text-[#ffc400] md:text-[11px]">Differentiation</p>
            <h2 className="font-display mt-6 text-5xl font-normal leading-[1.02] tracking-[-0.04em] text-[#F4F1EA] md:text-7xl">
              Apa yang Membedakan
            </h2>
          </div>

          <div className="mt-16 grid gap-10 lg:grid-cols-3 lg:gap-0">
            {differentiations.map((item, index) => (
              <article key={item.title} className="group lg:border-l lg:border-white/10 lg:px-10 first:lg:border-l-0 first:lg:pl-0 last:lg:pr-0">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="mt-1 shrink-0 text-[#ffc400]/85 transition duration-300 group-hover:text-[#ffc400]" size={18} strokeWidth={2.2} />
                  <div>
                    <p className="mb-4 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-white/28">0{index + 1}</p>
                    <h3 className="text-lg font-semibold uppercase leading-snug tracking-[-0.02em] text-[#F4F1EA] md:text-xl">
                      {item.title}
                    </h3>
                    <p className="mt-5 max-w-sm text-base leading-8 text-white/58">
                      {item.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="portfolio" className="relative overflow-hidden bg-[#142030] px-5 py-20 text-white md:px-10 md:py-24 lg:px-16 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.018),transparent_40%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.42fr] lg:items-center">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#ffc400] md:text-[11px]">Portfolio Framework</p>
              <h2 className="font-display mt-6 max-w-4xl text-5xl font-normal leading-[1.02] tracking-[-0.04em] text-[#F4F1EA] md:text-7xl">
                Hasil Perancangan Terukur
              </h2>
              <div className="mt-10 flex items-start gap-7">
                <span className="mt-2 h-10 w-px bg-[#ffc400]/50" />
                <p className="max-w-3xl text-2xl italic leading-9 text-white/50 md:text-3xl">
                  “Strategi terlihat jelas dalam hasil yang nyata.”
                </p>
              </div>
            </div>

            <a href="#contact" className="group inline-flex items-center gap-4 justify-self-start border-b border-white/20 pb-1 font-mono text-xs font-black uppercase tracking-[0.18em] text-white/88 transition duration-300 hover:border-[#ffc400]/50 hover:text-[#ffc400] lg:justify-self-end">
              Lihat Semua Karya
              <MoveRight className="text-[#ffc400] transition duration-300 group-hover:translate-x-1" size={20} />
            </a>
          </div>

          <div className="mt-20 grid gap-8 lg:grid-cols-2">
            {portfolioWorks.map((work) => (
              <article key={work.title} className="group relative aspect-[1.18/1] min-h-[360px] overflow-hidden rounded-sm border border-white/8 bg-[#0C0D0F] md:min-h-[440px]">
                <div
                  className="absolute inset-0 scale-100 bg-cover bg-center opacity-85 transition duration-300 group-hover:scale-[1.02] group-hover:opacity-100"
                  style={{
                    backgroundImage: `radial-gradient(circle at 24% 18%, rgba(255,196,0,0.22), transparent 28%), linear-gradient(135deg, rgba(255,255,255,0.08), rgba(0,0,0,0.2)), url('${work.image}')`,
                  }}
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,8,7,0.16)_0%,rgba(8,8,7,0.46)_40%,rgba(8,8,7,0.94)_100%)] transition duration-300 group-hover:bg-[linear-gradient(180deg,rgba(8,8,7,0.10)_0%,rgba(8,8,7,0.36)_40%,rgba(8,8,7,0.88)_100%)]" />
                <div className="relative z-10 flex h-full flex-col justify-end p-8 md:p-12">
                  <div className="transition duration-300 group-hover:-translate-y-1">
                    <p className="font-mono text-[10px] font-black uppercase tracking-[0.42em] text-[#ffc400] md:text-[11px]">
                      {work.category}
                    </p>
                    <h3 className="font-display mt-5 max-w-2xl text-4xl font-normal leading-[0.96] tracking-[-0.03em] text-[#F4F1EA] md:text-5xl">
                      {work.title}
                    </h3>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="relative overflow-hidden bg-[#050505] px-5 py-20 text-white md:px-10 md:py-24 lg:px-16 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,196,0,0.045),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-5xl text-center">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#ffc400] md:text-[11px]">
              Mulai Kolaborasi
            </p>
            <h2 className="font-display mt-8 text-5xl font-normal italic leading-[1.04] tracking-[-0.045em] text-[#F4F1EA] md:text-7xl lg:text-8xl">
              Bangun Ruang yang Bekerja untuk Anda.
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-lg leading-8 text-white/62 md:text-2xl">
              Saatnya mengubah ruang menjadi aset bernilai.
            </p>

            <a
              href="mailto:eryawanagungtrimuda@gmail.com"
              className="mt-14 inline-flex min-w-[300px] items-center justify-center rounded-[4px] bg-[#ffc400] px-10 py-5 text-sm font-semibold uppercase tracking-[0.12em] text-[#080807] shadow-[0_22px_50px_rgba(255,196,0,0.14)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#ffd84d] md:min-w-[420px]"
            >
              Konsultasi Eksklusif
            </a>

            <p className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/22">
              Respon langsung oleh desainer, bukan bot.
            </p>

            <div className="mt-8 flex items-center justify-center gap-8 text-white/42">
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noreferrer"
                className="transition duration-300 hover:-translate-y-0.5 hover:text-[#ffc400]"
                aria-label="Instagram"
              >
                <Instagram size={20} strokeWidth={1.8} />
              </a>
              <a
                href="mailto:eryawanagungtrimuda@gmail.com"
                className="transition duration-300 hover:-translate-y-0.5 hover:text-[#ffc400]"
                aria-label="Email"
              >
                <Mail size={20} strokeWidth={1.8} />
              </a>
            </div>
          </div>

          <div className="mt-20 h-px w-full bg-white/8" />

          <div className="mt-14 flex flex-col gap-6 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/28 md:flex-row md:items-center md:justify-between md:text-[11px]">
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
