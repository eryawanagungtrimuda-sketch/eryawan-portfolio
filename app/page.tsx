export const dynamic = 'force-dynamic';

import { CheckCircle2, Compass, Instagram, Mail, MessageSquare, MoveRight, Search, Zap } from 'lucide-react';
import Button from '@/components/ui/button';
import { getPublishedInsights } from '@/lib/insights';
import { getPublishedProjects } from '@/lib/projects';
import ImpactMetricsCarousel from '@/components/impact-metrics-carousel';
import MobileSwipeRow from '@/components/mobile-swipe-row';
import RevealObserver from '@/components/reveal-observer';

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
    title: 'Sirkulasi yang jelas mengurangi friksi aktivitas.',
    description: 'Alur yang rapi membuat pergerakan lebih natural dan efisien.',
  },
  {
    title: 'Pencahayaan yang tepat membentuk atmosfer dan fokus.',
    description: 'Cahaya mengarahkan mood, ritme aktivitas, dan kenyamanan.',
  },
  {
    title: 'Material yang dipilih sadar menjaga nilai ruang.',
    description: 'Pilihan material menentukan daya tahan, biaya, dan perawatan.',
  },
  {
    title: 'Layout yang logis mempercepat pengambilan keputusan.',
    description: 'Prioritas ruang yang jelas membuat evaluasi lebih objektif.',
  },
];

