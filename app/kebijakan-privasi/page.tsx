import type { Metadata } from "next";
import {
  Activity,
  Database,
  Eye,
  FileText,
  Mail,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import ContextualBackButton from "@/components/contextual-back-button";
import TrackedLink from "@/components/tracked-link";
import { absoluteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Kebijakan Privasi | Eryawan Agung",
  description:
    "Penjelasan tentang informasi yang Anda berikan melalui situs Eryawan Agung, cara penggunaannya, dan cara mengajukan permintaan terkait informasi Anda.",
  alternates: { canonical: absoluteUrl("/kebijakan-privasi") },
  openGraph: {
    title: "Kebijakan Privasi | Eryawan Agung",
    description:
      "Ketahui informasi apa yang digunakan saat mengisi formulir atau mengunjungi situs, serta cara menghubungi kami mengenai informasi Anda.",
    url: absoluteUrl("/kebijakan-privasi"),
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: "Kebijakan Privasi Eryawan Agung",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kebijakan Privasi | Eryawan Agung",
    description:
      "Ketahui informasi apa yang digunakan saat mengisi formulir atau mengunjungi situs, serta cara menghubungi kami mengenai informasi Anda.",
    images: [absoluteUrl("/opengraph-image")],
  },
};

const sections = [
  {
    number: "01",
    title: "Informasi yang Anda berikan",
    icon: UserRound,
    paragraphs: [
      "Informasi yang diminta bergantung pada formulir atau fitur yang Anda gunakan. Berikan hanya informasi yang berkaitan dengan kebutuhan Anda.",
    ],
    bullets: [
      "Formulir proyek: nama, perusahaan atau organisasi jika ada, email atau WhatsApp, jenis kebutuhan, lokasi dan perkiraan luas proyek, tahap proyek, rencana waktu, kisaran anggaran, ketersediaan gambar atau bahan pendukung, serta penjelasan kebutuhan Anda.",
      "Permintaan akses CV: nama, email, perusahaan atau organisasi, jabatan, alasan meminta akses CV, tautan LinkedIn atau situs perusahaan, serta nomor WhatsApp jika Anda memilih mengisinya.",
      "Informasi kunjungan situs: halaman yang dibuka dan informasi umum tentang asal kunjungan, misalnya dari media sosial atau tautan promosi.",
      "Interaksi di situs: informasi tentang tautan atau tombol yang dipilih agar kami memahami bagian situs yang berguna dan perlu ditingkatkan.",
    ],
  },
  {
    number: "02",
    title: "Untuk apa informasi digunakan",
    icon: Eye,
    paragraphs: [
      "Informasi digunakan untuk menanggapi permintaan Anda, memahami kebutuhan proyek, meninjau permintaan akses CV, mengelola komunikasi, menjaga keamanan, dan memperbaiki pengalaman menggunakan situs.",
    ],
    bullets: [
      "Menghubungi Anda mengenai proyek, peluang kerja, kolaborasi, atau permintaan akses CV.",
      "Memahami kebutuhan Anda sebelum membahas langkah berikutnya atau menyiapkan penawaran.",
      "Mengetahui halaman yang bermanfaat dan memahami apakah informasi promosi menjangkau pengunjung.",
      "Menangani kendala dan mencegah penyalahgunaan formulir.",
    ],
  },
  {
    number: "03",
    title: "Bagaimana informasi disimpan",
    icon: Database,
    paragraphs: [
      "Informasi yang Anda kirim melalui formulir disimpan menggunakan layanan yang membantu situs berjalan. Layanan tersebut membantu menyimpan informasi, mengelola situs, memahami kunjungan, dan mengirim pemberitahuan yang diperlukan. Layanan tersebut hanya memproses informasi sejauh diperlukan untuk menjalankan fungsi ini.",
      "Data pribadi Anda tidak dijual atau disewakan untuk keperluan pemasaran pihak lain.",
    ],
    bullets: [
      "Setelah formulir proyek berhasil disimpan, WhatsApp dapat terbuka dengan draf pesan yang sudah disiapkan. Pesan tidak dikirim otomatis. Anda dapat memeriksa, mengubah, atau memilih untuk tidak mengirimkannya.",
      "Jika Anda memilih melanjutkan percakapan di WhatsApp, pesan yang Anda kirim di sana mengikuti kebijakan privasi WhatsApp.",
    ],
  },
  {
    number: "04",
    title: "Informasi kunjungan situs",
    icon: Activity,
    paragraphs: [
      "Situs dapat mencatat halaman yang dikunjungi dan informasi umum tentang asal kunjungan, misalnya dari media sosial atau tautan promosi. Jika Anda datang melalui tautan berparameter UTM, sumber, medium, kampanye, dan konten promosi (jika tersedia) disimpan dalam sesi browser dan dapat dicatat bersama inquiry yang Anda kirim agar efektivitas promosi dapat dievaluasi.",
      "Catatan kunjungan promosi dapat mencakup halaman yang dibuka, asal domain rujukan, dan pengenal sesi acak. Situs tidak menyimpan isi pesan atau data sensitif dari perangkat untuk keperluan atribusi promosi. Informasi tersebut digunakan untuk memahami efektivitas promosi dan dikelola sesuai kebutuhan operasional serta ketentuan penghapusan data yang dijelaskan di halaman ini.",
    ],
  },
  {
    number: "05",
    title: "Kerahasiaan dan pembagian informasi",
    icon: ShieldCheck,
    paragraphs: [
      "Informasi yang Anda berikan digunakan untuk tujuan yang dijelaskan di halaman ini. Jika diperlukan, informasi dapat diproses oleh layanan pendukung untuk menyimpan data, menjalankan situs, memahami kunjungan, atau mengirim pemberitahuan.",
      "Informasi Anda tidak dijual atau disewakan untuk pemasaran pihak lain. Jangan kirim kata sandi, informasi rekening, atau informasi sensitif lain yang tidak diperlukan melalui formulir.",
    ],
    bullets: [
      "Akses informasi dibatasi untuk keperluan menindaklanjuti permintaan atau mengelola situs.",
      "Pastikan Anda memiliki izin sebelum mengirim informasi milik orang lain.",
    ],
  },
  {
    number: "06",
    title: "Berapa lama informasi disimpan",
    icon: FileText,
    paragraphs: [
      "Informasi disimpan selama masih diperlukan untuk menanggapi permintaan, mengelola komunikasi atau proyek, menjaga keamanan, dan memenuhi kewajiban yang berlaku. Lama penyimpanan dapat berbeda sesuai jenis informasi dan kebutuhan.",
      "Jika informasi tidak lagi diperlukan, informasi dapat dihapus atau ditangani sesuai kebutuhan yang wajar. Anda dapat mengirim permintaan penghapusan melalui email yang tercantum di halaman ini.",
    ],
  },
  {
    number: "07",
    title: "Permintaan terkait informasi Anda",
    icon: UserRound,
    paragraphs: [
      "Anda dapat menghubungi saya untuk menanyakan informasi yang pernah Anda kirimkan, memperbaiki informasi yang keliru, atau meminta penghapusan jika memungkinkan.",
      "Permintaan akan ditinjau sesuai kebutuhan dan keamanan. Dalam keadaan tertentu, sebagian catatan mungkin perlu disimpan jika masih diperlukan untuk keperluan yang sah.",
    ],
  },
  {
    number: "08",
    title: "Keamanan dan pembaruan",
    icon: ShieldCheck,
    paragraphs: [
      "Langkah yang wajar dilakukan untuk menjaga informasi Anda. Namun, pengiriman melalui internet dan penyimpanan digital tidak dapat dijamin sepenuhnya bebas dari risiko.",
      "Halaman ini akan diperbarui jika cara pengelolaan informasi berubah. Versi terbaru beserta tanggal pembaruannya akan tersedia di sini.",
    ],
  },
];

export default function KebijakanPrivasiPage() {
  return (
    <main
      id="main-content"
      className="min-h-screen overflow-x-clip bg-[#080807] px-4 py-10 font-sans text-[#F4F1EA] sm:px-6 md:px-8 lg:px-12"
    >
      <div className="mx-auto max-w-7xl">
        <ContextualBackButton
          fallbackHref="/"
          className="inline-flex min-h-10 items-center rounded-full border border-white/15 bg-white/[0.02] px-4 py-2 text-xs font-semibold tracking-[0.1em] text-white/72 transition hover:border-[#D4AF37]/45 hover:text-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807]"
          ariaLabel="Kembali dari halaman kebijakan privasi"
        />

        <section className="mt-7 overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(circle_at_88%_12%,rgba(212,175,55,0.12),transparent_34%),linear-gradient(135deg,#11100c,#0b0b0a_56%,#090908)] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.28)] sm:p-8 md:p-12">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.32em] text-[#D4AF37] sm:text-[11px]">
            Privasi Anda
          </p>
          <h1 className="font-display mt-5 max-w-4xl text-4xl font-normal leading-[1.08] tracking-[-0.035em] text-[#F6F1E8] sm:text-5xl md:text-6xl">
            Data Anda digunakan untuk tujuan yang jelas.
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
            Kebijakan ini menjelaskan informasi yang dapat Anda berikan melalui situs
            Eryawan Agung, alasan penggunaannya, cara pengelolaannya, serta cara
            menghubungi saya terkait informasi Anda.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <TrackedLink
              href="/mulai-project"
              eventName="cta_click"
              eventProps={{
                source: "privacy_policy_page",
                label: "mulai_brief_proyek",
                href_type: "internal",
              }}
              data-cta="privacy-start-project"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[#D4AF37] bg-[#D4AF37] px-6 py-3 text-center font-mono text-[11px] font-black uppercase tracking-[0.12em] text-[#080807] transition hover:bg-[#E2C866] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807]"
            >
              Kembali ke Formulir Proyek
            </TrackedLink>
            <a
              href="mailto:eryawanagungtrimuda@gmail.com?subject=Permintaan%20Terkait%20Data%20Pribadi"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/15 bg-white/[0.02] px-6 py-3 text-center font-mono text-[11px] font-black uppercase tracking-[0.12em] text-white/80 transition hover:border-[#D4AF37]/40 hover:text-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807]"
            >
              Hubungi melalui Email
            </a>
          </div>
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/[0.055] p-4 sm:p-5">
            <ShieldCheck className="mt-0.5 shrink-0 text-[#D4AF37]" size={19} aria-hidden="true" />
            <p className="text-sm leading-7 text-white/70">
              <span className="font-semibold text-[#F4F1EA]">Prinsip utama:</span>{" "}
              informasi hanya digunakan untuk menanggapi permintaan, mengelola komunikasi,
              dan memperbaiki pengalaman menggunakan situs. Jangan kirimkan
              informasi sensitif yang tidak diperlukan melalui formulir.
            </p>
          </div>
        </section>

        <section aria-labelledby="privacy-summary-title" className="mt-12 sm:mt-16">
          <div className="max-w-3xl">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#D4AF37]">
              Ringkasan
            </p>
            <h2 id="privacy-summary-title" className="font-display mt-3 text-3xl leading-tight tracking-[-0.025em] text-[#F4F1EA] sm:text-4xl">
              Apa yang perlu Anda ketahui.
            </h2>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                title: "Data sesuai kebutuhan",
                detail: "Formulir hanya meminta informasi yang relevan dengan permintaan Anda.",
              },
              {
                title: "Tidak dijual",
                detail: "Data tidak dijual atau disewakan untuk pemasaran pihak lain.",
              },
              {
                title: "Untuk menjalankan situs",
                detail: "Sebagian informasi diproses melalui layanan yang membantu menyimpan data, memahami kunjungan, dan mengirim pemberitahuan yang diperlukan.",
              },
              {
                title: "Anda dapat menghubungi",
                detail: "Anda dapat meminta penjelasan, perbaikan, atau penghapusan informasi melalui email.",
              },
            ].map((item) => (
              <article key={item.title} className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#12110e] to-[#0b0b0a] p-5">
                <h3 className="text-sm font-semibold leading-6 text-[#F4F1E8]">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-white/55">{item.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="privacy-detail-title" className="mt-12 sm:mt-16">
          <div className="max-w-3xl">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#D4AF37]">
              Penjelasan Lengkap
            </p>
            <h2 id="privacy-detail-title" className="font-display mt-3 text-3xl leading-tight tracking-[-0.025em] text-[#F4F1EA] sm:text-4xl">
              Cara informasi digunakan dan disimpan.
            </h2>
          </div>

          <div className="mt-7 space-y-4">
            {sections.map((section) => {
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
                      {"bullets" in section ? (
                        <ul className="mt-4 space-y-3">
                          {section.bullets?.map((bullet) => (
                            <li key={bullet} className="flex items-start gap-2.5 text-sm leading-6 text-white/65">
                              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-[#D4AF37]" aria-hidden="true" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
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
                Hubungi Saya
              </p>
              <h2 className="font-display mt-3 text-3xl leading-tight text-[#F4F1E8] sm:text-4xl">
                Ada pertanyaan tentang data Anda?
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/60 sm:text-base">
                Hubungi saya melalui email untuk menanyakan, memperbaiki, atau meminta
                penghapusan informasi yang Anda kirimkan melalui situs.
              </p>
            </div>
            <a
              href="mailto:eryawanagungtrimuda@gmail.com?subject=Permintaan%20Terkait%20Data%20Pribadi"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#D4AF37] bg-[#D4AF37] px-6 py-3 text-center font-mono text-[11px] font-black uppercase tracking-[0.12em] text-[#080807] transition hover:bg-[#E2C866] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807]"
            >
              <Mail size={15} aria-hidden="true" /> Kirim Email
            </a>
          </div>
          <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-6 text-white/40">
            Terakhir diperbarui: 4 November 2026. Halaman ini menjelaskan cara
            informasi dikelola dan akan diperbarui jika cara tersebut berubah.
          </p>
        </section>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-white/45">
          <TrackedLink
            href="/ketentuan-layanan"
            eventName="cta_click"
            eventProps={{
              source: "privacy_policy_page",
              label: "lihat_ketentuan_layanan",
              href_type: "internal",
            }}
            data-cta="privacy-view-service-terms"
            className="transition hover:text-[#D4AF37]"
          >
            Ketentuan Layanan
          </TrackedLink>
          <TrackedLink
            href="/layanan"
            eventName="cta_click"
            eventProps={{
              source: "privacy_policy_page",
              label: "lihat_paket_jasa",
              href_type: "internal",
            }}
            data-cta="privacy-view-services"
            className="transition hover:text-[#D4AF37]"
          >
            Paket Jasa
          </TrackedLink>
        </div>
      </div>
    </main>
  );
}
