import type { Metadata } from 'next';

import BackButton from '@/components/back-button';
import MobileSwipeRow from '@/components/mobile-swipe-row';
import RevealObserver from '@/components/reveal-observer';
import Button from '@/components/ui/button';
import { absoluteUrl } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'Tentang Eryawan Agung | Design Portfolio',
  description:
    'Kenali cara Eryawan Agung membaca ruang, menyusun arah desain, dan menghubungkan estetika, fungsi, serta konteks eksekusi project.',
  alternates: { canonical: absoluteUrl('/tentang') },
  openGraph: {
    title: 'Tentang Eryawan Agung | Design Portfolio',
    description:
      'Kenali cara Eryawan Agung membaca ruang, menyusun arah desain, dan menghubungkan estetika, fungsi, serta konteks eksekusi project.',
    url: absoluteUrl('/tentang'),
  },
};

const fokusKeahlian = [
  {
    title: 'Residential & Hospitality',
    description:
      'Merancang ruang tinggal, villa, dan hospitality dengan perhatian pada suasana, kenyamanan, alur aktivitas, dan karakter ruang.',
  },
  {
    title: 'Workspace & Corporate',
    description:
      'Membantu ruang kerja dan komersial memiliki arah visual yang rapi, fungsional, dan selaras dengan identitas brand.',
  },
  {
    title: 'Design Development',
    description:
      'Mengembangkan gagasan awal menjadi arah desain yang lebih jelas, siap dibahas, dan lebih mudah diterjemahkan ke tahap eksekusi.',
  },
];

const trustSignals = [
  {
    title: '15+ Tahun',
    description: 'Mengawal project lintas kebutuhan dengan pola pikir yang tetap tenang, terukur, dan berorientasi hasil.',
  },
  {
    title: 'Membaca konteks sebelum menentukan bentuk',
    description: 'Setiap keputusan dimulai dari pemahaman fungsi, pengguna, suasana, dan batasan riil di lapangan.',
  },
  {
    title: 'Menghubungkan desain dengan fungsi dan eksekusi',
    description: 'Arah visual disusun agar tetap indah sekaligus realistis untuk diterjemahkan ke proses pengerjaan.',
  },
  {
    title: 'Menjaga komunikasi desain tetap jelas',
    description: 'Saya merapikan bahasa desain agar keputusan lebih mudah dipahami klien dan tim pelaksana.',
  },
];

const professionalValue = [
  {
    title: 'Strategic Design Thinking',
    description: 'Melihat desain sebagai rangkaian keputusan, bukan sekadar susunan elemen visual.',
  },
  {
    title: 'Decision Clarity',
    description: 'Membantu ide yang masih samar menjadi arah desain yang lebih jelas dan siap dibahas.',
  },
  {
    title: 'Execution Awareness',
    description: 'Mempertimbangkan material, waktu, koordinasi, dan realitas pengerjaan sejak awal.',
  },
  {
    title: 'Business Relevance',
    description: 'Mengaitkan keputusan desain dengan kenyamanan pengguna, citra brand, dan keberlanjutan operasional.',
  },
];

const howIWork = [
  {
    title: 'Mendengar dan Memahami Brief',
    description:
      'Saya mulai dari memahami kebutuhan utama, batasan, tujuan ruang, dan hal-hal yang masih belum jelas dari sisi klien.',
  },
  {
    title: 'Membaca Konteks Ruang',
    description: 'Saya menilai pola aktivitas, karakter pengguna, dan kondisi lapangan agar arah desain punya dasar yang tepat.',
  },
  {
    title: 'Menyusun Arah Desain',
    description: 'Prioritas visual, fungsi, dan material dirapikan menjadi keputusan yang selaras dan mudah dievaluasi bersama.',
  },
  {
    title: 'Menentukan Langkah Lanjut',
    description: 'Setelah arah disepakati, saya bantu merumuskan langkah berikutnya supaya proses desain bergerak lebih efektif.',
  },
];

