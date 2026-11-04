import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, Info } from "lucide-react";
import ContextualBackButton from "@/components/contextual-back-button";
import ServiceFeeEstimator from "@/components/service-fee-estimator";
import TrackedLink from "@/components/tracked-link";
import { servicePackages } from "@/lib/service-packages";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Paket Jasa Desain Interior & Arsitektur | Eryawan Agung",
  description:
    "Lihat paket jasa desain interior dan arsitektur rumah Eryawan Agung, lingkup pekerjaan, tarif per m², minimum biaya, dan estimasi biaya awal.",
  alternates: { canonical: absoluteUrl("/layanan") },
  openGraph: {
    title: "Paket Jasa Desain Interior & Arsitektur | Eryawan Agung",
    description:
      "Pilihan paket desain interior dan arsitektur rumah dengan lingkup, tarif, minimum biaya, dan estimasi awal yang transparan.",
    url: absoluteUrl("/layanan"),
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "Paket jasa desain Eryawan Agung",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Paket Jasa Desain Interior & Arsitektur | Eryawan Agung",
    description:
      "Pilihan paket desain interior dan arsitektur rumah dengan lingkup, tarif, minimum biaya, dan estimasi awal yang transparan.",
    images: [absoluteUrl("/opengraph-image")],
  },
};

const currencyFormatter = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

