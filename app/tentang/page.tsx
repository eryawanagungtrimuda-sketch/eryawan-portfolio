import type { Metadata } from 'next';
import type { CSSProperties } from 'react';

import BackButton from '@/components/back-button';
import MobileSwipeRow from '@/components/mobile-swipe-row';
import RevealObserver from '@/components/reveal-observer';
import Button from '@/components/ui/button';
import { absoluteUrl } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Tentang Eryawan Agung | Interior Design Strategy',
  description:
    'Profil Eryawan Agung sebagai desainer interior strategis yang membantu membaca kebutuhan ruang, menyusun keputusan desain, dan menghubungkan estetika, fungsi, eksekusi, serta nilai bisnis.',
  alternates: { canonical: absoluteUrl('/tentang') },
  openGraph: {
    title: 'Tentang Eryawan Agung | Interior Design Strategy',
    description:
      'Profil Eryawan Agung sebagai desainer interior strategis yang membantu membaca kebutuhan ruang, menyusun keputusan desain, dan menghubungkan estetika, fungsi, eksekusi, serta nilai bisnis.',
    url: absoluteUrl('/tentang'),
  },
};

const fokusKeahlian = [
  {
    title: 'Residential & Hospitality',
    description:
      'Merancang ruang tinggal, villa, dan hospitality dengan perhatian pada kenyamanan, suasana, alur aktivitas, privasi, dan pengalaman pengguna.',
  },
  {
    title: 'Commercial & Workspace',
    description:
      'Membantu ruang kerja, kantor, dan area komersial memiliki identitas visual yang rapi, fungsi yang jelas, dan alur ruang yang mendukung produktivitas.',
  },
  {
    title: 'Design Development',
    description:
      'Mengembangkan gagasan awal menjadi arah desain yang lebih matang, mudah dipresentasikan, dan realistis untuk diterjemahkan ke tahap eksekusi.',
  },
];

const trustSignals = [
  {
    title: '15+ Tahun Pengalaman',
    description: 'Terlibat dalam berbagai kebutuhan ruang dengan pola kerja yang tenang, terukur, dan berorientasi pada hasil.',
  },
  {
    title: 'Membaca Konteks Sebelum Bentuk',
    description: 'Setiap keputusan dimulai dari pemahaman fungsi, pengguna, suasana, batasan teknis, dan kondisi lapangan.',
  },
  {
    title: 'Menghubungkan Desain dan Eksekusi',
    description: 'Arah visual disusun agar tetap kuat secara estetika, tetapi juga realistis untuk diwujudkan dalam proses pengerjaan.',
  },
  {
    title: 'Komunikasi Desain yang Jelas',
    description: 'Saya membantu merapikan bahasa desain agar keputusan lebih mudah dipahami oleh klien, owner, HRD, dan tim pelaksana.',
  },
];

const professionalValue = [
  {
    title: 'Strategic Design Thinking',
    description: 'Melihat desain sebagai rangkaian keputusan yang memengaruhi fungsi, pengalaman, citra, dan nilai ruang.',
  },
  {
    title: 'Decision Clarity',
    description: 'Membantu ide yang masih luas menjadi prioritas desain yang lebih jelas, terukur, dan mudah dievaluasi.',
  },
  {
    title: 'Execution Awareness',
    description: 'Mempertimbangkan material, waktu, koordinasi, dan realitas pengerjaan sejak awal.',
  },
  {
    title: 'Business Relevance',
    description: 'Mengaitkan keputusan desain dengan kenyamanan pengguna, citra brand, efisiensi aktivitas, dan kebutuhan operasional.',
  },
];

const howIWork = [
  {
    title: 'Mendengar Brief',
    description:
      'Saya mulai dari memahami tujuan utama, kebutuhan pengguna, batasan proyek, dan hal-hal yang belum jelas dari sisi klien atau tim.',
  },
  {
    title: 'Membaca Konteks Ruang',
    description: 'Saya menilai pola aktivitas, karakter pengguna, kondisi lapangan, dan potensi ruang agar arah desain memiliki dasar yang kuat.',
  },
  {
    title: 'Menyusun Arah Desain',
    description: 'Prioritas visual, fungsi, material, dan pengalaman ruang dirapikan menjadi keputusan yang dapat dibahas secara objektif.',
  },
  {
    title: 'Menentukan Langkah Lanjut',
    description: 'Setelah arah desain terbaca, saya membantu merumuskan langkah berikutnya agar proses bergerak lebih efektif dan tidak melebar.',
  },
];

