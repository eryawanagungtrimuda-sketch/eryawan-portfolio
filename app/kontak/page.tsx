import type { Metadata } from "next";
import ContextualBackButton from "@/components/contextual-back-button";
import TrackedLink from "@/components/tracked-link";
import { absoluteUrl } from "@/lib/site-url";


export const metadata: Metadata = {
  title: "Kontak | Eryawan Agung",
  description:
    "Hubungi Eryawan Agung untuk diskusi desain interior, arsitektur hunian, kolaborasi, atau percakapan awal tentang kebutuhan ruang.",
  alternates: {
    canonical: absoluteUrl("/kontak"),
  },
  openGraph: {
    title: "Kontak | Eryawan Agung",
    description:
      "Hubungi Eryawan Agung untuk diskusi desain interior, arsitektur hunian, kolaborasi, atau percakapan awal tentang kebutuhan ruang.",
    url: absoluteUrl("/kontak"),
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "Kontak Eryawan Agung untuk interior dan arsitektur hunian",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kontak | Eryawan Agung",
    description:
      "Hubungi Eryawan Agung untuk diskusi desain interior, arsitektur hunian, kolaborasi, atau percakapan awal tentang kebutuhan ruang.",
    images: [absoluteUrl("/opengraph-image")],
  },
};

const contactIntents = [
  "Peluang kerja",
  "Kolaborasi proyek",
  "Diskusi interior & hunian",
  "Ulasan desain",
];

export default function KontakPage() {
  return (
    <main className="min-h-screen overflow-x-clip bg-[#080807] px-4 py-12 font-sans text-[#F4F1EA] sm:px-5 md:px-8 lg:px-12">
      <section className="mx-auto max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#11100c] via-[#0b0b0a] to-[#090908] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)] motion-safe:animate-[fade-in-up_800ms_ease-out_forwards] sm:p-8 md:p-12">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#D4AF37]">
          Hubungi Eryawan Agung
        </p>
        <div className="mt-5 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <h1 className="font-display text-4xl font-normal leading-[1.08] tracking-[-0.03em] md:text-5xl">
              Mulai Percakapan yang Terarah
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/66 md:text-lg">
              Eryawan Agung — Interior & Residential Designer dengan pendekatan
              Decision-Based Design. Terbuka untuk peluang kerja, kolaborasi
              proyek, diskusi desain interior dan arsitektur hunian, serta
              ulasan desain yang membutuhkan
              pembacaan konteks secara jernih.
            </p>
          </div>

          <div className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/[0.06] p-5">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#E3C76C]">
              Email langsung
            </p>
            <TrackedLink
              href="mailto:eryawanagungtrimuda@gmail.com"
              eventName="email_click"
              eventProps={{
                source: "kontak_page",
                label: "email_primary",
                href_type: "email",
              }}
              data-cta="contact-email"
              className="mt-4 inline-flex min-h-11 max-w-full whitespace-normal break-words text-center items-center justify-center rounded-full border border-[#D4AF37] bg-[#D4AF37] px-5 py-3 font-mono text-[11px] font-black uppercase tracking-[0.12em] text-black transition motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:bg-[#E2C866] sm:px-6 sm:text-xs sm:tracking-[0.16em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807]"
              aria-label="Kirim email ke Eryawan Agung"
            >
              Kirim Email
            </TrackedLink>
            <p className="mt-3 max-w-full select-text font-mono text-xs leading-6 text-white/64 [overflow-wrap:anywhere] sm:text-sm md:whitespace-nowrap md:[overflow-wrap:normal]">
              eryawanagungtrimuda@gmail.com
            </p>
            <p className="mt-4 text-sm leading-6 text-white/62">
              Ceritakan konteks singkatnya agar arah pembicaraan lebih jelas
              sejak awal.
            </p>
          </div>
        </div>

        <div
          className="mt-8 flex flex-wrap gap-2.5"
          aria-label="Kebutuhan yang relevan untuk kontak"
        >
          {contactIntents.map((intent) => (
            <span
              key={intent}
              className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-white/72"
            >
              {intent}
            </span>
          ))}
        </div>

        <div className="mt-8 border-t border-white/10 pt-6">
          <p className="max-w-2xl text-sm leading-7 text-white/60">
            Untuk brief yang lebih terstruktur, gunakan halaman mulai
            percakapan. Anda juga dapat meninjau karya dan wawasan terlebih
            dahulu sebelum menghubungi.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 overflow-hidden">
            <TrackedLink
              href="/mulai-project"
              eventName="contact_click"
              eventProps={{
                source: "kontak_page",
                label: "ajukan_kolaborasi",
                href_type: "internal",
              }}
              data-cta="contact-collaboration"
              className="inline-flex min-h-11 max-w-full items-center justify-center whitespace-normal break-words text-center rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-6 py-3 font-mono text-xs font-black uppercase tracking-[0.16em] text-[#D4AF37] transition hover:bg-[#D4AF37]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807]"
              aria-label="Mulai percakapan terstruktur"
            >
              Mulai Percakapan
            </TrackedLink>
            <TrackedLink
              href="/karya"
              eventName="project_view_intent"
              eventProps={{
                source: "kontak_page",
                label: "lihat_karya",
                content_type: "karya",
                href_type: "internal",
              }}
              data-cta="contact-karya"
              className="inline-flex min-h-11 max-w-full items-center justify-center whitespace-normal break-words text-center rounded-full border border-white/14 px-6 py-3 font-mono text-xs font-black uppercase tracking-[0.16em] text-white/66 transition hover:border-[#D4AF37]/40 hover:text-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807]"
              aria-label="Lihat halaman karya"
            >
              Lihat Karya
            </TrackedLink>
            <TrackedLink
              href="/wawasan"
              eventName="cta_click"
              eventProps={{
                source: "kontak_page",
                label: "baca_wawasan",
                href_type: "internal",
              }}
              data-cta="contact-wawasan"
              className="inline-flex min-h-11 max-w-full items-center justify-center whitespace-normal break-words text-center rounded-full border border-white/14 px-6 py-3 font-mono text-xs font-black uppercase tracking-[0.16em] text-white/66 transition hover:border-[#D4AF37]/40 hover:text-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807]"
              aria-label="Baca halaman wawasan"
            >
              Baca Wawasan
            </TrackedLink>
            <ContextualBackButton
              fallbackHref="/"
              className="inline-flex min-h-11 max-w-full items-center justify-center whitespace-normal break-words text-center rounded-full border border-white/14 px-6 py-3 font-mono text-xs font-black uppercase tracking-[0.16em] text-white/66 transition hover:border-[#D4AF37]/40 hover:text-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807]"
              ariaLabel="Kembali dari halaman kontak"
            />
          </div>
        </div>
      </section>
    </main>
  );
}
