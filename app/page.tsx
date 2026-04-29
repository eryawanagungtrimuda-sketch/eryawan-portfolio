import { ArrowDown, ArrowUp, CheckCircle2, Compass, Instagram, Mail, MessageSquare, MoveRight, Search, Zap } from 'lucide-react';

const clientWorkflow = [
  {
    title: 'Tidak hanya menerima brief.',
    description:
      'Saya membaca masalah di balik permintaan, lalu membantu memperjelas keputusan desain yang benar-benar dibutuhkan.',
    number: '01',
  },
  {
    title: 'Tidak hanya menggambar ruang.',
    description:
      'Saya menyusun logika sirkulasi, fungsi, material, dan pengalaman ruang agar desain bekerja secara nyata bagi pengguna ruang.',
    number: '02',
  },
  {
    title: 'Tidak hanya mengikuti preferensi.',
    description:
      'Saya membantu klien dan pengambil keputusan melihat konsekuensi jangka panjang dari setiap keputusan desain.',
    number: '03',
  },
];

const framework = [
  {
    title: 'Context Reading',
    description: 'Membaca konteks ruang, perilaku pengguna ruang, tujuan bisnis, dan batasan proyek.',
    icon: Search,
    number: '01',
    code: 'READ',
  },
  {
    title: 'Spatial Logic',
    description: 'Mengubah kebutuhan dan kompleksitas menjadi sistem ruang yang jelas, efisien, dan mudah dijalankan.',
    icon: Compass,
    number: '02',
    code: 'PLAN',
  },
  {
    title: 'Strategic Decision',
    description: 'Setiap keputusan desain harus punya alasan, prioritas, dan dampak yang dapat dipahami.',
    icon: Zap,
    number: '03',
    code: 'ACT',
  },
];