export default function TentangPage() {
  return (
    <main id="main-content" className="min-h-screen overflow-x-clip bg-[#080807] font-sans text-[#F4F1EA]">
      <RevealObserver />
      <section className="reveal-on-scroll mobile-scroll-section mobile-section-breathing relative overflow-hidden px-4 sm:px-5 md:px-8 md:py-24 lg:px-12 lg:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(200,169,81,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10">
            <BackButton fallbackHref="/" />
          </div>
          <div className="reveal-on-scroll" style={{ '--reveal-delay': '80ms' } as CSSProperties}>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#C8A951] md:text-[11px]">TENTANG ERYAWAN AGUNG</p>
            <h1 className="font-display mt-5 max-w-6xl text-[2rem] font-normal leading-[1.08] tracking-[-0.03em] text-[#F4F1EA] sm:text-[2.4rem] md:text-7xl">
              Desainer interior yang membaca ruang sebagai strategi, bukan sekadar tampilan.
            </h1>
          </div>
          <div className="reveal-on-scroll mt-8 max-w-4xl space-y-5 text-base leading-[1.75] text-white/70 sm:text-lg md:text-xl" style={{ '--reveal-delay': '140ms' } as CSSProperties}>
            <p>
              Saya membantu perusahaan, owner, dan tim desain menerjemahkan kebutuhan ruang menjadi keputusan desain yang
              jelas, fungsional, dan dapat dipertanggungjawabkan.
            </p>
            <p>
              Pendekatan saya menghubungkan estetika, alur aktivitas, material, eksekusi, dan nilai bisnis agar ruang
              tidak hanya terlihat baik, tetapi juga bekerja dengan tepat.
            </p>
            <p>
              Saya terbuka untuk peluang profesional di bidang arsitektur dan interior design, serta kolaborasi proyek
              yang membutuhkan cara berpikir strategis sejak tahap awal.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/mulai-project" className="px-8">
              Diskusikan Peluang Proyek
            </Button>
            <Button href="/karya" variant="secondary" className="px-8">
              Lihat Portfolio Karya
            </Button>
          </div>
        </div>
      </section>

      <section className="reveal-on-scroll mobile-scroll-section mobile-section-breathing border-y border-white/3 bg-[#090909] px-5 md:px-10 md:py-24 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-4xl font-normal leading-[1.1] tracking-[-0.03em] md:text-6xl">Cara Saya Melihat Ruang</h2>
          <div className="mt-7 space-y-5 text-base leading-[1.8] text-white/70 md:text-lg">
            <p>
              Bagi saya, ruang selalu membawa data sebelum desain dimulai. Ada pola aktivitas, karakter pengguna, batasan
              teknis, arah visual, budget, serta keputusan kecil yang menentukan apakah ruang benar-benar nyaman digunakan.
            </p>
            <p>
              Saya membaca ruang sebagai sistem yang berisi pergerakan, prioritas, identitas, dan kebutuhan praktis. Dari
              proses itu, desain tidak berhenti sebagai bentuk visual, tetapi menjadi keputusan yang membantu aktivitas
              berjalan lebih efektif.
            </p>
            <p>
              Peran saya adalah menerjemahkan konteks tersebut menjadi arah desain yang jelas, mudah dibahas, dan
              realistis untuk dieksekusi bersama tim.
            </p>
          </div>
        </div>
      </section>

      <section className="reveal-on-scroll mobile-scroll-section mobile-section-breathing px-5 md:px-10 md:py-24 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-4xl font-normal leading-[1.1] tracking-[-0.03em] md:text-6xl">Fokus Keahlian</h2>
          <MobileSwipeRow className="mt-12" ariaLabel="Fokus keahlian" desktopGridClassName="lg:grid-cols-3 lg:gap-6" backgroundTone="#080807" cardClassName="h-full">
            {fokusKeahlian.map((item, index) => (
              <article key={item.title} className="group flex h-full min-h-full flex-col rounded-[28px] border border-white/5 bg-white/[0.02] p-8 transition duration-300 motion-safe:active:scale-[0.985] motion-safe:hover:-translate-y-1 motion-safe:hover:transform-gpu hover:border-[#C8A951]/25 hover:bg-white/[0.04] md:p-10">
                <span className="font-mono text-xs font-black uppercase tracking-[0.28em] text-white/50">0{index + 1}</span>
                <h3 className="font-display mt-5 text-3xl font-normal leading-[1.08] tracking-[-0.02em] text-white/90">{item.title}</h3>
                <p className="mt-4 text-base leading-[1.75] text-white/62">{item.description}</p>
              </article>
            ))}
          </MobileSwipeRow>
        </div>
      </section>

      <section className="reveal-on-scroll mobile-scroll-section mobile-section-breathing border-y border-white/3 bg-[#0B0B0A] px-5 md:px-10 md:py-24 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#C8A951] md:text-[11px]">Trust Signals</p>
          <h2 className="font-display mt-5 max-w-5xl text-4xl font-normal leading-[1.08] tracking-[-0.03em] md:text-6xl">
            Kepercayaan yang Dibangun dari Pengalaman
          </h2>
          <p className="mt-7 max-w-4xl text-base leading-[1.75] text-white/70 md:text-lg">
            Kredibilitas saya dibangun dari cara kerja yang konsisten: membaca konteks terlebih dulu, merapikan prioritas
            desain, lalu menjaga keputusan tetap bisa dipahami dan dijalankan.
          </p>

          <MobileSwipeRow className="mt-12" ariaLabel="Trust signals" desktopGridClassName="lg:grid-cols-4 lg:gap-4" backgroundTone="#0B0B0A" cardClassName="h-full">
            {trustSignals.map((item) => (
              <article key={item.title} className="flex h-full min-h-full flex-col rounded-[24px] border border-white/5 bg-white/[0.02] p-6 transition duration-300 motion-safe:active:scale-[0.985] hover:border-[#C8A951]/25 hover:bg-white/[0.04] md:p-7">
                <h3 className="font-display text-2xl font-normal leading-[1.2] tracking-[-0.02em] text-white/92">{item.title}</h3>
                <p className="mt-4 text-base leading-[1.75] text-white/62">{item.description}</p>
              </article>
            ))}
          </MobileSwipeRow>
        </div>
      </section>

      <section className="reveal-on-scroll mobile-scroll-section mobile-section-breathing bg-[#2D2D2B] px-5 md:px-10 md:py-24 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-4xl font-normal leading-[1.1] tracking-[-0.03em] text-[#F4F1EA] md:text-6xl">
            Nilai Profesional yang Saya Bawa
          </h2>
          <MobileSwipeRow
            className="mt-12"
            ariaLabel="Nilai profesional dapat digeser horizontal"
            desktopGridClassName="lg:grid-cols-2 lg:gap-6"
            backgroundTone="#2D2D2B"
            cardClassName="h-full"
          >
            {professionalValue.map((item) => (
              <article key={item.title} className="flex h-full min-h-full flex-col rounded-[24px] border border-white/5 bg-white/[0.02] p-6 transition duration-300 motion-safe:active:scale-[0.985] hover:border-[#C8A951]/25 hover:bg-white/[0.04] md:p-7">
                <h3 className="font-display text-2xl font-normal leading-[1.15] tracking-[-0.02em] text-white/90">{item.title}</h3>
                <p className="mt-4 text-base leading-[1.75] text-white/62">{item.description}</p>
              </article>
            ))}
          </MobileSwipeRow>
        </div>
      </section>

      <section className="reveal-on-scroll mobile-scroll-section mobile-section-breathing bg-[#090909] px-5 md:px-10 md:py-24 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-4xl font-normal leading-[1.1] tracking-[-0.03em] text-[#F4F1EA] md:text-6xl">Cara Saya Membaca Proyek</h2>
          <MobileSwipeRow
            className="mt-12"
            ariaLabel="Cara saya membaca proyek dapat digeser horizontal"
            desktopGridClassName="lg:grid-cols-2 lg:gap-6"
            backgroundTone="#090909"
            cardClassName="h-full"
          >
            {howIWork.map((item, index) => (
              <article key={item.title} className="flex h-full min-h-full flex-col gap-4 rounded-[24px] border border-white/5 bg-white/[0.02] p-6 transition duration-300 motion-safe:active:scale-[0.985] hover:border-[#C8A951]/25 hover:bg-white/[0.04] md:gap-6 md:p-7">
                <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-[#C8A951]">0{index + 1}</p>
                <div className="flex flex-1 flex-col">
                  <h3 className="font-display text-3xl font-normal leading-[1.1] tracking-[-0.02em] text-white/90">{item.title}</h3>
                  <p className="mt-3 text-base leading-[1.75] text-white/62">{item.description}</p>
                </div>
              </article>
            ))}
          </MobileSwipeRow>
        </div>
      </section>

      <section className="reveal-on-scroll mobile-scroll-section mobile-section-breathing relative overflow-hidden border-t border-white/3 px-5 md:px-10 md:py-24 lg:px-16 lg:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(200,169,81,0.06),transparent_34%)]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <h2 className="font-display text-4xl font-normal leading-[1.08] tracking-[-0.03em] text-[#F4F1EA] md:text-6xl">
            Mari mulai dari membaca kebutuhan ruang dengan benar.
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-[1.75] text-white/70 md:text-lg">
            Baik untuk peluang kerja profesional, kolaborasi dengan perusahaan, maupun proyek desain, saya siap membantu
            membaca konteks dan menyusun arah ruang secara lebih strategis.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button href="/mulai-project" className="px-8">
              Mulai Diskusi Profesional
            </Button>
            <Button href="/wawasan" variant="secondary" className="px-8">
              Baca Wawasan Desain
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
