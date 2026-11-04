import type { Metadata } from "next";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  Clock3,
  Copyright,
  FileText,
  MapPinned,
  RefreshCw,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import ContextualBackButton from "@/components/contextual-back-button";
import TrackedLink from "@/components/tracked-link";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Ketentuan Layanan Desain | Eryawan Agung",
  description:
    "Ketentuan umum jasa desain interior dan arsitektur Eryawan Agung, mencakup pembayaran, revisi, lingkup pekerjaan, hasil akhir, hak penggunaan, dan kerahasiaan klien.",
  alternates: { canonical: absoluteUrl("/ketentuan-layanan") },
  openGraph: {
    title: "Ketentuan Layanan Desain | Eryawan Agung",
    description:
      "Pahami alur kerja, pembayaran, revisi, keluaran, dan ketentuan umum sebelum memulai proyek desain bersama Eryawan Agung.",
    url: absoluteUrl("/ketentuan-layanan"),
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "Ketentuan layanan desain Eryawan Agung",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ketentuan Layanan Desain | Eryawan Agung",
    description:
      "Ketentuan umum jasa desain interior dan arsitektur Eryawan Agung.",
    images: [absoluteUrl("/opengraph-image")],
  },
};

const termsSections = [
  {
    number: "01",
    title: "Lingkup pekerjaan dan penawaran",
    icon: ClipboardList,
    paragraphs: [
      "Setiap proyek mengikuti paket, luas area, daftar keluaran, biaya, jadwal, dan batas pekerjaan yang tercantum dalam penawaran tertulis yang disetujui kedua pihak. Estimasi pada halaman layanan merupakan perkiraan awal, bukan penawaran final.",
      "Pekerjaan dimulai setelah uang muka diterima dan informasi awal yang diperlukan tersedia. Pekerjaan di luar lingkup yang disepakati tidak otomatis termasuk dalam biaya paket.",
    ],
    bullets: [
      "Perubahan kebutuhan atau keluaran sebaiknya disepakati secara tertulis sebelum dikerjakan.",
      "Jika terdapat perbedaan antara ketentuan umum halaman ini dan penawaran khusus proyek yang telah disetujui, penawaran atau perjanjian khusus tersebut menjadi acuan untuk proyek terkait.",
    ],
  },
  {
    number: "02",
    title: "Pembayaran",
    icon: Wallet,
    paragraphs: [
      "Skema pembayaran standar dibagi menjadi tiga tahap: 50% uang muka sebelum pekerjaan dimulai, 30% setelah presentasi progres, dan 20% sebelum hasil akhir diserahkan.",
      "Hasil final beresolusi penuh dan gambar kerja final diserahkan setelah seluruh pembayaran dilunasi. Jika pembayaran atau persetujuan tertunda, jadwal pengerjaan dapat menyesuaikan.",
    ],
    bullets: [
      "Rincian nilai dan waktu pembayaran dicantumkan dalam penawaran proyek.",
      "Biaya tambahan hanya dikerjakan setelah lingkup dan biayanya dikonfirmasi terlebih dahulu.",
    ],
  },
  {
    number: "03",
    title: "Revisi dan persetujuan desain",
    icon: RefreshCw,
    paragraphs: [
      "Setiap paket mencakup maksimal dua putaran revisi dalam lingkup yang telah disepakati. Satu putaran berarti satu kumpulan masukan yang disampaikan secara terpadu, bukan pesan terpisah yang datang bertahap.",
      "Koreksi untuk memperbaiki kesalahan pengerjaan dari pihak desainer tidak mengurangi jatah revisi. Perubahan preferensi atau arahan baru setelah desain disetujui dapat diperlakukan sebagai revisi atau pekerjaan tambahan apabila memengaruhi tahap yang telah diselesaikan.",
    ],
    bullets: [
      "Revisi di luar dua putaran yang termasuk paket dikenakan biaya 5% dari nilai jasa yang disepakati per putaran, dengan minimum Rp300.000 per putaran.",
      "Sampaikan masukan secara jelas dan terpadu agar proses revisi lebih efisien.",
    ],
  },
  {
    number: "04",
    title: "Render tambahan dan perubahan lingkup",
    icon: FileText,
    paragraphs: [
      "Opsi 2–4 mencakup maksimal 10 view render sesuai lingkup paket. Render tambahan dikenakan Rp300.000 per view apabila menggunakan model yang sudah tersedia dan tidak memerlukan pemodelan ulang atau perubahan desain besar.",
      "Penambahan area atau ruang, perubahan konsep yang berdampak besar, pemodelan baru, keluaran tambahan, atau pekerjaan lain di luar lingkup awal akan dinilai dan ditawarkan terpisah sebelum dikerjakan.",
    ],
    bullets: [
      "Jumlah, sudut pandang, dan kebutuhan render dikonfirmasi mengikuti kompleksitas proyek.",
      "Biaya serta kemungkinan perubahan jadwal untuk pekerjaan tambahan disepakati terlebih dahulu.",
    ],
  },
  {
    number: "05",
    title: "Survei, pengukuran, dan pelaksanaan",
    icon: MapPinned,
    paragraphs: [
      "Survei dan pengukuran lapangan ditentukan berdasarkan lokasi serta kesepakatan proyek. Kebutuhan kunjungan, biaya perjalanan, dan tanggung jawab penyediaan data lapangan dijelaskan dalam penawaran apabila relevan.",
      "Jasa desain tidak otomatis mencakup pembelian material, pelaksanaan konstruksi, pengawasan lapangan, pengurusan izin, atau jasa konsultan struktur dan mekanikal-elektrikal-plumbing (MEP), kecuali disebutkan secara tertulis.",
    ],
    bullets: [
      "Klien perlu menyampaikan ukuran, kondisi lokasi, referensi, dan kebutuhan proyek secara akurat sejauh informasi tersebut tersedia.",
      "Ukuran dan kondisi aktual lokasi perlu diverifikasi sebelum pelaksanaan oleh pihak pelaksana terkait.",
    ],
  },
  {
    number: "06",
    title: "Jadwal dan komunikasi",
    icon: Clock3,
    paragraphs: [
      "Target waktu pengerjaan mengikuti jadwal yang disepakati dalam penawaran. Waktu mulai dan progres dapat bergeser jika data, keputusan, persetujuan, atau pembayaran yang diperlukan belum diterima.",
      "Apabila proyek perlu dijeda atau dijadwalkan ulang, kedua pihak akan mengonfirmasi rencana kelanjutan secara tertulis dengan mempertimbangkan progres dan ketersediaan jadwal.",
    ],
    bullets: [
      "Perubahan jadwal akibat perubahan lingkup dibahas bersama sebelum pekerjaan tambahan dilanjutkan.",
      "Informasi penting terkait lingkup, persetujuan, dan biaya sebaiknya dikonfirmasi melalui komunikasi tertulis.",
    ],
  },
  {
    number: "07",
    title: "Format dan penyerahan file",
    icon: FileText,
    paragraphs: [
      "Format keluaran mengikuti paket yang dipilih dan penawaran proyek. Untuk Opsi 3 dan Opsi 4, gambar kerja final diserahkan dalam format PDF sesuai lingkup yang disepakati.",
      "File sumber SketchUp (.skp) dan SketchUp LayOut (.layout) tidak termasuk dalam paket standar. File AutoCAD (.dwg/.dxf) tidak disediakan, kecuali ada kesepakatan tertulis khusus yang menyatakan lain.",
    ],
    bullets: [
      "File kerja, draf, dan berkas antara bukan keluaran final kecuali secara khusus disepakati.",
      "Penyerahan file sumber atau format lain, bila memungkinkan, harus disepakati terpisah sebelum pekerjaan dimulai.",
    ],
  },
  {
    number: "08",
    title: "Hak cipta dan penggunaan hasil desain",
    icon: Copyright,
    paragraphs: [
      "Hak cipta atas karya, konsep, dan materi desain tetap berada pada perancang kecuali disepakati lain secara tertulis. Setelah pembayaran lunas, klien memperoleh hak untuk menggunakan keluaran final pada proyek dan lokasi yang tercantum dalam penawaran.",
      "Penggunaan ulang untuk proyek atau lokasi lain, penjualan kembali, distribusi kepada pihak lain untuk penggunaan di luar proyek, atau pengubahan dan penerbitan ulang desain di luar lingkup yang disepakati memerlukan persetujuan tertulis terlebih dahulu.",
    ],
    bullets: [
      "File sumber tidak otomatis menjadi bagian dari hak penggunaan keluaran final.",
      "Ketentuan khusus mengenai pengalihan hak atau penggunaan lain harus dicantumkan secara tertulis.",
    ],
  },
  {
    number: "09",
    title: "Portofolio dan kerahasiaan klien",
    icon: ShieldCheck,
    paragraphs: [
      "Sebagai ketentuan umum, hasil desain dapat ditampilkan dalam portofolio, situs web, atau media profesional Eryawan Agung untuk menunjukkan pengalaman dan kualitas pekerjaan.",
      "Nama klien, alamat properti, dan identitas pribadi yang bersifat privat tidak akan dicantumkan tanpa persetujuan terpisah. Jika proyek memerlukan kerahasiaan atau tidak boleh dipublikasikan, permintaan tersebut harus disampaikan secara tertulis sebelum penawaran atau perjanjian diterima dan disetujui secara tertulis.",
    ],
    bullets: [
      "Batas kerahasiaan, materi yang boleh ditampilkan, dan waktu publikasi dapat disepakati khusus untuk proyek terkait.",
      "Persetujuan publikasi identitas klien berbeda dari izin untuk menampilkan hasil desain secara umum.",
    ],
  },
  {
    number: "10",
    title: "Pembatalan atau penghentian proyek",
    icon: CircleAlert,
    paragraphs: [
      "Permintaan untuk membatalkan, menghentikan, atau menjeda proyek disampaikan secara tertulis agar progres dan kewajiban kedua pihak dapat ditinjau dengan jelas.",
      "Jika proyek dihentikan, perhitungan dilakukan berdasarkan pekerjaan yang telah dikerjakan sampai tanggal penghentian serta biaya yang sebelumnya telah disetujui atau sudah terlanjur timbul. Sisa pembayaran atau pengembalian dana, jika ada, disepakati dan dicatat secara tertulis dengan mempertimbangkan progres tersebut.",
    ],
    bullets: [
      "Pekerjaan tambahan yang belum disetujui tidak seharusnya dimulai.",
      "Jika proyek akan dilanjutkan setelah jeda, jadwal dan kebutuhan biaya yang berubah dikonfirmasi kembali.",
    ],
  },
] as const;