const decisions = [
  {
    title: 'Sirkulasi yang jelas mengurangi friksi aktivitas dan meningkatkan efisiensi penggunaan ruang.',
    description: 'Alur ruang yang terstruktur membuat pengguna ruang bergerak lebih natural, cepat, dan tidak saling mengganggu.',
  },
  {
    title: 'Pencahayaan yang tepat membentuk atmosfer, fokus, dan kenyamanan.',
    description: 'Cahaya bukan hanya elemen visual, tetapi alat untuk mengatur mood, ritme aktivitas, dan kualitas pengalaman ruang.',
  },
  {
    title: 'Material yang dipilih dengan sadar memengaruhi durabilitas, biaya, dan persepsi nilai.',
    description: 'Setiap material perlu dipilih berdasarkan fungsi, karakter penggunaan, perawatan, dan dampak jangka panjang.',
  },
  {
    title: 'Layout yang logis membantu klien mengambil keputusan lebih cepat dan terarah.',
    description: 'Ketika prioritas ruang jelas, proses evaluasi menjadi lebih objektif dan keputusan desain lebih mudah disepakati.',
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
    title: 'Project 01 — Residential Interior',
    problem: 'Sirkulasi harian tidak efisien dan area publik terasa terputus.',
    decision: 'Menyusun ulang flow ruang, memperjelas zoning, dan mengoptimalkan titik aktivitas.',
    impact: 'Ruang terasa lebih terarah, fungsional, dan mudah digunakan.',
  },
  {
    title: 'Project 02 — Workspace Interior',
    problem: 'Area kerja tidak mendukung fokus dan kolaborasi secara seimbang.',
    decision: 'Membagi ruang berdasarkan intensitas aktivitas dan kebutuhan privasi.',
    impact: 'Ritme kerja lebih jelas, nyaman, dan produktif.',
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
            <span className="font-display text-2xl font-normal uppercase leading-none tracking-[0.06em] text-[#C8A951] transition duration-300 group-hover:text-[#D7BD72] md:text-[1.8rem]">
              Eryawan Studio
            </span>
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.34em] text-white/50">
              Ruang yang masuk akal
            </span>
          </a>

          <div className="hidden items-start gap-8 text-sm font-medium text-white/70 lg:flex">
            <a className="border-b border-[#C8A951]/70 pb-3 text-[#C8A951] transition duration-300" href="#home">Beranda</a>
            <a className="pb-3 transition duration-300 hover:text-[#C8A951]" href="#portfolio">Karya</a>
            <a className="pb-3 transition duration-300 hover:text-[#C8A951]" href="#framework">Wawasan</a>
            <a className="pb-3 transition duration-300 hover:text-[#C8A951]" href="#contact">Kontak</a>
          </div>

          <a
            href="mailto:eryawanagungtrimuda@gmail.com"
            className="hidden rounded-[4px] bg-[#C8A951] px-7 py-3.5 text-sm font-semibold uppercase tracking-[0.08em] text-[#080807] shadow-[0_18px_44px_rgba(200,169,81,0.14)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#D7BD72] md:inline-flex"
          >
            Hubungi Studio
          </a>
        </nav>

        <div className="relative z-10 grid flex-1 items-center pt-16 lg:grid-cols-[1fr_0.5fr] lg:pt-4">
          <div className="max-w-6xl lg:pl-8 xl:pl-14">
            <p className="mb-7 font-mono text-[10px] font-black uppercase tracking-[0.56em] text-[#C8A951] md:text-[11px]">
              Strategic Design Intelligence
            </p>

            <h1 className="font-display max-w-6xl text-[clamp(3rem,5.7vw,6.45rem)] font-normal uppercase leading-[1.08] tracking-[-0.045em] text-[#F4F1EA] drop-shadow-[0_16px_34px_rgba(0,0,0,0.42)]">
              Desain Bukan Sekadar Visual.<br />
              <span className="block text-[#C8A951] italic tracking-[-0.055em]">Ini Adalah Keputusan Bisnis.</span>
            </h1>

            <p className="mt-8 max-w-3xl text-lg leading-[1.65] text-white/72 drop-shadow-md md:text-[1.25rem]">
              Saya membantu klien dan tim merancang ruang yang tidak hanya indah, tetapi efisien, terukur, dan berdampak jangka panjang.
            </p>

            <div className="mt-12 flex flex-col gap-4 sm:flex-row">
              <a
                href="mailto:eryawanagungtrimuda@gmail.com"
                className="inline-flex min-w-[300px] items-center justify-center rounded-[4px] bg-[#C8A951] px-8 py-4.5 text-sm font-semibold uppercase tracking-[0.1em] text-[#080807] transition duration-300 hover:-translate-y-0.5 hover:bg-[#D7BD72]"
              >
                Diskusikan Proyek Secara Strategis
              </a>
              <a
                href="#framework"
                className="inline-flex min-w-[250px] items-center justify-center rounded-[4px] border border-white/20 bg-[#11151b]/58 px-8 py-4.5 text-sm font-semibold uppercase tracking-[0.1em] text-white/70 backdrop-blur transition duration-300 hover:-translate-y-0.5 hover:border-[#C8A951]/35 hover:text-[#C8A951]"
              >
                Lihat Cara Saya Berpikir
              </a>
            </div>
          </div>
        </div>

        <div className="relative z-10 hidden items-center justify-between pb-2 md:flex">
          <div className="flex items-center gap-5 text-white/62">
            <span className="h-10 w-px bg-white/25" />
            <span className="text-sm font-medium">Scroll untuk eksplorasi</span>
          </div>
          <a
            href="#contact"
            className="flex h-14 w-14 items-center justify-center rounded-[4px] bg-[#C8A951] text-[#080807] shadow-[0_16px_36px_rgba(200,169,81,0.14)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#D7BD72]"
            aria-label="Hubungi studio"
          >
            <MessageSquare size={20} strokeWidth={2} />
          </a>
        </div>
      </section>

      <section id="client-workflow" className="relative overflow-hidden bg-[#090909] px-5 py-16 text-white md:px-10 md:py-24 lg:px-16 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(200,169,81,0.055),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.014),transparent_42%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#C8A951] md:text-[11px]">Client Collaboration</p>
              <h2 className="font-display mt-5 max-w-3xl text-5xl font-normal leading-[1.08] tracking-[-0.038em] text-[#F4F1EA] md:text-7xl">
                Cara Saya Bekerja dengan Klien
              </h2>
            </div>
            <p className="max-w-3xl text-lg leading-[1.7] text-white/70 md:text-xl">
              Saya tidak hanya menerjemahkan brief menjadi gambar. Saya membantu membaca konteks, mempertanyakan keputusan yang kurang efisien, dan menyusun solusi ruang yang masuk akal secara fungsi, estetika, dan dampak bisnis.
            </p>
          </div>

          <div className="mt-16 grid gap-6 lg:grid-cols-3">
            {clientWorkflow.map((item) => (
              <article key={item.title} className="group border border-white/10 bg-white/[0.02] p-8 transition duration-300 hover:-translate-y-1 hover:border-[#C8A951]/25 hover:bg-white/[0.035] md:p-10">
                <div className="mb-14 flex items-center justify-between">
                  <span className="font-mono text-xs font-black uppercase tracking-[0.28em] text-white/48">{item.number}</span>
                  <CheckCircle2 className="text-[#C8A951]/70 transition duration-300 group-hover:text-[#C8A951]" size={22} strokeWidth={1.9} />
                </div>
                <h3 className="font-display text-3xl font-normal leading-[1.08] tracking-[-0.028em] text-white/90 md:text-4xl">
                  {item.title}
                </h3>
                <p className="mt-6 text-base leading-[1.7] text-white/62">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="framework" className="relative overflow-hidden bg-[#2D2D2B] px-5 py-16 md:px-10 md:py-24 lg:px-16 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(200,169,81,0.08),transparent_27%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_58%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#C8A951] md:text-[11px]">Framework</p>
              <h2 className="font-display mt-5 max-w-2xl text-5xl font-normal leading-[1.08] tracking-[-0.038em] text-[#F4F1EA] md:text-7xl">
                Cara Saya Berpikir
              </h2>
            </div>
            <blockquote className="font-display max-w-4xl text-3xl italic leading-[1.16] tracking-[-0.012em] text-white/80 md:text-5xl">
              “Desain yang baik tidak berhenti pada bentuk. Ia harus menjawab alasan, fungsi, dan dampak.”
            </blockquote>
          </div>

          <div className="mt-20 grid gap-6 lg:grid-cols-3">
            {framework.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="group border border-white/10 bg-white/[0.02] p-8 transition duration-300 hover:-translate-y-1 hover:border-[#C8A951]/25 hover:bg-white/[0.035] md:p-10">
                  <div className="mb-16 flex items-center justify-between">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-xs font-black uppercase tracking-[0.28em] text-white/45">{item.number}</span>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-[#C8A951]/70">{item.code}</span>
                    </div>
                    <span className="grid h-12 w-12 place-items-center border border-[#C8A951]/30 text-[#C8A951]/80 transition duration-300 group-hover:border-[#C8A951]/55 group-hover:bg-[#C8A951]/10 group-hover:text-[#C8A951]">
                      <Icon size={21} strokeWidth={1.8} />
                    </span>
                  </div>
                  <h3 className="font-display text-3xl font-normal uppercase leading-none tracking-[-0.02em] text-white/90 md:text-4xl">
                    {item.title}
                  </h3>
                  <p className="mt-6 max-w-sm text-base leading-[1.7] text-white/63">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="design-decisions" className="relative overflow-hidden bg-[#070707] px-5 py-16 text-white md:px-10 md:py-24 lg:px-16 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.014),transparent_42%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-16 lg:grid-cols-[0.78fr_1.22fr] lg:gap-24">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#C8A951] md:text-[11px]">Design Decisions</p>
            <h2 className="font-display mt-6 text-5xl font-normal leading-[1.08] tracking-[-0.038em] text-[#F4F1EA] md:text-7xl">
              Setiap Ruang Adalah Keputusan
            </h2>
            <p className="mt-8 max-w-xl text-lg leading-[1.7] text-white/70 md:text-xl">
              Saya melihat ruang sebagai rangkaian keputusan. Dari sirkulasi, pencahayaan, material, hingga ritme aktivitas—semuanya harus bekerja sebagai sistem, bukan sekadar komposisi visual.
            </p>
            <p className="font-display mt-10 max-w-xl text-3xl italic leading-[1.4] tracking-[-0.025em] text-white/90 md:text-4xl">
              Saya tidak merancang ruang untuk terlihat baik.<br />Saya merancang agar ruang bekerja dengan benar.
            </p>
          </div>

          <div className="space-y-12 lg:pt-3">
            {decisions.map((decision, index) => (
              <article key={decision.title} className="group relative border-l border-white/10 pl-8 transition duration-300 hover:border-[#C8A951]/25 md:pl-10">
                <span className="absolute -left-[5px] top-1 h-2.5 w-2.5 rounded-full bg-[#C8A951]/55 opacity-70 transition duration-300 group-hover:opacity-100" />
                <p className="mb-4 font-mono text-[10px] font-black uppercase tracking-[0.26em] text-[#C8A951]/70">0{index + 1}</p>
                <h3 className="max-w-2xl text-xl font-semibold leading-8 tracking-[-0.025em] text-white/90 md:text-2xl">
                  {decision.title}
                </h3>
                <p className="mt-4 max-w-2xl text-base leading-[1.7] text-white/62 md:text-lg">
                  {decision.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="impact" className="relative overflow-hidden bg-[#142030] px-5 py-16 text-white md:px-10 md:py-24 lg:px-16 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(200,169,81,0.055),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.018),transparent_44%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="text-center">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#C8A951] md:text-[11px]">Impact</p>
            <h2 className="font-display mt-5 text-5xl font-normal leading-[1.08] tracking-[-0.038em] text-[#F4F1EA] md:text-7xl">
              Dampak yang Terukur
            </h2>
          </div>

          <div className="mt-20 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {impacts.map((impact, index) => (
              <div key={impact.label} className="group border border-white/10 bg-white/[0.025] px-6 py-10 text-center transition duration-300 hover:-translate-y-1 hover:border-[#C8A951]/25 hover:bg-white/[0.045]">
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-white/45">0{index + 1}</p>
                <div className="mt-8 flex justify-center text-[#C8A951]/70 transition duration-300 group-hover:text-[#C8A951]">
                  {impact.direction === 'up' ? <ArrowUp size={64} strokeWidth={1.45} /> : <ArrowDown size={64} strokeWidth={1.45} />}
                </div>
                <p className="mt-8 font-mono text-xs font-black uppercase tracking-[0.2em] text-white/62">
                  {impact.direction === 'up' ? '↑ ' : '↓ '}{impact.label}
                </p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-20 max-w-3xl text-center">
            <p className="text-lg italic leading-8 text-white/78 md:text-2xl">
              “Desain yang terukur menghasilkan keputusan yang lebih pasti.”
            </p>
            <p className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/32">
              * Parameter optimasi pada setiap fase kolaborasi.
            </p>
          </div>
        </div>
      </section>

      <section id="differentiation" className="relative overflow-hidden bg-[#2D2D2B] px-5 py-16 md:px-10 md:py-24 lg:px-16 lg:py-32">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#C8A951]/14" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.56em] text-[#C8A951] md:text-[11px]">Differentiation</p>
            <h2 className="font-display mt-6 text-5xl font-normal leading-[1.08] tracking-[-0.038em] text-[#F4F1EA] md:text-7xl">
              Apa yang Membedakan
            </h2>
          </div>

          <div className="mt-16 grid gap-12 lg:grid-cols-3 lg:gap-0">
            {differentiations.map((item, index) => (
              <article key={item.title} className="group lg:border-l lg:border-white/10 lg:px-12 first:lg:border-l-0 first:lg:pl-0 last:lg:pr-0">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="mt-1 shrink-0 text-[#C8A951]/78 transition duration-300 group-hover:text-[#C8A951]" size={18} strokeWidth={2.1} />
                  <div>
                    <p className="mb-4 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-white/40">0{index + 1}</p>
                    <h3 className="text-lg font-semibold uppercase leading-snug tracking-[-0.018em] text-white/90 md:text-xl">
                      {item.title}
                    </h3>
                    <p className="mt-5 max-w-sm text-base leading-[1.7] text-white/63">
                      {item.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="portfolio" className="relative overflow-hidden bg-[#142030] px-5 py-16 text-white md:px-10 md:py-24 lg:px-16 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.018),transparent_40%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.42fr] lg:items-center">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#C8A951] md:text-[11px]">Decision-Based Portfolio</p>
              <h2 className="font-display mt-6 max-w-4xl text-5xl font-normal leading-[1.08] tracking-[-0.038em] text-[#F4F1EA] md:text-7xl">
                Portfolio Berbasis Keputusan
              </h2>
              <p className="mt-8 max-w-4xl text-lg leading-[1.65] text-white/65 md:text-xl">
                Setiap proyek ditampilkan bukan hanya sebagai hasil visual, tetapi sebagai proses membaca masalah, mengambil keputusan, dan membangun dampak ruang.
              </p>
            </div>

            <a href="#contact" className="group inline-flex items-center gap-4 justify-self-start border-b border-white/20 pb-1 font-mono text-xs font-black uppercase tracking-[0.18em] text-white/78 transition duration-300 hover:border-[#C8A951]/50 hover:text-[#C8A951] lg:justify-self-end">
              Lihat Semua Karya
              <MoveRight className="text-[#C8A951] transition duration-300 group-hover:translate-x-1" size={20} />
            </a>
          </div>

          <div className="mt-20 grid gap-8 lg:grid-cols-2">
            {portfolioWorks.map((work, index) => (
              <article key={work.title} className="group relative overflow-hidden rounded-sm border border-white/15 bg-gradient-to-br from-white/[0.03] to-white/[0.01] p-8 transition duration-300 hover:-translate-y-1 hover:border-[#C8A951]/25 md:p-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(200,169,81,0.13),transparent_30%)] opacity-80" />
                <div className="relative z-10">
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.42em] text-[#C8A951] md:text-[11px]">
                    Project {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="font-display mt-5 max-w-2xl text-4xl font-normal leading-[1.02] tracking-[-0.03em] text-white/90 md:text-5xl">
                    {work.title}
                  </h3>

                  <div className="mt-12 space-y-8">
                    <div>
                      <p className="font-mono text-[10px] font-black uppercase tracking-[0.26em] text-white/48">Masalah</p>
                      <p className="mt-3 text-base leading-[1.65] text-white/68 md:text-lg">{work.problem}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] font-black uppercase tracking-[0.26em] text-white/48">Keputusan</p>
                      <p className="mt-3 text-base leading-[1.65] text-white/68 md:text-lg">{work.decision}</p>
                    </div>
                    <div>
                      <p className="font-mono text-[10px] font-black uppercase tracking-[0.26em] text-white/48">Dampak</p>
                      <p className="mt-3 text-base leading-[1.65] text-white/68 md:text-lg">{work.impact}</p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="relative overflow-hidden bg-[#050505] px-5 py-16 text-white md:px-10 md:py-24 lg:px-16 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(200,169,81,0.042),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-6xl text-center">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#C8A951] md:text-[11px]">
              Mulai Kolaborasi
            </p>
            <h2 className="font-display mt-8 text-4xl font-normal italic leading-[1.35] tracking-[-0.04em] text-[#F4F1EA] md:text-6xl lg:text-7xl">
              Jika Anda mencari designer, banyak pilihan.<br className="hidden lg:block" /> Jika Anda mencari partner berpikir, kita perlu bicara.
            </h2>
            <p className="mx-auto mt-8 max-w-3xl text-lg leading-[1.65] text-white/70 md:text-2xl">
              Saya siap membantu tim dan klien membangun ruang yang tidak hanya terlihat baik, tetapi bekerja secara strategis.
            </p>

            <a
              href="mailto:eryawanagungtrimuda@gmail.com"
              className="mt-14 inline-flex min-w-[300px] items-center justify-center rounded-[4px] bg-[#C8A951] px-10 py-5 text-sm font-semibold uppercase tracking-[0.14em] text-[#080807] shadow-[0_22px_50px_rgba(200,169,81,0.14)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#D7BD72] md:min-w-[420px]"
            >
              Mulai Diskusi Strategis
            </a>

            <p className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
              Respon langsung oleh desainer, bukan bot.
            </p>

            <div className="mt-8 flex items-center justify-center gap-8 text-white/45">
              <a
                href="https://instagram.com/"
                target="_blank"
                rel="noreferrer"
                className="transition duration-300 hover:-translate-y-0.5 hover:text-[#C8A951]"
                aria-label="Instagram"
              >
                <Instagram size={20} strokeWidth={1.8} />
              </a>
              <a
                href="mailto:eryawanagungtrimuda@gmail.com"
                className="transition duration-300 hover:-translate-y-0.5 hover:text-[#C8A951]"
                aria-label="Email"
              >
                <Mail size={20} strokeWidth={1.8} />
              </a>
            </div>
          </div>

          <div className="mt-20 h-px w-full bg-white/8" />

          <div className="mt-14 flex flex-col gap-6 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-white/42 md:flex-row md:items-center md:justify-between md:text-[11px]">
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
