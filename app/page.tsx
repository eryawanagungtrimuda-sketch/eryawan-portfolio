import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { CheckCircle2, Compass, Instagram, Mail, MoveRight, Search, Zap } from 'lucide-react';
import Button from '@/components/ui/button';
import { getPublishedInsights } from '@/lib/insights';
import { getPublishedProjects } from '@/lib/projects';
import ImpactMetricsCarousel from '@/components/impact-metrics-carousel';
import MobileSwipeRow from '@/components/mobile-swipe-row';
import RevealObserver from '@/components/reveal-observer';
import MobileAdminQuickAccess from '@/components/mobile-admin-quick-access';
import AdminFooterShortcut from '@/components/admin-footer-shortcut';
import { absoluteUrl } from '@/lib/site-url';
import TrackedLink from '@/components/tracked-link';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Eryawan Agung | Design Strategy Portfolio',
  description: 'Portfolio Eryawan Agung yang menampilkan strategi desain, studi kasus karya, dan wawasan ruang yang terarah.',
  alternates: { canonical: absoluteUrl('/') },
  openGraph: {
    title: 'Eryawan Agung | Design Strategy Portfolio',
    description: 'Portfolio Eryawan Agung yang menampilkan strategi desain, studi kasus karya, dan wawasan ruang yang terarah.',
    url: absoluteUrl('/'),
    type: 'website',
    images: [{ url: absoluteUrl('/opengraph-image'), width: 1200, height: 630, alt: 'Eryawan Agung Design Strategy Portfolio' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Eryawan Agung | Design Strategy Portfolio',
    description: 'Portfolio Eryawan Agung yang menampilkan strategi desain, studi kasus karya, dan wawasan ruang yang terarah.',
    images: [absoluteUrl('/opengraph-image')],
  },
};

const clientWorkflow = [
  {
    title: 'Visi Anda adalah Titik Awal Saya',
    description:
      'Setiap proyek dimulai dari cerita Anda: impian, kebiasaan, dan ruang ideal yang Anda bayangkan. Visi Anda bukan sekadar masukan, melainkan fondasi dari seluruh proses desain.',
    number: '01',
  },
  {
    title: 'Keahlian Saya untuk Memperkuat Ide Anda',
    description:
      'Saya hadir bukan untuk mengubah keinginan Anda, melainkan untuk menyempurnakannya dengan solusi yang estetis dan fungsional. Setiap keputusan desain akan saya jelaskan secara jelas dan transparan.',
    number: '02',
  },
  {
    title: 'Proses yang Terbuka dan Menyenangkan',
    description:
      'Anda akan selalu dilibatkan di setiap tahap, dari konsep hingga hasil akhir. Kepuasan Anda menjadi tolok ukur keberhasilan proses ini.',
    number: '03',
  },
];

const framework = [
  {
    title: 'Pahami',
    description:
      `Desain terbaik lahir dari mendengarkan
Saya mendesain untuk cara hidup Anda yang sesungguhnya. Setiap keputusan punya alasan yang jelas, berakar dari kebutuhan, kebiasaan, dan nilai-nilai yang Anda jaga.`,
    icon: Search,
    number: '01',
    code: 'Context Reading',
  },
  {
    title: 'Bentuk',
    description:
      'Garis, proporsi, dan komposisi menciptakan nada emosional sebuah ruang sebelum segala isinya. Saya memilih bentuk dengan sengaja, karena kesan pertama yang kuat adalah fondasi dari desain yang tak terlupakan.',
    icon: Compass,
    number: '02',
    code: 'Spatial Logic',
  },
  {
    title: 'Putuskan',
    description:
      `Ruang yang benar mengubah cara Anda merasakannya.
Fungsi maksimal bukan soal kekuatannya tapi soal kemudahan yang terasa alami setiap hari. Desain yang berhasil bukan yang Anda kagumi sekali, tapi yang terus membuat Anda merasa lebih baik setiap berada di sana.`,
    icon: Zap,
    number: '03',
    code: 'Strategic Decision',
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
    title: 'Bukan sekadar visual yang menarik.',
    description: 'Setiap proyek berbasis analisis mendalam dan struktur keputusan yang terarah.',
  },
  {
    title: 'Bukan sekadar mengikuti tren.',
    description: 'Pendekatan saya berbasis konteks tapak dan tujuan fungsional jangka panjang.',
  },
  {
    title: 'Bukan sekadar ruang.',
    description: 'Saya merancang sistem yang mendukung performa dan kesejahteraan pengguna di dalamnya.',
  },
];


const wawasanPreview = [
  {
    title: 'Membaca Tren Interior tanpa Kehilangan Arah Bisnis',
    excerpt: 'Mengamati pola visual dari Pinterest untuk memetakan arah gaya yang relevan tanpa kehilangan logika fungsi ruang.',
    tag: 'Trend Analysis',
  },
  {
    title: 'Mengapa Desain Unik Belum Tentu Efektif',
    excerpt: 'Membahas batas antara keunikan visual dan efektivitas ruang agar keputusan desain tetap masuk akal untuk pengguna.',
    tag: 'Design Strategy',
  },
  {
    title: 'Membedah Ruang Komersial yang Menarik dan Produktif',
    excerpt: 'Menganalisis elemen ruang komersial yang kuat secara first impression sekaligus efisien untuk aktivitas harian.',
    tag: 'Commercial Review',
  },
];


function SpreadTextLine({
  text,
  className,
}: {
  text: string;
  className: string;
}) {
  return (
    <p aria-label={text} className={`flex w-full items-center justify-between whitespace-nowrap ${className}`}>
      {Array.from(text).map((char, index) => (
        <span key={`${char}-${index}`} aria-hidden="true">
          {char === ' ' ? ' ' : char}
        </span>
      ))}
    </p>
  );
}

function BrandWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="inline-flex w-[10.8rem] flex-col items-start md:w-[11.8rem]">
      <SpreadTextLine
        text="ERYAWAN AGUNG"
        className={compact ? 'font-display text-[0.98rem] uppercase text-[#C8A951]' : 'font-display text-[1.07rem] uppercase text-[#C8A951]'}
      />
      <SpreadTextLine
        text="PORTFOLIO · DESIGN STRATEGY"
        className={compact ? 'mt-0.5 font-sans text-[0.56rem] font-semibold uppercase text-white/70' : 'mt-0.5 font-sans text-[0.58rem] font-semibold uppercase text-white/68'}
      />
    </div>
  );
}


