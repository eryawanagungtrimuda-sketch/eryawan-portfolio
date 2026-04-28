import { ArrowUpRight, Mail, MapPin, Sparkles } from 'lucide-react';

const projects = [
  {
    title: 'Residential Interior Concept',
    type: 'Interior Design',
    description: 'Konsep ruang tinggal hangat dengan palet natural, pencahayaan lembut, dan material yang mudah dirawat.',
  },
  {
    title: 'Compact Studio Makeover',
    type: 'Space Planning',
    description: 'Optimasi studio kecil agar terasa luas melalui zonasi fungsi, storage tersembunyi, dan focal point visual.',
  },
  {
    title: 'Architectural Moodboard',
    type: 'Visual Direction',
    description: 'Eksplorasi mood, tekstur, dan komposisi untuk membantu klien memahami arah desain sebelum produksi.',
  },
];

const services = ['Architecture Concept', 'Interior Design', '3D Visualization', 'Moodboard & Styling'];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-6 py-8 md:px-10 lg:px-16">
      <nav className="flex items-center justify-between rounded-full border border-ink/10 bg-white/60 px-5 py-3 shadow-sm backdrop-blur">
        <a href="#home" className="text-sm font-semibold tracking-wide">Eryawan.</a>
        <div className="hidden items-center gap-6 text-sm text-ink/70 md:flex">
          <a className="transition hover:text-ink" href="#projects">Projects</a>
          <a className="transition hover:text-ink" href="#services">Services</a>
          <a className="transition hover:text-ink" href="#contact">Contact</a>
        </div>
      </nav>

      <section id="home" className="grid flex-1 items-center gap-10 py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-clay shadow-sm">
            <Sparkles size={16} /> Personal Portfolio
          </span>
          <h1 className="mt-8 max-w-4xl text-5xl font-black leading-[0.95] tracking-tight md:text-7xl">
            Designing calm, functional, and memorable spaces.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/70">
            Saya Eryawan Agung Trimuda. Portfolio ini menampilkan pendekatan desain yang rapi, hangat, dan berfokus pada pengalaman pengguna ruang.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#projects" className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5">
              Lihat Project <ArrowUpRight size={16} />
            </a>
            <a href="mailto:eryawanagungtrimuda@gmail.com" className="inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-white px-6 py-3 text-sm font-semibold transition hover:-translate-y-0.5">
              Hubungi Saya <Mail size={16} />
            </a>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-6 rounded-[3rem] bg-clay/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-[2.5rem] bg-white p-5 shadow-soft">
            <div className="aspect-[4/5] rounded-[2rem] bg-[radial-gradient(circle_at_25%_20%,#fff_0,#f4efe7_35%,#d8b49f_100%)] p-8">
              <div className="flex h-full flex-col justify-between rounded-[1.5rem] border border-white/70 bg-white/35 p-6 backdrop-blur-sm">
                <div className="text-sm font-medium text-ink/60">Selected Work</div>
                <div>
                  <p className="text-3xl font-black leading-tight">Architecture & Interior Design</p>
                  <p className="mt-3 text-sm leading-6 text-ink/65">Clean composition, timeless palette, and practical details for everyday living.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="py-16">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-clay">Projects</p>
            <h2 className="mt-3 text-4xl font-black tracking-tight">Karya Pilihan</h2>
          </div>
          <p className="max-w-xl text-ink/65">Ganti contoh project di bawah ini dengan project asli, gambar, dan studi kasus saat sudah siap.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {projects.map((project) => (
            <article key={project.title} className="rounded-[2rem] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-soft">
              <div className="mb-8 h-48 rounded-[1.5rem] bg-gradient-to-br from-stone-100 to-orange-100" />
              <p className="text-sm font-semibold text-clay">{project.type}</p>
              <h3 className="mt-2 text-2xl font-bold">{project.title}</h3>
              <p className="mt-3 leading-7 text-ink/65">{project.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="services" className="grid gap-6 py-16 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-clay">Services</p>
          <h2 className="mt-3 text-4xl font-black tracking-tight">Yang Bisa Saya Bantu</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {services.map((service) => (
            <div key={service} className="rounded-3xl border border-ink/10 bg-white/70 p-5 font-semibold shadow-sm">{service}</div>
          ))}
        </div>
      </section>

      <section id="contact" className="mb-6 rounded-[2.5rem] bg-ink p-8 text-white md:p-12">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="inline-flex items-center gap-2 text-sm text-white/70"><MapPin size={16} /> Indonesia</p>
            <h2 className="mt-4 max-w-2xl text-4xl font-black tracking-tight md:text-5xl">Punya ide ruang atau project baru?</h2>
          </div>
          <a href="mailto:eryawanagungtrimuda@gmail.com" className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-ink transition hover:-translate-y-0.5">
            Kirim Email <ArrowUpRight size={16} />
          </a>
        </div>
      </section>
    </main>
  );
}