export default function KetentuanLayananPage() {
  return (
    <main
      id="main-content"
      className="min-h-screen overflow-x-clip bg-[#080807] px-4 py-10 font-sans text-[#F4F1EA] sm:px-6 md:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <ContextualBackButton
          fallbackHref="/layanan"
          className="inline-flex min-h-10 items-center rounded-full border border-white/15 bg-white/[0.02] px-4 py-2 text-xs font-semibold tracking-[0.1em] text-white/72 transition hover:border-[#D4AF37]/45 hover:text-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807]"
          ariaLabel="Kembali dari halaman ketentuan layanan"
        />

        <section className="mt-7 overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_88%_12%,rgba(212,175,55,0.12),transparent_34%),linear-gradient(135deg,#11100c,#0b0b0a_56%,#090908)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.28)] sm:p-8 md:p-12">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.32em] text-[#D4AF37] sm:text-[11px]">
            Ketentuan Kerja · Eryawan Agung
          </p>
          <h1 className="font-display mt-5 max-w-4xl text-4xl font-normal leading-[1.08] tracking-[-0.035em] text-[#F6F1E8] sm:text-5xl md:text-6xl">
            Kesepakatan yang jelas membuat proses desain lebih nyaman.
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
            Halaman ini menjelaskan dasar kerja sama untuk layanan desain
            interior dan arsitektur. Tujuannya agar lingkup, pembayaran,
            revisi, hasil akhir, dan tanggung jawab masing-masing pihak lebih
            mudah dipahami sejak awal.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <TrackedLink
              href="/layanan"
              eventName="cta_click"
              eventProps={{
                source: "ketentuan_layanan_page",
                label: "lihat_paket_jasa",
                href_type: "internal",
              }}
              data-cta="terms-view-services"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-[#D4AF37] bg-[#D4AF37] px-6 py-3 text-center font-mono text-[11px] font-black uppercase tracking-[0.12em] text-[#080807] transition hover:bg-[#E2C866] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807]"
            >
              Lihat Paket Jasa <ArrowRight size={16} aria-hidden="true" />
            </TrackedLink>
            <TrackedLink
              href="/mulai-project"
              eventName="cta_click"
              eventProps={{
                source: "ketentuan_layanan_page",
                label: "mulai_brief_proyek",
                href_type: "internal",
              }}
              data-cta="terms-start-project"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.02] px-6 py-3 text-center font-mono text-[11px] font-black uppercase tracking-[0.12em] text-white/80 transition hover:border-[#D4AF37]/40 hover:text-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807]"
            >
              Mulai Brief Proyek
            </TrackedLink>
          </div>

          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/[0.055] p-4 sm:p-5">
            <CheckCircle2 className="mt-0.5 shrink-0 text-[#D4AF37]" size={19} aria-hidden="true" />
            <p className="text-sm leading-7 text-white/70">
              <span className="font-semibold text-[#F4F1EA]">Acuan utama:</span>{" "}
              rincian final selalu dikonfirmasi melalui penawaran atau
              perjanjian tertulis yang disetujui sebelum pekerjaan dimulai.
              Ketentuan khusus pada dokumen proyek yang disetujui menjadi
              acuan untuk proyek tersebut.
            </p>
          </div>
        </section>

        <section aria-labelledby="ringkasan-title" className="mt-12 sm:mt-16">
          <div className="max-w-3xl">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#D4AF37]">
              Ringkasan Utama
            </p>
            <h2 id="ringkasan-title" className="font-display mt-3 text-3xl leading-tight tracking-[-0.025em] text-[#F4F1EA] sm:text-4xl">
              Hal yang perlu diketahui sebelum mulai.
            </h2>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Pembayaran bertahap",
                detail: "50% uang muka · 30% saat progres · 20% sebelum hasil final.",
              },
              {
                title: "Dua putaran revisi",
                detail: "Masukan disampaikan terpadu; koreksi kesalahan desainer tidak mengurangi jatah.",
              },
              {
                title: "Biaya tambahan transparan",
                detail: "Pekerjaan di luar lingkup dikonfirmasi biayanya sebelum dikerjakan.",
              },
              {
                title: "File final setelah lunas",
                detail: "Keluaran final diserahkan sesuai paket dan penawaran yang disepakati.",
              },
            ].map((item) => (
              <article key={item.title} className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#12110e] to-[#0b0b0a] p-5">
                <h3 className="text-sm font-semibold leading-6 text-[#F4F1E8]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/55">{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="detail-title" className="mt-12 sm:mt-16">
          <div className="max-w-3xl">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#D4AF37]">
              Ketentuan Lengkap
            </p>
            <h2 id="detail-title" className="font-display mt-3 text-3xl leading-tight tracking-[-0.025em] text-[#F4F1EA] sm:text-4xl">
              Rincian proses dan tanggung jawab.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/58 sm:text-base">
              Baca setiap bagian dan pastikan hal yang relevan untuk proyek
              Anda telah tercantum dalam penawaran tertulis.
            </p>
          </div>

          <div className="mt-7 space-y-4">
            {termsSections.map((section) => {
              const Icon = section.icon;
              return (
                <article
                  key={section.number}
                  className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#11100d] to-[#0b0b0a] p-5 sm:p-7 md:p-8"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-[#D4AF37]/25 bg-[#D4AF37]/[0.07] text-[#D4AF37]">
                      <Icon size={20} aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]/75">
                        Bagian {section.number}
                      </p>
                      <h3 className="font-display mt-2 text-2xl leading-tight text-[#F4F1E8] sm:text-3xl">
                        {section.title}
                      </h3>
                      <div className="mt-4 space-y-3 text-sm leading-7 text-white/65 sm:text-base">
                        {section.paragraphs.map((paragraph) => (
                          <p key={paragraph}>{paragraph}</p>
                        ))}
                      </div>
                      <ul className="mt-4 space-y-3">
                        {section.bullets.map((bullet) => (
                          <li key={bullet} className="flex items-start gap-2.5 text-sm leading-6 text-white/65">
                            <CheckCircle2 size={16} className="mt-1 shrink-0 text-[#D4AF37]" aria-hidden="true" />
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-12 overflow-hidden rounded-3xl border border-[#D4AF37]/22 bg-[radial-gradient(circle_at_90%_20%,rgba(212,175,55,0.09),transparent_36%),#0d0d0b] p-6 sm:mt-16 sm:p-8 md:p-10">
          <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
            <div className="max-w-3xl">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.26em] text-[#D4AF37]">
                Langkah Berikutnya
              </p>
              <h2 className="font-display mt-3 text-3xl leading-tight text-[#F4F1E8] sm:text-4xl">
                Siap membahas kebutuhan proyek Anda?
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/60 sm:text-base">
                Kirim brief awal agar kebutuhan, lingkup, dan keluaran yang
                diharapkan dapat dibahas sebelum penawaran disepakati.
              </p>
            </div>
            <TrackedLink
              href="/mulai-project"
              eventName="cta_click"
              eventProps={{
                source: "ketentuan_layanan_page",
                label: "mulai_brief_bawah",
                href_type: "internal",
              }}
              data-cta="terms-bottom-brief"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#D4AF37] bg-[#D4AF37] px-6 py-3 text-center font-mono text-[11px] font-black uppercase tracking-[0.12em] text-[#080807] transition hover:bg-[#E2C866] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807]"
            >
              Mulai Brief Proyek <ArrowRight size={16} aria-hidden="true" />
            </TrackedLink>
          </div>
          <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-6 text-white/40">
            Ketentuan ini adalah panduan kerja umum dan tidak menggantikan
            penawaran atau perjanjian khusus proyek. Terakhir diperbarui:
            4 November 2026.
          </p>
        </section>
      </div>
    </main>
  );
}