export default function LayananPage() {
  return (
    <main
      id="main-content"
      className="min-h-screen overflow-x-clip bg-[#080807] px-4 py-10 font-sans text-[#F4F1EA] sm:px-6 md:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <ContextualBackButton
          fallbackHref="/"
          className="inline-flex min-h-10 items-center rounded-full border border-white/15 bg-white/[0.02] px-4 py-2 text-xs font-semibold tracking-[0.1em] text-white/72 transition hover:border-[#D4AF37]/45 hover:text-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807]"
          ariaLabel="Kembali dari halaman layanan"
        />

        <section className="mt-7 overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_88%_12%,rgba(212,175,55,0.12),transparent_34%),linear-gradient(135deg,#11100c,#0b0b0a_56%,#090908)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.28)] sm:p-8 md:p-12">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.32em] text-[#D4AF37] sm:text-[11px]">
            Jasa Desain Eryawan Agung
          </p>
          <h1 className="font-display mt-5 max-w-4xl text-4xl font-normal leading-[1.08] tracking-[-0.035em] text-[#F6F1E8] sm:text-5xl md:text-6xl">
            Pilih lingkup desain yang sesuai dengan kebutuhan ruang Anda.
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
            Empat pilihan layanan untuk kebutuhan konsep interior, visualisasi
            3D, desain interior lengkap, hingga desain arsitektur rumah. Setiap
            paket memiliki lingkup dan batas keluaran yang dijelaskan sejak
            awal agar ekspektasi proyek lebih jelas.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <TrackedLink
              href="#paket"
              eventName="cta_click"
              eventProps={{
                source: "layanan_page",
                label: "lihat_paket_jasa",
                href_type: "internal",
              }}
              data-cta="layanan-view-packages"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#D4AF37] bg-[#D4AF37] px-6 py-3 text-center font-mono text-[11px] font-black uppercase tracking-[0.12em] text-[#080807] transition hover:bg-[#E2C866] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807]"
            >
              Lihat Paket Jasa <ArrowRight size={16} aria-hidden="true" />
            </TrackedLink>
            <TrackedLink
              href="/mulai-project"
              eventName="cta_click"
              eventProps={{
                source: "layanan_page",
                label: "mulai_brief_proyek",
                href_type: "internal",
              }}
              data-cta="layanan-start-project"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.02] px-6 py-3 text-center font-mono text-[11px] font-black uppercase tracking-[0.12em] text-white/80 transition hover:border-[#D4AF37]/40 hover:text-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807]"
            >
              Mulai Brief Proyek
            </TrackedLink>
          </div>
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/[0.055] p-4 sm:p-5">
            <Info className="mt-0.5 shrink-0 text-[#D4AF37]" size={19} aria-hidden="true" />
            <p className="text-sm leading-7 text-white/70">
              <span className="font-semibold text-[#F4F1EA]">Cara menghitung biaya:</span>{" "}
              biaya jasa dihitung dari luas area dikalikan tarif paket, atau
              minimum biaya paket—dipilih nilai yang lebih besar. Luas dan
              lingkup final dikonfirmasi dalam penawaran tertulis.
            </p>
          </div>
        </section>

        <section id="paket" aria-labelledby="paket-title" className="mt-12 scroll-mt-6 sm:mt-16">
          <div className="max-w-3xl">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#D4AF37]">
              Pilihan Layanan
            </p>
            <h2 id="paket-title" className="font-display mt-3 text-3xl leading-tight tracking-[-0.025em] text-[#F4F1EA] sm:text-4xl">
              Empat paket, lingkup yang jelas.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/58 sm:text-base">
              Pilih berdasarkan keluaran yang Anda butuhkan. Jika masih ragu,
              kirim brief awal agar kebutuhan dan lingkupnya bisa dibahas
              sebelum penawaran disepakati.
            </p>
          </div>

          <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {servicePackages.map((item) => (
              <article
                key={item.id}
                className="flex min-w-0 flex-col rounded-[24px] border border-white/10 bg-gradient-to-b from-[#12110e] to-[#0b0b0a] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.18)] sm:p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-[#D4AF37]">
                    {item.option}
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/[0.025] px-2.5 py-1 text-[10px] font-semibold text-white/52">
                    {item.label}
                  </span>
                </div>
                <h3 className="font-display mt-5 min-h-[3.4rem] text-2xl leading-[1.2] text-[#F4F1E8]">
                  {item.title}
                </h3>
                <p className="mt-3 min-h-[6.5rem] text-sm leading-6 text-white/55">
                  {item.description}
                </p>
                <div className="mt-5 border-y border-white/10 py-4">
                  <p className="font-display text-3xl leading-tight text-[#F4F1E8]">
                    {currencyFormatter.format(item.rate)}
                    <span className="ml-1 font-sans text-sm font-normal text-white/48">/m²</span>
                  </p>
                  <p className="mt-2 text-xs leading-5 text-white/50">
                    Minimum biaya:{" "}
                    <span className="font-semibold text-white/78">
                      {currencyFormatter.format(item.minimumFee)}
                    </span>
                  </p>
                </div>
                <div className="mt-5">
                  <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-white/78">
                    Termasuk
                  </h4>
                  <ul className="mt-3 space-y-2.5">
                    {item.deliverables.map((deliverable) => (
                      <li key={deliverable} className="flex items-start gap-2.5 text-sm leading-6 text-white/72">
                        <CheckCircle2 size={16} className="mt-1 shrink-0 text-[#D4AF37]" aria-hidden="true" />
                        <span>{deliverable}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-5">
                  <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-white/55">
                    Catatan lingkup
                  </h4>
                  <ul className="mt-3 space-y-2 text-xs leading-6 text-white/48">
                    {item.exclusions.map((exclusion) => (
                      <li key={exclusion}>{exclusion}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-auto pt-6">
                  <TrackedLink
                    href={`/mulai-project?paket=${item.id}`}
                    eventName="cta_click"
                    eventProps={{
                      source: "layanan_page",
                      label: `${item.id}_diskusikan_paket`,
                      content_type: "service_package",
                      href_type: "internal",
                    }}
                    data-cta={`layanan-${item.id}-cta`}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/[0.06] px-4 py-3 text-center text-xs font-bold text-[#D4AF37] transition hover:border-[#D4AF37]/70 hover:bg-[#D4AF37]/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b0b0a]"
                    aria-label={`Diskusikan ${item.option}: ${item.title}`}
                  >
                    Diskusikan Paket <ArrowRight size={15} aria-hidden="true" />
                  </TrackedLink>
                  <p className="mt-2 text-center text-[10px] leading-5 text-white/35">
                    Lingkup final dikonfirmasi dalam penawaran.
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <ServiceFeeEstimator />

        <section aria-labelledby="ketentuan-ringkas-title" className="mt-12 sm:mt-16">
          <div className="max-w-3xl">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#D4AF37]">
              Sebelum Memulai
            </p>
            <h2 id="ketentuan-ringkas-title" className="font-display mt-3 text-3xl leading-tight tracking-[-0.025em] text-[#F4F1EA] sm:text-4xl">
              Ketentuan penting secara ringkas.
            </h2>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-white/88">Pembayaran dan revisi</h3>
              <p className="mt-3 text-sm leading-7 text-white/60">
                Pembayaran dilakukan bertahap: 50% uang muka sebelum pekerjaan
                dimulai, 30% saat presentasi progres, dan 20% sebelum hasil
                final diserahkan. Setiap paket mencakup maksimal dua putaran
                revisi dalam lingkup yang telah disepakati.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-white/88">Render dan perubahan tambahan</h3>
              <p className="mt-3 text-sm leading-7 text-white/60">
                Opsi 2–4 mencakup maksimal 10 view render; jumlah aktual
                mengikuti kebutuhan dan kompleksitas proyek. Render tambahan
                dikenakan Rp300.000 per view apabila menggunakan model yang
                sudah ada tanpa pemodelan atau perubahan besar. Perubahan
                lingkup besar ditawarkan terpisah.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-white/88">Survei dan pelaksanaan</h3>
              <p className="mt-3 text-sm leading-7 text-white/60">
                Survei dan pengukuran lapangan ditentukan berdasarkan lokasi
                serta kesepakatan setiap proyek. Pembelian material,
                pelaksanaan konstruksi, dan pengawasan tidak otomatis termasuk
                dalam paket jasa desain.
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 sm:p-6">
              <h3 className="text-sm font-semibold text-white/88">Format file hasil</h3>
              <p className="mt-3 text-sm leading-7 text-white/60">
                Gambar kerja Opsi 3 dan 4 diserahkan dalam format PDF. File
                sumber SketchUp (.skp) dan SketchUp LayOut (.layout) tidak
                termasuk paket standar; file AutoCAD (.dwg/.dxf) tidak
                disediakan.
              </p>
            </article>
          </div>
          <p className="mt-5 text-xs leading-6 text-white/42">
            Rincian lengkap, jadwal, lingkup keluaran, dan kesepakatan khusus
            dicantumkan dalam penawaran tertulis sebelum pekerjaan dimulai.
          </p>
        </section>

        <section className="mt-12 overflow-hidden rounded-3xl border border-[#D4AF37]/22 bg-[radial-gradient(circle_at_90%_20%,rgba(212,175,55,0.09),transparent_36%),#0d0d0b] p-6 sm:mt-16 sm:p-8 md:p-10">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div className="max-w-3xl">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.26em] text-[#D4AF37]">
                Langkah Berikutnya
              </p>
              <h2 className="font-display mt-3 text-3xl leading-tight text-[#F4F1E8] sm:text-4xl">
                Masih menentukan paket yang paling sesuai?
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/60 sm:text-base">
                Kirim brief awal tentang ruang, lokasi, luas, dan tujuan proyek.
                Lingkup layanan dapat dibahas terlebih dahulu sebelum penawaran
                disepakati.
              </p>
            </div>
            <TrackedLink
              href="/mulai-project"
              eventName="cta_click"
              eventProps={{
                source: "layanan_page",
                label: "mulai_brief_bawah",
                href_type: "internal",
              }}
              data-cta="layanan-bottom-brief"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#D4AF37] bg-[#D4AF37] px-6 py-3 text-center font-mono text-[11px] font-black uppercase tracking-[0.12em] text-[#080807] transition hover:bg-[#E2C866] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807]"
            >
              Mulai Brief Proyek <ArrowRight size={16} aria-hidden="true" />
            </TrackedLink>
          </div>
        </section>
      </div>
    </main>
  );
}
