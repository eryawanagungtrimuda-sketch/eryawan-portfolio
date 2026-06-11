import type { Metadata } from "next";
import Link from "next/link";
import ContextualBackButton from "@/components/contextual-back-button";
import RevealObserver from "@/components/reveal-observer";
import { getPublishedInsights } from "@/lib/insights";
import WawasanArchive from "@/components/wawasan-archive";
import { absoluteUrl } from "@/lib/site-url";
import PublicJourneyLinks from "@/components/public-journey-links";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Wawasan Desain | Eryawan Agung Design Portfolio",
  description:
    "Explore the detailed design analysis and strategy behind each insight and design review by Eryawan Agung.",
  alternates: { canonical: absoluteUrl("/wawasan") },
  openGraph: {
    title: "Wawasan Desain | Eryawan Agung Design Portfolio",
    description:
      "Explore the detailed design analysis and strategy behind each insight and design review by Eryawan Agung.",
    url: absoluteUrl("/wawasan"),
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "Wawasan Desain Eryawan Agung",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wawasan Desain | Eryawan Agung Design Portfolio",
    description:
      "Explore the detailed design analysis and strategy behind each insight and design review by Eryawan Agung.",
    images: [absoluteUrl("/opengraph-image")],
  },
};

export default async function WawasanPage() {
  const insights = await getPublishedInsights();

  return (
    <main
      id="main-content"
      className="min-h-screen overflow-x-clip bg-[#080807] px-4 py-8 font-sans text-[#F4F1EA] sm:px-5 md:px-8 lg:px-12 lg:py-12"
    >
      <RevealObserver />
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex justify-start md:mb-12">
          <ContextualBackButton
            fallbackHref="/"
            className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-5 py-2.5 font-sans text-sm text-white/66 transition hover:border-white/30 hover:text-white"
          />
        </div>

        <section className="reveal-on-scroll pb-10 md:py-24 lg:py-28">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.52em] text-[#D4AF37] md:text-[11px]">
            Beranda / Jurnal Desain
          </p>
          <h1 className="font-display mt-7 max-w-4xl text-[2.05rem] font-normal leading-[1.04] tracking-[-0.035em] sm:text-[2.4rem] md:text-7xl">
            Arsip Wawasan
          </h1>
          <p className="mt-9 max-w-2xl font-sans text-base leading-[1.8] text-white/62 md:text-xl md:leading-[1.75]">
            Catatan keputusan desain, pembacaan ruang, dan pelajaran interior
            yang dikurasi untuk membantu melihat setiap pilihan ruang secara
            lebih jernih.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/karya"
              className="inline-flex min-h-11 items-center rounded-full border border-[#D4AF37]/50 bg-[#D4AF37]/10 px-5 py-2.5 font-sans text-sm font-semibold text-[#D4AF37] transition motion-safe:duration-500 motion-safe:ease-out motion-safe:hover:-translate-y-0.5 motion-safe:hover:transform-gpu hover:bg-[#D4AF37]/20"
            >
              Lihat Karya
            </Link>
            <Link
              href="/mulai-project"
              className="inline-flex min-h-11 items-center rounded-full border border-white/20 px-5 py-2.5 font-sans text-sm font-semibold text-white/78 transition hover:border-[#D4AF37]/45 hover:text-[#D4AF37]"
            >
              Ajukan Kolaborasi
            </Link>
          </div>
        </section>

        {insights.length === 0 ? (
          <section className="mx-auto mt-2 max-w-6xl">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.025] px-6 py-10 text-center shadow-[0_24px_80px_rgba(0,0,0,0.24)] sm:px-8">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.34em] text-[#D4AF37]">
                Catatan Keputusan Desain
              </p>
              <h2 className="mt-4 font-display text-2xl font-normal tracking-[-0.02em] text-white sm:text-3xl">
                Arsip wawasan sedang dikurasi.
              </h2>
              <p className="mx-auto mt-3 max-w-xl font-sans text-sm leading-7 text-white/58 sm:text-base">
                Beberapa catatan desain sedang disiapkan agar pembaca mendapat
                arsip yang lebih tenang, relevan, dan berguna.
              </p>
              <div className="mt-7 flex flex-wrap justify-center gap-3">
                <Link
                  className="inline-flex min-h-11 items-center rounded-full border border-[#D4AF37]/40 px-5 py-2.5 text-sm font-semibold text-[#D4AF37] hover:bg-[#D4AF37]/10"
                  href="/mulai-project"
                >
                  Mulai Percakapan Proyek
                </Link>
                <Link
                  className="inline-flex min-h-11 items-center rounded-full border border-white/15 px-5 py-2.5 font-sans text-sm font-semibold text-white/66 hover:border-white/30 hover:text-white"
                  href="/karya"
                >
                  Lihat Karya
                </Link>
              </div>
            </div>
          </section>
        ) : (
          <WawasanArchive insights={insights} />
        )}

        <div className="mt-12 pb-28 md:pb-16">
          <PublicJourneyLinks
            links={[
              {
                href: "/karya",
                title: "Lihat Karya",
                description:
                  "Jelajahi studi kasus proyek berbasis keputusan desain.",
              },
              {
                href: "/wawasan",
                title: "Baca Wawasan",
                description:
                  "Pelajari insight strategi ruang dan logika desain.",
                current: true,
                disabled: true,
                badge: "Sedang dibuka",
              },
              {
                href: "/mulai-project",
                title: "Mulai Percakapan Proyek",
                description:
                  "Ajukan brief awal agar diskusi proyek lebih terarah.",
              },
            ]}
          />
          <Link
            href="/"
            className="mt-4 inline-flex font-sans text-sm text-white/62 transition hover:text-[#D4AF37]"
          >
            ← Kembali ke Beranda
          </Link>
        </div>
      </div>
    </main>
  );
}