export default function TentangPage() {
  return (
    <main id="main-content" className="min-h-screen overflow-x-clip bg-[#080807] font-sans text-[#F4F1EA]">
      <RevealObserver />
      <section className="reveal-on-scroll relative overflow-hidden px-4 py-16 sm:px-5 md:px-8 md:py-24 lg:px-12 lg:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(200,169,81,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10">
            <BackButton fallbackHref="/" />
          </div>
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#C8A951] md:text-[11px]">TENTANG ERYAWAN AGUNG</p>
          <h1 className="font-display mt-5 max-w-6xl text-[2rem] font-normal leading-[1.08] tracking-[-0.03em] text-[#F4F1EA] sm:text-[2.4rem] md:text-7xl">
            Merancang ruang dengan cara membaca kebutuhan, karakter, dan arah hidup di dalamnya.
          </h1>
          <div className="mt-8 max-w-4xl space-y-5 text-base leading-[1.75] text-white/70 sm:text-lg md:text-xl">
            <p>
              Saya memulai setiap project dengan memahami bagaimana ruang akan dipakai, atmosfer seperti apa yang ingin
              dihadirkan, dan keputusan mana yang realistis untuk dieksekusi dengan baik.
            </p>
            <p>
              Bagi saya, desain bukan hanya soal tampilan akhir. Desain adalah upaya menyatukan fungsi, karakter visual,
              arah material, dan konteks project agar hasilnya terasa tepat, matang, dan relevan dalam jangka panjang.
            </p>
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/mulai-project" className="px-8">
              Mulai Diskusi Project
            </Button>
            <Button href="/karya" variant="secondary" className="px-8">
              Lihat Karya
            </Button>
          </div>
        </div>
      </section>

      <section className="reveal-on-scroll border-y border-white/3 bg-[#090909] px-5 py-16 md:px-10 md:py-24 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-4xl">
          <h2 className="font-display text-4xl font-normal leading-[1.1] tracking-[-0.03em] md:text-6xl">Cara Saya Melihat Ruang</h2>
          <div className="mt-7 space-y-5 text-base leading-[1.8] text-white/70 md:text-lg">
            <p>
              Bagi saya, ruang selalu memiliki cerita sebelum desain dimulai. Ada kebiasaan pengguna, batasan teknis,
              arah visual yang diinginkan, serta keputusan-keputusan kecil yang menentukan apakah ruang itu nyaman
              digunakan atau hanya terlihat menarik.
            </p>
            <p>
              Dalam membaca project, saya melihat ruang bukan sebagai area kosong yang perlu dihias, melainkan sistem
              yang berisi pergerakan, prioritas, identitas, dan kebutuhan praktis yang harus dipertemukan secara seimbang.
            </p>
            <p>
              Peran saya adalah menerjemahkan konteks tersebut menjadi arah desain yang lebih jelas, sehingga diskusi,
              keputusan, dan eksekusi dapat berjalan lebih terarah.
            </p>
          </div>
        </div>
      </section>

      <section className="reveal-on-scroll px-5 py-16 md:px-10 md:py-24 lg:px-16 lg:py-28">
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

      <section className="border-y border-white/3 bg-[#0B0B0A] px-5 py-16 md:px-10 md:py-24 lg:px-16 lg:py-28">
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

      <section className="bg-[#2D2D2B] px-5 py-16 md:px-10 md:py-24 lg:px-16 lg:py-28">
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

      <section className="bg-[#090909] px-5 py-16 md:px-10 md:py-24 lg:px-16 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <h2 className="font-display text-4xl font-normal leading-[1.1] tracking-[-0.03em] text-[#F4F1EA] md:text-6xl">Cara Saya Membaca Project</h2>
          <MobileSwipeRow
            className="mt-12"
            ariaLabel="Cara saya membaca project dapat digeser horizontal"
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

      <section className="relative overflow-hidden border-t border-white/3 px-5 py-16 md:px-10 md:py-24 lg:px-16 lg:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(200,169,81,0.06),transparent_34%)]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <h2 className="font-display text-4xl font-normal leading-[1.08] tracking-[-0.03em] text-[#F4F1EA] md:text-6xl">
            Punya ruang atau project yang perlu diarahkan?
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-[1.75] text-white/70 md:text-lg">
            Bagikan konteks awal project Anda agar kebutuhan, prioritas, dan arah desain dapat dibaca dengan lebih jelas
            sebelum masuk ke diskusi lanjutan.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button href="/mulai-project" className="px-8">
              Mulai Diskusi Project
            </Button>
            <Button href="/wawasan" variant="secondary" className="px-8">
              Lihat Wawasan
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
