import BackButton from '@/components/back-button';
import Button from '@/components/ui/button';

const coreExpertise = [
  {
    title: 'Residential & Hospitality',
    description:
      'Merancang ruang tinggal dan hospitality dengan fokus pada kenyamanan, kualitas pengalaman, dan karakter ruang.',
  },
  {
    title: 'Workspace & Corporate',
    description:
      'Membantu organisasi menyusun ruang kerja yang mendukung kolaborasi, fokus individu, dan efisiensi operasional.',
  },
  {
    title: 'Design Development',
    description:
      'Mengawal ide dari konsep sampai keputusan teknis agar desain tidak berhenti di visual, tetapi siap dieksekusi.',
  },
];

const professionalValue = [
  {
    title: 'Strategic Design Thinking',
    description: 'Membaca konteks proyek sebelum menentukan bentuk, material, dan arah visual.',
  },
  {
    title: 'Decision Clarity',
    description: 'Menyusun prioritas desain agar keputusan tidak berjalan parsial atau reaktif.',
  },
  {
    title: 'Execution Awareness',
    description: 'Memahami batasan waktu, biaya, koordinasi, dan kompleksitas stakeholder.',
  },
  {
    title: 'Business Relevance',
    description:
      'Menghubungkan keputusan desain dengan kenyamanan pengguna, citra brand, dan keberlanjutan operasional.',
  },
];

const trustSignals = [
  {
    title: '15+ Tahun',
    description: 'Pengalaman dalam merancang ruang residensial, hospitality, dan workspace dengan kebutuhan yang beragam.',
  },
  {
    title: 'Strategic Design',
    description: 'Tidak hanya membuat visual, tetapi membantu menyusun arah desain, prioritas keputusan, dan logika ruang.',
  },
  {
    title: 'Execution Aware',
    description:
      'Memahami bahwa desain harus mempertimbangkan waktu, biaya, koordinasi, material, dan realitas pelaksanaan.',
  },
  {
    title: 'Business Context',
    description:
      'Menghubungkan keputusan desain dengan kenyamanan pengguna, citra brand, dan keberlanjutan operasional.',
  },
];

const proofOfValue = [
  'Membaca konteks sebelum menentukan bentuk.',
  'Mengubah brief samar menjadi arah desain yang jelas.',
  'Menjembatani bahasa desain dengan bahasa bisnis.',
  'Menyusun keputusan yang siap dipresentasikan dan dieksekusi.',
  'Melihat proyek sebagai sistem, bukan kumpulan elemen visual.',
];

const howIWork = [
  {
    title: 'Understand the Context',
    description: 'Memetakan kebutuhan pengguna, tujuan ruang, karakter brand, serta batasan proyek sejak awal.',
  },
  {
    title: 'Define the Direction',
    description: 'Menyusun prioritas dan arah desain agar semua pihak bergerak pada keputusan yang sama.',
  },
  {
    title: 'Develop the Design',
    description: 'Mengembangkan konsep menjadi keputusan ruang, material, dan detail yang relevan.',
  },
  {
    title: 'Align with Execution',
    description: 'Menjaga agar desain tetap realistis terhadap waktu, anggaran, dan koordinasi lintas stakeholder.',
  },
];

const capabilitySnapshot = [
  'Design Strategy',
  'Interior Concept',
  'Space Planning',
  'Material & Lighting Direction',
  'Design Development',
  'Client / Stakeholder Communication',
  'Project Documentation',
  'AI-assisted Design Review',
];

const diferensiasiSenior = [
  'Tidak berhenti pada estetika; setiap keputusan desain harus punya alasan.',
  'Mampu melihat proyek sebagai sistem, bukan kumpulan elemen visual.',
  'Terbiasa mengambil keputusan di bawah batasan waktu, biaya, dan stakeholder.',
  'Mengubah brief yang samar menjadi arah desain yang jelas dan bisa dieksekusi.',
];

