import type { Metadata } from "next";
import ContextualBackButton from "@/components/contextual-back-button";
import ProjectBriefForm from "@/components/project-brief-form";
import RevealObserver from "@/components/reveal-observer";
import { absoluteUrl } from "@/lib/site-url";
import TrackedLink from "@/components/tracked-link";

export const metadata: Metadata = {
  title: "Mulai Percakapan | Eryawan Agung",
  description:
    "Susun brief awal untuk diskusi desain interior, arsitektur hunian, kolaborasi, atau kebutuhan ruang bersama Eryawan Agung.",
  alternates: {
    canonical: absoluteUrl("/mulai-project"),
  },
  openGraph: {
    title: "Mulai Percakapan | Eryawan Agung",
    description:
      "Susun brief awal untuk diskusi desain interior, arsitektur hunian, kolaborasi, atau kebutuhan ruang bersama Eryawan Agung.",
    url: absoluteUrl("/mulai-project"),
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "Mulai percakapan desain interior dan arsitektur hunian Eryawan Agung",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mulai Percakapan | Eryawan Agung",
    description:
      "Susun brief awal untuk diskusi desain interior, arsitektur hunian, kolaborasi, atau kebutuhan ruang bersama Eryawan Agung.",
    images: [absoluteUrl("/opengraph-image")],
  },
};

const conversationIntents = [
  "Peluang Kerja",
  "Kolaborasi",
  "Proyek Interior",
  "Diskusi Desain",
];

export default function MulaiProjectPage() {
  return (
    <main
      id="main-content"
      className="min-h-screen overflow-x-clip bg-[#080807] px-4 py-10 font-sans text-[#F4F1EA] sm:px-6 md:px-8 lg:px-12"
    >
      <RevealObserver />
      <div className="mx-auto max-w-6xl">
        <ContextualBackButton
          fallbackHref="/"
          className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.02] px-4 py-2 text-xs font-semibold tracking-[0.12em] text-white/72 transition hover:border-[#D4AF37]/45 hover:text-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807]"
          ariaLabel="Kembali dari halaman mulai percakapan"
        />

        <section className="reveal-on-scroll mt-8 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#11100c] via-[#0b0b0a] to-[#090908] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] sm:p-8 lg:p-12">
          <div className="max-w-4xl">
            <p className="font-mono text-[11px] font-black uppercase tracking-[0.34em] text-[#D4AF37]">
              Guided Briefing
            </p>
            <h1 className="font-display mt-5 text-4xl leading-[1.08] tracking-[-0.03em] text-[#F6F1E8] md:text-5xl">
              Mulai Percakapan dengan Eryawan Agung
            </h1>
            <p className="mt-4 text-sm leading-7 text-white/70 sm:text-base sm:leading-8">
              Ceritakan konteks singkatnya agar arah pembicaraan lebih jelas
              sejak awal—baik untuk peluang kerja, kolaborasi proyek, proyek
              interior, maupun diskusi desain yang membutuhkan sudut pandang
              terstruktur.
            </p>
          </div>

          <div
            className="mt-6 flex flex-wrap gap-2.5"
            aria-label="Jenis percakapan yang dapat diajukan"
          >
            {conversationIntents.map((intent) => (
              <span
                key={intent}
                className="rounded-full border border-[#D4AF37]/25 bg-[#D4AF37]/8 px-3 py-1.5 text-xs font-semibold text-[#E7CF83]"
              >
                {intent}
              </span>
            ))}
          </div>

          <div className="mt-7 flex min-w-0 flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-2xl text-sm leading-7 text-white/62">
              Saya akan membaca konteks kebutuhan Anda sebelum merespons, lalu
              percakapan dapat dilanjutkan melalui kanal yang paling nyaman.
            </p>
            <TrackedLink
              href="/kontak"
              eventName="contact_click"
              eventProps={{
                source: "mulai_project_page",
                label: "kontak_email_opsi",
                href_type: "internal",
              }}
              data-cta="mulai-project-contact"
              className="inline-flex min-h-11 max-w-full whitespace-normal break-words text-center items-center justify-center rounded-full border border-[#D4AF37]/55 bg-[#D4AF37]/10 px-5 py-2.5 font-sans text-sm font-semibold text-[#D4AF37] transition motion-safe:duration-300 hover:bg-[#D4AF37]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807]"
              aria-label="Kunjungi halaman kontak untuk opsi email"
            >
              Butuh opsi email? Kunjungi halaman kontak
            </TrackedLink>
          </div>
        </section>

        <ProjectBriefForm />
      </div>
    </main>
  );
}