const impacts = [
  {
    title: 'Efisiensi Meningkat',
    description: 'Alur ruang lebih jelas, aktivitas bergerak lebih natural.',
    direction: 'up',
  },
  {
    title: 'Keputusan Lebih Cepat',
    description: 'Prioritas desain lebih mudah dibaca dan disepakati.',
    direction: 'up',
  },
  {
    title: 'Revisi Berkurang',
    description: 'Masalah utama dibaca sejak awal, bukan setelah visual selesai.',
    direction: 'down',
  },
  {
    title: 'Ruang Lebih Terarah',
    description: 'Fungsi, mood, dan pengalaman ruang bekerja sebagai satu sistem.',
    direction: 'up',
  },
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


const wawasanPreview = [
  {
    title: 'Membaca Tren Interior dari Pinterest',
    excerpt: 'Mengamati pola visual dari Pinterest untuk memetakan arah gaya yang relevan tanpa kehilangan logika fungsi ruang.',
    tag: 'Trend Analysis',
  },
  {
    title: 'Kenapa Desain Unik Tidak Selalu Efektif',
    excerpt: 'Membahas batas antara keunikan visual dan efektivitas ruang agar keputusan desain tetap masuk akal untuk pengguna.',
    tag: 'Design Strategy',
  },
  {
    title: 'Review Ruang Komersial yang Menarik Perhatian',
    excerpt: 'Menganalisis elemen ruang komersial yang kuat secara first impression sekaligus efisien untuk aktivitas harian.',
    tag: 'Commercial Review',
  },
];


export default async function Home() {
  const portfolioWorks = (await getPublishedProjects()).slice(0, 2);
  const publishedInsights = await getPublishedInsights();
  const wawasanCards =
    publishedInsights.length > 0
      ? publishedInsights.slice(0, 3).map((insight) => ({
          title: insight.title,
          excerpt:
            insight.excerpt ||
            'Wawasan ini mengulas strategi desain dan pertimbangan ruang dari sudut pandang editorial.',
          tag: insight.category || 'Wawasan',
          href: `/wawasan/${insight.slug}`,
        }))
      : wawasanPreview.map((article) => ({
          title: article.title,
          excerpt: article.excerpt,
          tag: article.tag,
          href: '/wawasan',
        }));
  return (
    <main className="min-h-screen overflow-x-clip overflow-y-visible bg-[#080807] font-sans text-[#F4F1EA]">
      <RevealObserver />
      <section
        id="home"
        className="relative flex min-h-screen flex-col overflow-hidden bg-cover bg-center px-4 py-6 sm:px-5 md:px-8 lg:px-12 xl:px-24"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(8,8,7,0.92) 0%, rgba(8,8,7,0.78) 34%, rgba(8,8,7,0.46) 66%, rgba(8,8,7,0.18) 100%), linear-gradient(180deg, rgba(8,8,7,0.38) 0%, rgba(8,8,7,0.08) 45%, rgba(8,8,7,0.78) 100%), url('/hero.jpg')",
        }}
      >
        <nav className="relative z-10 flex items-start justify-between gap-8">
          <a href="/" className="group inline-flex flex-col gap-2 md:gap-2.5">
            <span className="font-display text-[1.35rem] font-normal uppercase leading-none tracking-[0.08em] text-[#C8A951] transition duration-300 group-hover:text-[#D7BD72] sm:text-[1.45rem] md:text-[1.55rem] lg:text-[1.68rem]">
              Eryawan Agung
            </span>
            <span className="font-display text-[0.62rem] font-normal uppercase leading-none tracking-[0.2em] text-white/62 sm:text-[0.68rem] md:text-[0.72rem] lg:text-[0.78rem]">
              Portfolio · Design Strategy
            </span>
          </a>

          <div className="hidden items-start gap-8 font-sans text-sm font-medium text-white/62 lg:flex">
            <a className="border-b border-[#C8A951]/70 pb-3 text-[#C8A951] transition duration-300" href="/">Beranda</a>
            <a className="pb-3 transition motion-safe:duration-500 motion-safe:ease-out hover:text-[#C8A951]" href="/tentang">Tentang</a>
            <a className="pb-3 transition motion-safe:duration-500 motion-safe:ease-out hover:text-[#C8A951]" href="/karya">Karya</a>
            <a className="pb-3 transition motion-safe:duration-500 motion-safe:ease-out hover:text-[#C8A951]" href="/wawasan">Wawasan</a>
            <a className="pb-3 transition motion-safe:duration-500 motion-safe:ease-out hover:text-[#C8A951]" href="#contact">Kontak</a>
          </div>

          <Button href="/mulai-project" className="hidden shadow-[0_18px_44px_rgba(200,169,81,0.14)] md:inline-flex">
            Ajak Kolaborasi
          </Button>
        </nav>


        <div className="relative z-10 mt-6 flex gap-2 overflow-x-auto pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/62 lg:hidden">
          <a href="/" className="whitespace-nowrap rounded-2xl border border-[#C8A951]/40 bg-[#C8A951]/10 px-3 py-2 text-[#C8A951]">Beranda</a>
          <a href="/tentang" className="whitespace-nowrap rounded-2xl border border-white/15 bg-white/[0.04] px-3 py-2 transition hover:border-[#C8A951]/40 hover:text-[#C8A951]">Tentang</a>
          <a href="/karya" className="whitespace-nowrap rounded-2xl border border-white/15 bg-white/[0.04] px-3 py-2 transition hover:border-[#C8A951]/40 hover:text-[#C8A951]">Karya</a>
          <a href="/wawasan" className="whitespace-nowrap rounded-2xl border border-white/15 bg-white/[0.04] px-3 py-2 transition hover:border-[#C8A951]/40 hover:text-[#C8A951]">Wawasan</a>
          <a href="#contact" className="whitespace-nowrap rounded-2xl border border-white/15 bg-white/[0.04] px-3 py-2 transition hover:border-[#C8A951]/40 hover:text-[#C8A951]">Kontak</a>
        </div>

        <div className="relative z-10 grid flex-1 items-center pt-16 lg:grid-cols-[1fr_0.5fr] lg:pt-4">
          <div className="max-w-6xl lg:pl-8 xl:pl-14">
            <p className="mb-7 font-mono text-[10px] font-black uppercase tracking-[0.56em] text-[#C8A951] md:text-[11px]">
              Strategic Design Intelligence
            </p>

            <h1 className="font-display max-w-6xl text-[2rem] font-normal uppercase leading-[1.08] tracking-[-0.04em] text-[#F4F1EA] drop-shadow-[0_16px_34px_rgba(0,0,0,0.42)] sm:text-[2.4rem] md:text-[clamp(3rem,5.7vw,6.45rem)]">
              Desain Bukan Sekadar Visual.<br />
              <span className="block text-[#C8A951] italic tracking-[-0.055em]">Ini Adalah Keputusan Bisnis.</span>
            </h1>

            <p className="mt-8 max-w-3xl font-sans text-lg leading-[1.65] text-white/62 drop-shadow-md md:text-[1.25rem]">
              Saya membantu klien dan tim merancang ruang yang tidak hanya indah, tetapi efisien, terukur, dan berdampak jangka panjang.
            </p>

            <div className="mt-12 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Button href="/mulai-project" className="w-full sm:w-auto motion-safe:transition motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu">
                Diskusikan Proyek Secara Strategis
              </Button>
              <Button href="#framework" variant="secondary" className="w-full sm:w-auto motion-safe:transition motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu">
                Lihat Cara Saya Berpikir
              </Button>
              <Button href="/tentang" variant="secondary" className="w-full sm:w-auto motion-safe:transition motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu">
                Tentang Saya
              </Button>
            </div>
          </div>
        </div>

        <div className="relative z-10 hidden items-center justify-between pb-2 md:flex">
          <div className="flex items-center gap-5 text-white/62">
            <span className="h-10 w-px bg-white/25" />
            <span className="text-sm font-medium">Scroll untuk eksplorasi</span>
          </div>
          <Button href="#contact" className="h-14 w-14 px-0 py-0 shadow-[0_16px_36px_rgba(200,169,81,0.14)]" ariaLabel="Hubungi studio">
            <MessageSquare size={20} strokeWidth={2} />
          </Button>
        </div>
      </section>

      <section id="client-workflow" className="reveal-on-scroll relative overflow-hidden bg-[#090909] px-5 py-16 text-white md:px-10 md:py-24 lg:px-16 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(200,169,81,0.055),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.014),transparent_42%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#C8A951] md:text-[11px]">Client Collaboration</p>
              <h2 className="font-display mt-5 max-w-3xl text-5xl font-normal leading-[1.08] tracking-[-0.038em] text-[#F4F1EA] md:text-7xl">
                Cara Saya Bekerja dengan Klien
              </h2>
            </div>
            <p className="max-w-3xl font-sans text-lg leading-[1.7] text-white/62 md:text-xl">
              Saya tidak hanya menerjemahkan brief menjadi gambar. Saya membantu membaca konteks, mempertanyakan keputusan yang kurang efisien, dan menyusun solusi ruang yang masuk akal secara fungsi, estetika, dan dampak bisnis.
            </p>
          </div>

          <MobileSwipeRow className="mt-16" ariaLabel="Client collaboration cards" desktopGridClassName="lg:grid-cols-3 lg:gap-6" backgroundTone="#090909">
            {clientWorkflow.map((item) => (
              <article key={item.title} className="group rounded-[28px] border border-white/5 bg-white/[0.02] p-8 transition duration-300 motion-safe:ease-out motion-safe:active:scale-[0.985] motion-safe:hover:-translate-y-1 motion-safe:hover:transform-gpu hover:border-[#C8A951]/25 hover:bg-white/[0.04] hover:shadow-[0_18px_38px_rgba(0,0,0,0.24)] md:p-10">
                <div className="mb-14 flex items-center justify-between">
                  <span className="font-mono text-xs font-black uppercase tracking-[0.28em] text-white/48">{item.number}</span>
                  <CheckCircle2 className="text-[#C8A951]/70 transition duration-300 group-hover:text-[#C8A951]" size={22} strokeWidth={1.9} />
                </div>
                <h3 className="font-display text-3xl font-normal leading-[1.08] tracking-[-0.028em] text-white/90 md:text-4xl">
                  {item.title}
                </h3>
                <p className="mt-6 font-sans text-base leading-[1.7] text-white/66">
                  {item.description}
                </p>
              </article>
            ))}
          </MobileSwipeRow>
        </div>
      </section>

      <section id="framework" className="reveal-on-scroll relative overflow-hidden bg-[#2D2D2B] px-5 py-16 md:px-10 md:py-24 lg:px-16 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(200,169,81,0.08),transparent_27%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_58%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#C8A951] md:text-[11px]">Framework</p>
              <h2 className="font-display mt-5 max-w-2xl text-5xl font-normal leading-[1.08] tracking-[-0.038em] text-[#F4F1EA] md:text-7xl">
                Cara Saya Berpikir
              </h2>
            </div>
            <blockquote className="font-display max-w-4xl text-3xl italic leading-[1.16] tracking-[-0.012em] text-white/66 md:text-5xl">
              “Desain yang baik tidak berhenti pada bentuk. Ia harus menjawab alasan, fungsi, dan dampak.”
            </blockquote>
          </div>

          <MobileSwipeRow className="mt-20" ariaLabel="Framework cards" desktopGridClassName="lg:grid-cols-3 lg:gap-6" backgroundTone="#2D2D2B">
            {framework.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="group rounded-[28px] border border-white/5 bg-white/[0.02] p-8 transition duration-300 motion-safe:ease-out motion-safe:active:scale-[0.985] motion-safe:hover:-translate-y-1 motion-safe:hover:transform-gpu hover:border-[#C8A951]/25 hover:bg-white/[0.04] hover:shadow-[0_18px_38px_rgba(0,0,0,0.24)] md:p-10">
                  <div className="mb-16 flex items-center justify-between">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-xs font-black uppercase tracking-[0.28em] text-white/50">{item.number}</span>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-[#C8A951]/70">{item.code}</span>
                    </div>
                    <span className="grid h-12 w-12 place-items-center rounded-2xl border border-[#C8A951]/24 text-[#C8A951]/80 transition duration-300 group-hover:border-[#C8A951]/45 group-hover:bg-[#C8A951]/10 group-hover:text-[#C8A951]">
                      <Icon size={21} strokeWidth={1.8} />
                    </span>
                  </div>
                  <h3 className="font-display text-3xl font-normal uppercase leading-none tracking-[-0.02em] text-white/90 md:text-4xl">
                    {item.title}
                  </h3>
                  <p className="mt-6 max-w-sm font-sans text-base leading-[1.7] text-white/66">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </MobileSwipeRow>
        </div>
      </section>

      <section id="design-decisions" className="reveal-on-scroll relative overflow-hidden bg-[#070707] px-5 py-16 text-white md:px-10 md:py-24 lg:px-16 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(200,169,81,0.07),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.014),transparent_42%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
          <div className="min-w-0 max-w-full lg:sticky lg:top-28 lg:self-start">
            <p className="max-w-full break-words font-mono text-[10px] font-black uppercase tracking-[0.42em] text-[#D4AF37] md:text-[11px] md:tracking-[0.52em]">Design Decisions</p>
            <h2 className="font-display mt-5 max-w-full break-words text-[2rem] font-normal leading-[1.12] tracking-[-0.03em] text-[#F4F1EA] sm:text-[2.35rem] md:mt-6 md:text-[3.5rem] lg:text-[4.1rem]">
              Setiap Ruang Adalah Keputusan
            </h2>
            <p className="mt-5 max-w-full break-words text-pretty font-sans text-sm leading-[1.8] text-white/64 sm:text-base md:mt-6 md:max-w-xl md:text-[1.04rem]">
              Saya mengontrol kualitas keputusan desain sejak awal: mana yang perlu diprioritaskan, mana yang bisa disederhanakan, dan mana yang akan berdampak paling besar pada ruang.
            </p>
            <div className="mt-7 h-px w-24 bg-gradient-to-r from-[#C8A951]/70 to-transparent md:mt-8" />
            <p className="font-display mt-6 max-w-xl text-[1.25rem] italic leading-[1.45] tracking-[-0.01em] text-white/86 sm:text-[1.45rem] md:mt-8 md:text-[2rem]">
              “Ruang yang baik bukan yang paling ramai. Ruang yang baik adalah yang bekerja dengan tenang.”
            </p>
          </div>

          <MobileSwipeRow
            className="relative mt-8 lg:mt-0 lg:pt-3"
            ariaLabel="Kartu keputusan dapat digeser horizontal"
            desktopGridClassName="lg:grid-cols-1 lg:gap-5"
            backgroundTone="#070707"
          >
            {decisions.map((decision, index) => (
              <article
                key={decision.title}
                className="group relative overflow-hidden rounded-[24px] border border-white/5 bg-white/[0.018] p-5 transition duration-300 hover:border-[#C8A951]/24 hover:bg-white/[0.03] md:p-7 lg:pl-14"
              >
                <span className="pointer-events-none absolute bottom-0 left-4 top-0 hidden w-px bg-white/10 lg:block" />
                <span className="absolute left-[11px] top-6 hidden h-3 w-3 rounded-full border border-[#D4AF37]/45 bg-[#C8A951]/30 transition duration-300 group-hover:border-[#D4AF37]/65 group-hover:bg-[#C8A951]/50 lg:block" />
                <div className="flex items-center justify-between gap-4">
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.26em] text-[#C8A951]">0{index + 1}</p>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-white/42">Decision Point</p>
                </div>
                <h3 className="mt-4 max-w-2xl font-sans text-[1rem] font-semibold leading-7 tracking-[-0.018em] text-white/88 md:text-[1.35rem] md:leading-[1.45]">
                  {decision.title}
                </h3>
                <p className="mt-3 max-w-2xl font-sans text-sm leading-6 text-white/60 md:text-base md:leading-[1.72]">
                  {decision.description}
                </p>
              </article>
            ))}
          </MobileSwipeRow>
        </div>
      </section>

      <section id="impact" className="reveal-on-scroll relative overflow-hidden bg-[#142030] px-5 py-16 text-white md:px-10 md:py-24 lg:px-16 lg:py-32">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_10%,rgba(200,169,81,0.1),transparent_34%),radial-gradient(circle_at_82%_82%,rgba(200,169,81,0.08),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_52%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-14">
            <div className="max-w-3xl motion-safe:animate-[fade-up_700ms_ease-out]">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#C8A951] md:text-[11px]">Impact</p>
              <h2 className="font-display mt-5 text-5xl font-normal leading-[1.08] tracking-[-0.038em] text-[#F4F1EA] md:text-7xl">
                Dampak yang Terukur
              </h2>
              <p className="mt-6 max-w-xl font-sans text-base leading-[1.7] text-white/62 md:text-lg">
                Outcome desain dirangkum sebagai metrik ruang yang lebih efisien, mudah dipahami, dan konsisten saat dieksekusi lintas keputusan.
              </p>
            </div>

            <ImpactMetricsCarousel impacts={impacts} />
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

          <MobileSwipeRow
            className="mt-16"
            ariaLabel="Kartu diferensiasi dapat digeser horizontal"
            desktopGridClassName="lg:grid-cols-3 lg:gap-0"
            backgroundTone="#2D2D2B"
          >
            {differentiations.map((item, index) => (
              <article key={item.title} className="group lg:border-l lg:border-white/10 lg:px-12 first:lg:border-l-0 first:lg:pl-0 last:lg:pr-0">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="mt-1 shrink-0 text-[#C8A951]/78 transition duration-300 group-hover:text-[#C8A951]" size={18} strokeWidth={2.1} />
                  <div>
                    <p className="mb-4 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-white/40">0{index + 1}</p>
                    <h3 className="text-lg font-semibold uppercase leading-snug tracking-[-0.018em] text-white/90 md:text-xl">
                      {item.title}
                    </h3>
                    <p className="mt-5 max-w-sm font-sans text-base leading-[1.7] text-white/66">
                      {item.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </MobileSwipeRow>
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
              <p className="mt-8 max-w-4xl font-sans text-lg leading-[1.65] text-white/62 md:text-xl">
                Setiap proyek ditampilkan bukan hanya sebagai hasil visual, tetapi sebagai proses membaca masalah, mengambil keputusan, dan membangun dampak ruang.
              </p>
            </div>

            <a href="/karya" className="group inline-flex items-center gap-4 justify-self-start border-b border-white/20 pb-1 font-mono text-xs font-black uppercase tracking-[0.18em] text-white/66 transition duration-300 hover:border-[#C8A951]/50 hover:text-[#C8A951] lg:justify-self-end">
              Lihat Semua Karya
              <MoveRight className="text-[#C8A951] transition duration-300 group-hover:translate-x-1" size={20} />
            </a>
          </div>

          <div className="mt-20 grid gap-8 lg:grid-cols-2">
            {portfolioWorks.map((project, index) => {
              const meta = project.category || project.design_category;
              const teaser = project.problem || project.solution || project.impact;
              const detailHref = project.slug ? `/karya/${project.slug}` : '/karya';

              return (
                <article key={project.id} className="group relative overflow-hidden rounded-[30px] border border-white/5 bg-gradient-to-br from-white/[0.03] to-white/[0.01] transition duration-300 hover:-translate-y-1 hover:border-[#C8A951]/22 hover:shadow-[0_26px_58px_rgba(0,0,0,0.35)]">
                  <div className="relative aspect-[16/9] overflow-hidden border-b border-white/5 bg-[#0f1925]">
                    {project.cover_image ? (
                      <>
                        <img src={project.cover_image} alt={project.title} className="h-full w-full object-cover" loading="lazy" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-end bg-[linear-gradient(150deg,#1a2a3d_0%,#132130_55%,#0d161f_100%)] p-5">
                        <div className="rounded-2xl border border-white/10 bg-black/35 px-3 py-1 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white/64">
                          Visual proyek belum tersedia
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3">
                      <p className="font-mono text-[10px] font-black uppercase tracking-[0.36em] text-[#C8A951]">Project {String(index + 1).padStart(2, '0')}</p>
                      {meta ? <span className="rounded-full border border-white/10 bg-black/30 px-3 py-1 font-mono text-[10px] font-black uppercase tracking-[0.14em] text-white/64">{meta}</span> : null}
                    </div>
                  </div>
                  <div className="p-7 md:p-8">
                    <h3 className="font-display max-w-2xl text-4xl font-normal leading-[1.02] tracking-[-0.03em] text-white/92 md:text-5xl">{project.title}</h3>
                    {teaser ? <p className="mt-5 text-base leading-[1.75] text-white/62 md:text-lg">{teaser}</p> : null}
                    <a href={detailHref} className="mt-7 inline-flex items-center gap-3 font-mono text-[11px] font-black uppercase tracking-[0.2em] text-[#C8A951] transition duration-300 hover:text-[#D7BD72]">Eksplor Studi Kasus <MoveRight className="transition duration-300 group-hover:translate-x-1" size={16} /></a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>


      <section id="wawasan-design" className="relative overflow-hidden bg-[#0B0B0A] px-5 py-16 text-white md:px-10 md:py-24 lg:px-16">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(200,169,81,0.07),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.015),transparent_42%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 md:max-w-3xl">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#C8A951] md:text-[11px]">Wawasan</p>
            <h2 className="font-display text-5xl font-normal leading-[1.08] tracking-[-0.038em] text-[#F4F1EA] md:text-7xl">
              Wawasan Desain
            </h2>
            <p className="font-sans text-lg leading-[1.7] text-white/62 md:text-xl">
              Cara saya membaca ruang, tren, dan keputusan desain secara strategis.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {wawasanCards.map((article) => (
              <article key={article.title} className="group rounded-[24px] border border-white/5 bg-white/[0.02] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[#C8A951]/24 hover:bg-white/[0.045]">
                <p className="inline-flex rounded-full border border-[#C8A951]/30 bg-[#C8A951]/10 px-2.5 py-1 font-mono text-[10px] font-black uppercase tracking-[0.18em] text-[#D2B364]">{article.tag}</p>
                <h3 className="mt-4 font-sans text-lg font-semibold leading-snug tracking-[-0.02em] text-white/92">
                  {article.title}
                </h3>
                <p className="mt-3 font-sans text-sm leading-[1.75] text-white/66">{article.excerpt}</p>
                <a
                  href={article.href}
                  className="mt-5 inline-flex items-center gap-2.5 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-[#C8A951] transition duration-300 hover:text-[#D7BD72]"
                >
                  Baca Wawasan
                  <MoveRight className="transition duration-300 group-hover:translate-x-1" size={14} />
                </a>
              </article>
            ))}
          </div>

          <a
            href="/wawasan"
            className="group mt-10 inline-flex items-center gap-3 border-b border-white/20 pb-1 font-mono text-xs font-black uppercase tracking-[0.18em] text-white/66 transition duration-300 hover:border-[#C8A951]/55 hover:text-[#C8A951]"
          >
            Lihat Semua Wawasan
            <MoveRight className="text-[#C8A951] transition duration-300 group-hover:translate-x-1" size={18} />
          </a>
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
            <p className="mx-auto mt-8 max-w-3xl font-sans text-lg leading-[1.65] text-white/62 md:text-2xl">
              Saya siap membantu tim dan klien membangun ruang yang tidak hanya terlihat baik, tetapi bekerja secara strategis.
            </p>

            <Button href="mailto:eryawanagungtrimuda@gmail.com" className="mt-14 min-w-[300px] px-10 py-5 tracking-[0.14em] shadow-[0_22px_50px_rgba(200,169,81,0.14)] md:min-w-[420px]">
              Mulai Diskusi Strategis
            </Button>

            <p className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.18em] text-white/32">
              Respon langsung oleh desainer, bukan bot.
            </p>

            <div className="mt-8 flex items-center justify-center gap-8 text-white/50">
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
            <p>© 2026 Eryawan Agung — Strategic Design & Spatial Logic</p>
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