export default function TentangPage() {
  return (
    <main className="min-h-screen bg-[#080807] font-sans text-[#F4F1EA]">
      <section className="relative overflow-hidden px-4 py-16 sm:px-5 md:px-8 lg:px-12 lg:py-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(200,169,81,0.08),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_55%)]" />
        <div className="relative mx-auto max-w-7xl">
          <div className="mb-10">
            <BackButton label="Kembali ke Beranda" fallbackHref="/" />
          </div>
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#C8A951] md:text-[11px]">Tentang</p>
          <h1 className="font-display mt-5 max-w-5xl text-[2rem] font-normal leading-[1.08] tracking-[-0.03em] text-[#F4F1EA] sm:text-[2.4rem] md:text-7xl">
            Executive Profile
          </h1>
          <div className="mt-8 max-w-4xl space-y-5 text-base leading-[1.75] text-white/64 sm:text-lg md:text-xl">
            <p>
              Saya adalah desainer interior dengan <span className="text-[#C8A951]">15+ tahun pengalaman</span> dalam merancang
              ruang residensial, hospitality, dan workspace. Fokus saya bukan hanya menghasilkan visual yang menarik, tetapi
              membantu klien dan perusahaan mengambil keputusan desain yang jelas, efisien, dan siap dieksekusi.
            </p>
            <p>
              Saya terbiasa membaca kebutuhan ruang, menyusun arah desain, mengembangkan konsep menjadi keputusan teknis,
              serta menjembatani bahasa desain dengan tujuan bisnis dan operasional.
            </p>
          </div>
          <Button href="/mulai-project" className="mt-10 px-8">
            Diskusikan Project Anda
          </Button>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#090909] px-5 py-16 md:px-10 md:py-24 lg:px-16 lg:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(200,169,81,0.06),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl">
          <h2 className="font-display text-4xl font-normal leading-[1.1] tracking-[-0.03em] md:text-6xl">Core Expertise</h2>
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {coreExpertise.map((item, index) => (
              <article key={item.title} className="border border-white/10 bg-white/[0.02] p-8 md:p-10">
                <span className="font-mono text-xs font-black uppercase tracking-[0.28em] text-white/45">0{index + 1}</span>
                <h3 className="font-display mt-6 text-3xl font-normal leading-[1.08] tracking-[-0.02em] text-white/90">{item.title}</h3>
                <p className="mt-5 text-base leading-[1.75] text-white/62">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#0B0B0A] px-5 py-16 md:px-10 md:py-24 lg:px-16 lg:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_10%,rgba(200,169,81,0.07),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#C8A951] md:text-[11px]">Trust Signals</p>
          <h2 className="font-display mt-5 max-w-5xl text-4xl font-normal leading-[1.08] tracking-[-0.03em] text-[#F4F1EA] md:text-6xl">
            Kepercayaan yang Dibangun dari Pengalaman
          </h2>
          <p className="mt-7 max-w-4xl text-base leading-[1.75] text-white/64 md:text-lg">
            Tanpa mengandalkan klaim berlebihan, nilai kerja saya dibangun dari pengalaman membaca ruang, memahami kebutuhan
            pengguna, dan menjaga keputusan desain tetap relevan dengan tujuan proyek.
          </p>

          <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {trustSignals.map((item) => (
              <article key={item.title} className="border border-white/12 bg-white/[0.02] p-6 shadow-[inset_0_1px_0_rgba(200,169,81,0.2)] md:p-7">
                <h3 className="font-display text-3xl font-normal leading-[1.1] tracking-[-0.02em] text-white/92">{item.title}</h3>
                <p className="mt-4 text-base leading-[1.75] text-white/62">{item.description}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 border border-[#C8A951]/25 bg-[#C8A951]/[0.05] p-6 md:p-8">
            <h3 className="font-display text-3xl font-normal leading-[1.1] tracking-[-0.02em] text-[#F4F1EA]">Bukti Nilai Kerja</h3>
            <ul className="mt-6 grid gap-3 md:grid-cols-2">
              {proofOfValue.map((item) => (
                <li key={item} className="border border-white/10 bg-black/25 px-4 py-3 text-sm leading-[1.75] text-white/78 md:text-base">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#2D2D2B] px-5 py-16 md:px-10 md:py-24 lg:px-16 lg:py-28">
        <div className="relative mx-auto max-w-7xl">
          <h2 className="font-display text-4xl font-normal leading-[1.1] tracking-[-0.03em] text-[#F4F1EA] md:text-6xl">
            Nilai Profesional yang Saya Bawa
          </h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {professionalValue.map((item) => (
              <article key={item.title} className="border border-white/12 bg-white/[0.02] p-6 md:p-7">
                <h3 className="font-display text-2xl font-normal leading-[1.15] tracking-[-0.02em] text-white/90">{item.title}</h3>
                <p className="mt-4 text-base leading-[1.75] text-white/64">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#090909] px-5 py-16 md:px-10 md:py-24 lg:px-16 lg:py-28">
        <div className="relative mx-auto max-w-7xl">
          <h2 className="font-display text-4xl font-normal leading-[1.1] tracking-[-0.03em] text-[#F4F1EA] md:text-6xl">Cara Saya Bekerja</h2>
          <div className="mt-10 space-y-4">
            {howIWork.map((item, index) => (
              <article key={item.title} className="grid gap-4 border border-white/10 bg-white/[0.02] p-6 md:grid-cols-[220px_1fr] md:items-center md:gap-8 md:p-7">
                <p className="font-mono text-xs font-black uppercase tracking-[0.24em] text-[#C8A951]">0{index + 1}</p>
                <div>
                  <h3 className="font-display text-3xl font-normal leading-[1.1] tracking-[-0.02em] text-white/90">{item.title}</h3>
                  <p className="mt-3 text-base leading-[1.75] text-white/62">{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden px-5 py-16 md:px-10 md:py-24 lg:px-16 lg:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_16%,rgba(200,169,81,0.06),transparent_30%)]" />
        <div className="relative mx-auto max-w-7xl">
          <h2 className="font-display text-4xl font-normal leading-[1.1] tracking-[-0.03em] text-[#F4F1EA] md:text-6xl">Capability Snapshot</h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {capabilitySnapshot.map((item) => (
              <div key={item} className="border border-white/10 bg-white/[0.02] px-5 py-6 text-base leading-[1.6] text-white/80">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#090909] px-5 py-16 md:px-10 md:py-24 lg:px-16 lg:py-28">
        <div className="relative mx-auto max-w-7xl">
          <h2 className="font-display text-4xl font-normal leading-[1.1] tracking-[-0.03em] text-[#F4F1EA] md:text-6xl">Diferensiasi Senior</h2>
          <ul className="mt-10 grid gap-4">
            {diferensiasiSenior.map((item) => (
              <li key={item} className="border border-[#C8A951]/25 bg-[#C8A951]/[0.06] p-6 text-base leading-[1.75] text-white/66 md:text-lg">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#090909] px-5 py-16 md:px-10 md:py-24 lg:px-16 lg:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(200,169,81,0.06),transparent_34%)]" />
        <div className="relative mx-auto max-w-5xl text-center">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#C8A951] md:text-[11px]">Kolaborasi</p>
          <h2 className="font-display mt-5 text-4xl font-normal leading-[1.08] tracking-[-0.03em] text-[#F4F1EA] md:text-6xl">
            Siap membangun ruang yang lebih terarah dan berdampak?
          </h2>
          <p className="mx-auto mt-6 max-w-3xl text-base leading-[1.75] text-white/62 md:text-lg">
            Jika perusahaan atau project Anda membutuhkan partner desain yang mampu membaca konteks, menyusun arah, dan
            menjaga keputusan tetap terukur, mari mulai diskusinya.
          </p>
          <Button href="/mulai-project" className="mt-10 px-8">
            Hubungi Saya
          </Button>
        </div>
      </section>
    </main>
  );
}