export default async function Home() {
  const portfolioWorks = (await getPublishedProjects()).slice(0, 2);
  const publishedInsights = await getPublishedInsights();
  const wawasanCards =
    publishedInsights.length > 0
      ? publishedInsights.slice(0, 3).map((insight) => ({
          title: insight.title,
          excerpt:
            insight.excerpt ||
            'Wawasan ini mengulas strategi desain dan pertimbangan ruang dari sudut pandang praktis.',
          tag: insight.category || 'Wawasan',
          href: `/wawasan/${insight.slug}`,
        }))
      : wawasanPreview.map((article) => ({
          title: article.title,
          excerpt: article.excerpt,
          tag: article.tag,
          href: '/wawasan',
        }));
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Eryawan Agung',
    url: absoluteUrl('/'),
    image: absoluteUrl('/hero.jpg'),
    jobTitle: 'Design Strategist',
    description: 'Design strategist yang berfokus pada spatial logic, keputusan desain, dan dampak ruang.',
    sameAs: ['https://www.instagram.com/eryawanagung'],
  };
  return (
    <main id="main-content" className="min-h-screen overflow-x-clip overflow-y-visible bg-[#080807] font-sans text-[#F4F1EA]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      <RevealObserver />
      <MobileAdminQuickAccess />
      <section
        id="home"
        className="relative flex min-h-[100svh] flex-col overflow-hidden bg-cover bg-center px-4 py-4 pt-5 sm:px-5 sm:pt-6 md:min-h-screen md:px-8 md:py-5 md:pt-8 lg:px-12 xl:px-24"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(8,8,7,0.92) 0%, rgba(8,8,7,0.78) 34%, rgba(8,8,7,0.46) 66%, rgba(8,8,7,0.18) 100%), linear-gradient(180deg, rgba(8,8,7,0.38) 0%, rgba(8,8,7,0.08) 45%, rgba(8,8,7,0.78) 100%), url('/hero.jpg')",
        }}
      >

        <header className="relative z-20 mb-3 hidden md:block lg:mb-4">
          <div className="px-1 py-2">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
              <div className="justify-self-start">
                <BrandWordmark />
              </div>
              <nav aria-label="Navigasi hero desktop" className="justify-self-center">
                <ul className="flex items-center gap-2">
                  {[
                    { href: '/', label: 'Beranda' },
                    { href: '/tentang', label: 'Tentang' },
                    { href: '/karya', label: 'Karya' },
                    { href: '/wawasan', label: 'Wawasan' },
                    { href: '/kontak', label: 'Kontak' },
                  ].map((item) => (
                    <li key={item.href}>
                      <a
                        href={item.href}
                        className="inline-flex min-h-9 items-center rounded-full border border-transparent px-3.5 py-1.5 font-sans text-[0.7rem] font-semibold uppercase tracking-[0.11em] text-white/78 transition hover:border-[#C8A951]/28 hover:bg-[#C8A951]/10 hover:text-[#F4F1EA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807]"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="justify-self-end">
                <TrackedLink href="/mulai-project" eventName="cta_click" eventProps={{ source: 'homepage_header', label: 'ajukan_kolaborasi', href_type: 'internal' }} data-cta="homepage-header-collaboration" className="inline-flex min-h-9 items-center justify-center rounded-full border border-[#C8A951]/70 bg-[#C8A951] px-5 py-2 font-sans text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-[#080807] transition hover:bg-[#D7BD72] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807]">Ajukan Kolaborasi</TrackedLink>
              </div>
            </div>
          </div>
        </header>

        <div className="relative z-20 mb-3 block md:hidden">
          <div className="rounded-xl bg-[#080807]/28 px-1 py-1 backdrop-blur-[2px]">
            <BrandWordmark compact />
            <nav aria-label="Navigasi hero mobile" className="mt-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <ul className="flex min-w-max items-center gap-1.5 pr-4">
                {[
                  { href: '/', label: 'Beranda' },
                  { href: '/tentang', label: 'Tentang' },
                  { href: '/karya', label: 'Karya' },
                  { href: '/wawasan', label: 'Wawasan' },
                  { href: '/kontak', label: 'Kontak' },
                ].map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="inline-flex min-h-8 shrink-0 items-center rounded-full border border-[#C8A951]/30 bg-[#C8A951]/8 px-3 py-1.5 font-sans text-[0.66rem] font-semibold uppercase tracking-[0.08em] text-[#F4F1EA] transition hover:bg-[#C8A951]/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807] sm:min-h-9 sm:px-3.5 sm:text-[0.69rem] sm:tracking-[0.09em]"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="relative z-10 grid flex-1 items-center pt-1 lg:grid-cols-[1fr_0.5fr] lg:pt-2">
          <div className="max-w-6xl lg:pl-8 xl:pl-14">
            <p className="mb-5 font-mono text-[9px] font-black uppercase tracking-[0.42em] text-[#C8A951] sm:text-[10px] sm:tracking-[0.5em] md:mb-7 md:text-[11px] md:tracking-[0.56em]">
              Strategic Design Intelligence
            </p>

            <h1 className="font-display max-w-6xl text-balance text-[1.74rem] font-normal uppercase leading-[1.08] tracking-[-0.035em] text-[#F4F1EA] drop-shadow-[0_16px_34px_rgba(0,0,0,0.42)] min-[375px]:text-[1.85rem] min-[390px]:text-[1.95rem] sm:text-[2.25rem] sm:leading-[1.06] sm:tracking-[-0.04em] md:text-[clamp(2.9rem,5.4vw,6.1rem)]">
              TATA RUANG YANG TEPAT
              <br />
              <span className="relative inline-block text-[#C8A951] tracking-[-0.05em]">
                BISNIS TERGERAK LEBIH CEPAT
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-1 left-0 h-px w-full bg-gradient-to-r from-[#C8A951]/8 via-[#C8A951]/55 to-[#C8A951]/8 sm:-bottom-1.5"
                />
              </span>
            </h1>

            <p className="mt-4 max-w-3xl pr-1 font-sans text-[0.95rem] leading-[1.62] text-white drop-shadow-md sm:mt-5 sm:text-[1.05rem] md:mt-6 md:text-[1.15rem]">
              Saya membantu klien mengambil keputusan desain yang jelas, fungsional, dan relevan terhadap cara ruang digunakan.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:gap-3 lg:mt-10 [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:max-w-[760px] [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:flex-row [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:flex-wrap [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:items-center [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:gap-[clamp(0.75rem,1.5vw,1.25rem)] [@media_(min-width:1281px)]:grid [@media_(min-width:1281px)]:grid-cols-3 [@media_(min-width:1281px)]:gap-4">
              <TrackedLink href="/mulai-project" eventName="cta_click" eventProps={{ source: "homepage_hero", label: "mulai_percakapan_proyek", href_type: "internal" }} data-cta="homepage-hero-primary" className="inline-flex min-h-10 max-w-full items-center justify-center rounded-full bg-[#C8A951] px-5 py-2.5 text-center font-mono text-[0.76rem] font-semibold uppercase tracking-[0.08em] sm:min-h-11 sm:px-7 sm:py-3 sm:text-sm sm:tracking-[0.12em] premium-interactive transition-all duration-300 ease-out hover:bg-[#D7BD72] hover:bg-white/5 active:translate-y-0 active:scale-[0.98] active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807] w-full motion-safe:transition motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:w-auto [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:flex-[0_1_20rem]">Mulai Percakapan Proyek</TrackedLink>
              <TrackedLink href="/karya" eventName="project_view_intent" eventProps={{ source: "homepage_hero", label: "lihat_karya", content_type: "karya", href_type: "internal" }} data-cta="homepage-karya" className="inline-flex min-h-10 max-w-full items-center justify-center rounded-full border border-white/10 bg-transparent px-5 py-2.5 text-center font-mono text-[0.76rem] font-semibold uppercase tracking-[0.08em] sm:min-h-11 sm:px-7 sm:py-3 sm:text-sm sm:tracking-[0.12em] premium-interactive transition-all duration-300 ease-out text-[#C8A951] hover:border-[#C8A951]/35 hover:bg-[#C8A951]/10 active:translate-y-0 active:scale-[0.98] active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807] w-full motion-safe:transition motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:w-auto [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:flex-[0_1_13.75rem]">Lihat Karya</TrackedLink>
              <Button href="/karya" variant="secondary" className="w-full min-h-10 px-5 py-2.5 text-center text-[0.76rem] tracking-[0.08em] sm:min-h-11 sm:px-7 sm:py-3 sm:text-sm sm:tracking-[0.12em] motion-safe:transition motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:w-auto [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:flex-[0_1_13.75rem]">
                Baca Studi Kasus
              </Button>
            </div>
          </div>
        </div>

        <div className="relative z-10 hidden items-center pb-2 md:flex">
          <div className="flex items-center gap-5 text-white/62">
            <span className="h-10 w-px bg-white/25" />
            <span className="text-sm font-medium">Scroll untuk eksplorasi</span>
          </div>
        </div>
      </section>

      <section id="client-workflow" className="reveal-on-scroll mobile-scroll-section mobile-section-breathing relative overflow-hidden max-md:!py-20 bg-[#090909] px-5 text-white md:px-10 md:py-24 lg:px-16 lg:py-32 [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:py-24" style={{ '--reveal-delay': '0ms' } as CSSProperties}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(200,169,81,0.055),transparent_26%),linear-gradient(180deg,rgba(255,255,255,0.014),transparent_42%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="reveal-on-scroll grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:gap-8" style={{ '--reveal-delay': '80ms' } as CSSProperties}>
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#C8A951] md:text-[11px]">Client Collaboration</p>
              <h2 className="font-display mt-5 max-w-3xl text-balance text-[2.45rem] font-normal leading-[1.1] tracking-[-0.034em] text-[#F4F1EA] sm:text-5xl md:text-7xl [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:text-[clamp(3.25rem,5vw,4.1rem)]">
                Cara Saya Bekerja dengan Klien
              </h2>
            </div>
            <p className="max-w-3xl font-sans text-base leading-[1.7] text-white/62 sm:text-lg md:text-xl">
              Saya tidak berhenti di visual. Saya memetakan konteks, menguji setiap pilihan, lalu menyusun keputusan desain yang seimbang antara fungsi, pengalaman pengguna, dan target bisnis.
            </p>
          </div>

          <div className="reveal-on-scroll" style={{ '--reveal-delay': '140ms' } as CSSProperties}>
            <MobileSwipeRow className="mt-10 sm:mt-12 [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:mt-12" ariaLabel="Client collaboration cards" desktopGridClassName="lg:grid-cols-3 lg:gap-6" backgroundTone="#090909">
            {clientWorkflow.map((item) => (
              <article key={item.title} className="group flex h-full min-h-full flex-col rounded-[24px] border border-white/5 bg-white/[0.02] p-6 transition duration-300 motion-safe:ease-out md:rounded-[28px] motion-safe:active:scale-[0.985] motion-safe:hover:-translate-y-1 motion-safe:hover:transform-gpu hover:border-[#C8A951]/25 hover:bg-white/[0.04] hover:shadow-[0_18px_38px_rgba(0,0,0,0.24)] md:p-10 [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:p-8">
                <div className="mb-10 flex shrink-0 items-center justify-between [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:mb-10">
                  <span className="font-mono text-xs font-black uppercase tracking-[0.28em] text-white/48">{item.number}</span>
                  <CheckCircle2 className="text-[#C8A951]/70 transition duration-300 group-hover:text-[#C8A951]" size={22} strokeWidth={1.9} />
                </div>
                <h3 className="shrink-0 font-display text-[1.7rem] font-normal leading-[1.1] tracking-[-0.028em] text-white/90 md:text-4xl">
                  {item.title}
                </h3>
                <p className="mt-5 flex-1 font-sans text-[0.95rem] leading-[1.68] text-white/66">
                  {item.description}
                </p>
              </article>
            ))}
            </MobileSwipeRow>
          </div>
        </div>
      </section>

      <section id="framework" className="reveal-on-scroll mobile-scroll-section mobile-section-breathing relative overflow-hidden max-md:!py-20 bg-[#2D2D2B] px-5 md:px-10 md:py-24 lg:px-16 lg:py-32 [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:py-24" style={{ '--reveal-delay': '60ms' } as CSSProperties}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(200,169,81,0.08),transparent_27%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_58%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-14 lg:grid-cols-[0.72fr_1.28fr] lg:items-end [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:gap-10">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#C8A951] md:text-[11px]">Framework</p>
              <h2 className="font-display mt-5 max-w-2xl text-balance text-[2.1rem] font-normal leading-[1.1] tracking-[-0.03em] text-[#F4F1EA] sm:text-[2.45rem] md:text-[3rem] lg:text-[3.6rem] [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:text-[clamp(3rem,4.4vw,3.45rem)]">
                Cara saya berpikir tentang desain
              </h2>
            </div>
            <p className="max-w-4xl font-sans text-base leading-[1.72] text-white/72 sm:text-[1.05rem] md:text-[1.12rem] md:leading-[1.78] lg:text-[1.2rem]">
              Desain yang baik bukan kebetulan. Ini adalah hasil dari cara berpikir yang tepat tentang alasan, fungsi, bentuk dan dampak setelahnya.
            </p>
          </div>

          <MobileSwipeRow className="mt-10 sm:mt-12 md:mt-20 [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:mt-14" ariaLabel="Framework cards" desktopGridClassName="lg:grid-cols-3 lg:gap-6" backgroundTone="#2D2D2B">
            {framework.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="group flex h-full min-h-full flex-col rounded-[24px] border border-white/5 bg-white/[0.02] p-6 transition duration-300 motion-safe:ease-out md:rounded-[28px] motion-safe:active:scale-[0.985] motion-safe:hover:-translate-y-1 motion-safe:hover:transform-gpu hover:border-[#C8A951]/25 hover:bg-white/[0.04] hover:shadow-[0_18px_38px_rgba(0,0,0,0.24)] md:p-10 [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:p-8">
                  <div className="mb-10 flex shrink-0 items-center justify-between [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:mb-10">
                    <div className="flex items-baseline gap-3">
                      <span className="font-mono text-xs font-black uppercase tracking-[0.28em] text-white/50">{item.number}</span>
                      <span className="font-mono text-[10px] font-bold uppercase tracking-[0.32em] text-[#C8A951]/70">{item.title}</span>
                    </div>
                    <span className="grid h-12 w-12 place-items-center rounded-2xl border border-[#C8A951]/24 text-[#C8A951]/80 transition duration-300 group-hover:border-[#C8A951]/45 group-hover:bg-[#C8A951]/10 group-hover:text-[#C8A951]">
                      <Icon size={21} strokeWidth={1.8} />
                    </span>
                  </div>
                  <h3 className="shrink-0 font-display text-[1.7rem] font-normal uppercase leading-[1.05] tracking-[-0.02em] text-white/90 md:text-4xl">
                    {item.code}
                  </h3>
                  <p className="mt-5 max-w-sm flex-1 whitespace-pre-line font-sans text-[0.95rem] leading-[1.68] text-white/66">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </MobileSwipeRow>
        </div>
      </section>

      <section id="design-decisions" className="reveal-on-scroll mobile-scroll-section mobile-section-breathing relative overflow-hidden max-md:!py-20 bg-[#070707] px-5 text-white md:px-10 md:py-24 lg:px-16 lg:py-32 [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:py-24" style={{ '--reveal-delay': '80ms' } as CSSProperties}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(200,169,81,0.07),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.014),transparent_42%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20 [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:gap-14">
          <div className="min-w-0 max-w-full lg:sticky lg:top-28 lg:self-start">
            <div className="max-w-xl">
              <p className="mb-6 font-sans text-[1rem] leading-[1.75] text-white/70 sm:text-[1.05rem] md:text-[1.1rem]">
                Setiap ruang menyimpan cerita dan kebutuhan penggunanya. Saya merancang dengan memahami ritme, kebiasaan, dan tujuan Anda, sehingga setiap keputusan desain terasa alami dan tepat sasaran.
              </p>
              <h2 className="font-display mt-6 text-balance text-[2.5rem] font-normal leading-[1.15] tracking-[-0.02em] text-[#F4F1EA] sm:text-[2.75rem] md:text-[3rem] lg:text-[3.5rem] [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:text-[clamp(3rem,4.3vw,3.35rem)]">
                Setiap Ruang Adalah Keputusan
              </h2>
            </div>
          </div>

          <MobileSwipeRow
            className="relative mt-8 lg:mt-0 lg:pt-3 [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:pt-1"
            ariaLabel="Kartu keputusan dapat digeser horizontal"
            desktopGridClassName="lg:grid-cols-1 lg:gap-5"
            backgroundTone="#070707"
          >
            {decisions.map((decision, index) => (
              <article
                key={decision.title}
                className="group relative flex h-full min-h-full flex-col overflow-hidden rounded-[24px] border border-white/5 bg-white/[0.018] p-5 transition duration-300 hover:border-[#C8A951]/24 hover:bg-white/[0.03] md:p-7 lg:pl-14"
              >
                <span className="pointer-events-none absolute bottom-0 left-4 top-0 hidden w-px bg-white/10 lg:block" />
                <span className="absolute left-[11px] top-6 hidden h-3 w-3 rounded-full border border-[#D4AF37]/45 bg-[#C8A951]/30 transition duration-300 group-hover:border-[#D4AF37]/65 group-hover:bg-[#C8A951]/50 lg:block" />
                <div className="flex shrink-0 items-center justify-between gap-4">
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.26em] text-[#C8A951]">0{index + 1}</p>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-white/42">Decision Point</p>
                </div>
                <h3 className="mt-4 max-w-2xl shrink-0 font-sans text-[1rem] font-semibold leading-7 tracking-[-0.018em] text-white/88 md:text-[1.35rem] md:leading-[1.45]">
                  {decision.title}
                </h3>
                <p className="mt-3 max-w-2xl flex-1 font-sans text-sm leading-6 text-white/60 md:text-base md:leading-[1.72]">
                  {decision.description}
                </p>
              </article>
            ))}
          </MobileSwipeRow>
        </div>
      </section>

      <section id="impact" className="reveal-on-scroll mobile-scroll-section mobile-section-breathing relative overflow-hidden max-md:!py-20 bg-[#142030] px-5 text-white md:px-10 md:py-24 lg:px-16 lg:py-32 [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:py-24" style={{ '--reveal-delay': '100ms' } as CSSProperties}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_10%,rgba(200,169,81,0.1),transparent_34%),radial-gradient(circle_at_82%_82%,rgba(200,169,81,0.08),transparent_38%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_52%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-14 [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:gap-10">
            <div className="max-w-3xl motion-safe:animate-[fade-up_700ms_ease-out]">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#C8A951] md:text-[11px]">Impact</p>
              <h2 className="font-display mt-5 text-balance text-[2.45rem] font-normal leading-[1.1] tracking-[-0.034em] text-[#F4F1EA] sm:text-5xl md:text-7xl [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:text-[clamp(3.25rem,5vw,4.1rem)]">
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

      <section id="differentiation" className="reveal-on-scroll mobile-scroll-section mobile-section-breathing relative overflow-hidden max-md:!py-20 bg-[#2D2D2B] px-5 md:px-10 md:py-24 lg:px-16 lg:py-32 [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:py-24" style={{ '--reveal-delay': '60ms' } as CSSProperties}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[#C8A951]/14" />
        <div className="relative mx-auto max-w-7xl">
          <div className="max-w-3xl">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.56em] text-[#C8A951] md:text-[11px]">Differentiation</p>
            <h2 className="font-display mt-6 text-balance text-[2.45rem] font-normal leading-[1.1] tracking-[-0.034em] text-[#F4F1EA] sm:text-5xl md:text-7xl [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:text-[clamp(3.25rem,5vw,4.1rem)]">
              Apa yang Membedakan
            </h2>
          </div>

          <MobileSwipeRow
            className="mt-10 sm:mt-12 [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:mt-12"
            ariaLabel="Kartu diferensiasi dapat digeser horizontal"
            desktopGridClassName="lg:grid-cols-3 lg:gap-0"
            backgroundTone="#2D2D2B"
          >
            {differentiations.map((item, index) => (
              <article key={item.title} className="group flex h-full min-h-full flex-col rounded-[24px] border border-white/5 bg-white/[0.02] p-6 transition duration-300 motion-safe:active md:rounded-[28px]:scale-[0.985] hover:border-[#C8A951]/25 hover:bg-white/[0.04] lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l lg:border-white/10 lg:bg-transparent lg:px-12 lg:py-0 [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:px-8 first:lg:border-l-0 first:lg:pl-0 last:lg:pr-0">
                <div className="flex items-start gap-4">
                  <CheckCircle2 className="mt-1 shrink-0 text-[#C8A951]/78 transition duration-300 group-hover:text-[#C8A951]" size={18} strokeWidth={2.1} />
                  <div className="flex min-h-full flex-1 flex-col">
                    <p className="mb-4 font-mono text-[10px] font-black uppercase tracking-[0.24em] text-white/40">0{index + 1}</p>
                    <h3 className="shrink-0 text-lg font-semibold uppercase leading-snug tracking-[-0.018em] text-white/90 md:text-xl">
                      {item.title}
                    </h3>
                    <p className="mt-4 max-w-sm flex-1 font-sans text-[0.95rem] leading-[1.68] text-white/66">
                      {item.description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </MobileSwipeRow>
        </div>
      </section>

      <section id="portfolio" className="reveal-on-scroll mobile-scroll-section mobile-section-breathing relative overflow-hidden max-md:!py-20 bg-[#142030] px-5 text-white md:px-10 md:py-24 lg:px-16 lg:py-32 [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:py-24" style={{ '--reveal-delay': '80ms' } as CSSProperties}>
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.018),transparent_40%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-12 lg:grid-cols-[1fr_0.42fr] lg:items-center [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:gap-10">
            <div>
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#C8A951] md:text-[11px]">Decision-Based Portfolio</p>
              <h2 className="font-display mt-6 max-w-4xl text-balance text-[2.45rem] font-normal leading-[1.1] tracking-[-0.034em] text-[#F4F1EA] sm:text-5xl md:text-7xl [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:text-[clamp(3.25rem,5vw,4.1rem)]">
                Portfolio Berbasis Keputusan
              </h2>
              <p className="mt-6 max-w-4xl font-sans text-base leading-[1.68] text-white/62 sm:text-lg md:mt-8 md:text-xl">
                Setiap karya saya tampilkan sebagai cerita keputusan: masalah awal, proses berpikir, dan dampak yang dirasakan pengguna maupun bisnis.
              </p>
            </div>

            <a href="/karya" className="group inline-flex items-center gap-4 justify-self-start border-b border-white/20 pb-1 font-mono text-xs font-black uppercase tracking-[0.18em] text-white/66 transition duration-300 hover:border-[#C8A951]/50 hover:text-[#C8A951] lg:justify-self-end">
              Lihat Semua Karya
              <MoveRight className="text-[#C8A951] transition duration-300 group-hover:translate-x-1" size={20} />
            </a>
          </div>

          <div className="mt-10 grid gap-5 sm:mt-12 sm:gap-6 md:mt-20 lg:grid-cols-2 [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:mt-14 [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:gap-6">
            {portfolioWorks.map((project, index) => {
              const meta = project.category || project.design_category;
              const teaser = project.problem || project.solution || project.impact;
              const detailHref = project.slug ? `/karya/${project.slug}` : '/karya';

              return (
                <article key={project.id} className="group relative overflow-hidden rounded-[24px] md:rounded-[30px] border border-white/5 bg-gradient-to-br from-white/[0.03] to-white/[0.01] transition duration-300 hover:-translate-y-1 hover:border-[#C8A951]/22 hover:shadow-[0_26px_58px_rgba(0,0,0,0.35)]">
                  <div className="relative aspect-[4/3] overflow-hidden sm:aspect-[16/9] border-b border-white/5 bg-[#0f1925]">
                    {project.cover_image ? (
                      <>
                        <img src={project.cover_image} alt={project.title || 'Gambar project Eryawan Agung'} className="h-full w-full object-cover" loading="lazy" decoding="async" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />
                      </>
                    ) : (
                      <div className="absolute inset-0 flex items-end bg-[linear-gradient(150deg,#1a2a3d_0%,#132130_55%,#0d161f_100%)] p-5">
                        <div className="rounded-2xl border border-white/10 bg-black/35 px-3 py-1 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-white/64">
                          Visual proyek belum tersedia
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 sm:bottom-5 sm:left-5 sm:right-5 sm:gap-3">
                      <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-[#C8A951] sm:tracking-[0.36em]">Project {String(index + 1).padStart(2, '0')}</p>
                      {meta ? <span className="max-w-full rounded-full border border-white/10 bg-black/30 px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-[0.1em] text-white/64 sm:px-3 sm:text-[10px] sm:tracking-[0.14em]">{meta}</span> : null}
                    </div>
                  </div>
                  <div className="p-5 sm:p-6 md:p-8 [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:p-7">
                    <h3 className="font-display max-w-2xl text-[2rem] font-normal leading-[1.05] sm:text-4xl sm:leading-[1.02] tracking-[-0.03em] text-white/92 md:text-5xl [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:text-[clamp(2.25rem,4vw,3rem)]">{project.title}</h3>
                    {teaser ? <p className="mt-4 text-[0.95rem] leading-[1.7] sm:mt-5 sm:text-base sm:leading-[1.75] text-white/62 md:text-lg">{teaser}</p> : null}
                    <a href={detailHref} className="mt-5 inline-flex items-center gap-2.5 font-mono text-[10px] font-black uppercase tracking-[0.16em] sm:mt-7 sm:gap-3 sm:text-[11px] sm:tracking-[0.2em] text-[#C8A951] transition duration-300 hover:text-[#D7BD72]">Eksplor Studi Kasus <MoveRight className="transition duration-300 group-hover:translate-x-1" size={16} /></a>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>


      <section id="wawasan-design" className="reveal-on-scroll mobile-scroll-section mobile-section-breathing relative overflow-hidden max-md:!py-20 bg-[#0B0B0A] px-5 text-white md:px-10 md:py-24 lg:px-16 lg:py-32 [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:py-24" style={{ '--reveal-delay': '100ms' } as CSSProperties}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_16%_20%,rgba(200,169,81,0.07),transparent_32%),linear-gradient(180deg,rgba(255,255,255,0.015),transparent_42%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 md:max-w-3xl">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#C8A951] md:text-[11px]">Wawasan</p>
            <h2 className="font-display text-balance text-[2.45rem] font-normal leading-[1.1] tracking-[-0.034em] text-[#F4F1EA] sm:text-5xl md:text-7xl [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:text-[clamp(3.25rem,5vw,4.1rem)]">
              Wawasan Desain
            </h2>
            <p className="font-sans text-base leading-[1.7] text-white/62 sm:text-lg md:text-xl">
              Insight singkat tentang cara saya membaca ruang, menilai tren, dan menyusun keputusan desain berbasis tujuan bisnis.
            </p>
          </div>

          <div className="mt-9 grid gap-3.5 sm:mt-10 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:mt-10">
            {wawasanCards.map((article) => (
              <article key={article.title} className="group rounded-[22px] border border-white/5 bg-white/[0.02] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[#C8A951]/24 hover:bg-white/[0.045]">
                <p className="inline-flex max-w-full rounded-full border border-[#C8A951]/30 bg-[#C8A951]/10 px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-[0.14em] sm:text-[10px] sm:tracking-[0.18em] text-[#D2B364]">{article.tag}</p>
                <h3 className="mt-4 font-sans text-lg font-semibold leading-snug tracking-[-0.02em] text-white/92">
                  {article.title}
                </h3>
                <p className="mt-3 font-sans text-sm leading-[1.68] text-white/66">{article.excerpt}</p>
                <a
                  href={article.href}
                  className="mt-4 inline-flex items-center gap-2.5 font-mono text-[10px] font-bold uppercase tracking-[0.14em] sm:mt-5 sm:text-[11px] sm:tracking-[0.16em] text-[#C8A951] transition duration-300 hover:text-[#D7BD72]"
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
            Baca Studi Kasus
            <MoveRight className="text-[#C8A951] transition duration-300 group-hover:translate-x-1" size={18} />
          </a>
        </div>
      </section>

      <section id="contact" className="reveal-on-scroll mobile-scroll-section mobile-section-breathing relative overflow-hidden max-md:!py-20 bg-[#050505] px-5 text-white md:px-10 md:py-24 lg:px-16 lg:py-32 [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:py-24" style={{ '--reveal-delay': '60ms' } as CSSProperties}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(200,169,81,0.042),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-6xl text-center">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#C8A951] md:text-[11px]">
              Ajukan Kolaborasi
            </p>
            <h2 className="font-display mx-auto mt-6 max-w-5xl text-balance text-[2.05rem] font-normal italic leading-[1.22] sm:mt-8 sm:text-4xl tracking-[-0.025em] text-[#F4F1EA] md:text-5xl md:leading-[1.18] lg:text-6xl xl:text-[4.6rem] [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:max-w-[min(100%,68rem)] [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:text-[clamp(2.6rem,4vw,3.35rem)] [@media_(min-width:900px)_and_(max-width:1280px)_and_(orientation:landscape)]:leading-[1.14]">
              Jika Anda membutuhkan desainer, opsinya banyak.<br className="hidden [@media_(min-width:1281px)]:block" /> Jika Anda membutuhkan mitra strategis, mari berdiskusi.
            </h2>
            <p className="mx-auto mt-6 max-w-3xl font-sans text-base leading-[1.68] text-white/62 sm:mt-8 sm:text-lg md:text-2xl">
              Saya terbuka untuk peluang profesional dan kolaborasi proyek yang membutuhkan desain terarah, komunikasi jelas, dan hasil yang memberi dampak nyata.
            </p>

            <TrackedLink href="/mulai-project" eventName="cta_click" eventProps={{ source: "homepage_final", label: "ajukan_kolaborasi", href_type: "internal" }} data-cta="homepage-final-collaboration" className="inline-flex min-h-10 max-w-full items-center justify-center rounded-full bg-[#C8A951] px-5 py-3.5 text-center font-mono text-[0.78rem] font-semibold uppercase tracking-[0.1em] premium-interactive transition-all duration-300 ease-out text-[#080807] shadow-[0_18px_42px_rgba(200,169,81,0.12)] hover:bg-[#D7BD72] hover:bg-white/5 active:translate-y-0 active:scale-[0.98] active:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807] mt-10 w-full sm:mt-14 sm:w-auto sm:min-w-[300px] sm:px-6 sm:py-5 sm:text-sm sm:tracking-[0.14em] md:min-w-[420px]">Ajukan Kolaborasi</TrackedLink>

            <p className="mx-auto mt-5 max-w-sm font-mono text-[9px] font-bold uppercase leading-relaxed tracking-[0.16em] text-white/32 sm:mt-6 sm:max-w-none sm:text-[10px] sm:tracking-[0.18em]">
              Diskusi awal dapat dimulai dari konteks ruang, kebutuhan aktivitas, dan arah desain.
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

          <div className="mt-14 h-px w-full bg-white/8 sm:mt-20" />

          <div className="mt-10 flex flex-col gap-4 font-mono text-[9px] font-bold uppercase leading-relaxed tracking-[0.16em] text-white/42 sm:mt-14 sm:gap-6 sm:text-[10px] sm:tracking-[0.22em] md:flex-row md:items-center md:justify-between md:text-[11px]">
            <p>© 2026 Eryawan Agung — Strategic Design & Spatial Logic</p>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-8">
              <AdminFooterShortcut />
              <span>Surabaya • Melayani Indonesia</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
