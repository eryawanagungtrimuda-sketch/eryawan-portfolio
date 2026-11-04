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
    "Penjelasan tentang data yang dikumpulkan melalui situs Eryawan Agung, tujuan penggunaannya, penyimpanan, layanan pihak ketiga, dan cara mengajukan permintaan terkait data pribadi.",
  alternates: { canonical: absoluteUrl("/kebijakan-privasi") },
  openGraph: {
    title: "Kebijakan Privasi | Eryawan Agung",
    description:
      "Pahami bagaimana data dari formulir proyek, permintaan akses CV, dan kunjungan situs dikelola.",
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
      "Pahami bagaimana data dari formulir proyek, permintaan akses CV, dan kunjungan situs dikelola.",
    images: [absoluteUrl("/opengraph-image")],
  },
};

const sections = [
  {
    number: "01",
    title: "Data yang dapat dikumpulkan",
    icon: UserRound,
    paragraphs: [
      "Jenis data bergantung pada fitur yang Anda gunakan. Anda tidak perlu memberikan data yang tidak relevan dengan permintaan Anda.",
    ],
    bullets: [
      "Brief proyek: nama, perusahaan/brand/instansi, email, WhatsApp, jenis kebutuhan, lokasi proyek, estimasi luas, tahap proyek, timeline, kisaran anggaran, status materi pendukung, serta penjelasan kebutuhan yang Anda tulis.",
      "Permintaan akses CV: nama, email, perusahaan/organisasi, jabatan, tujuan melihat CV, tautan LinkedIn atau situs perusahaan, dan WhatsApp bila diberikan.",
      "Informasi kunjungan promosi: halaman yang dikunjungi, sumber/medium/kampanye promosi (parameter UTM), konten promosi, referrer, dan ID sesi sementara saat pelacakan tautan promosi yang dikenali aktif.",
      "Interaksi situs: data peristiwa seperti klik CTA, email/WhatsApp, serta niat membuka halaman karya atau wawasan, beserta label sumber dan halaman yang relevan.",
    ],
  },
  {
    number: "02",
    title: "Tujuan penggunaan data",
    icon: Eye,
    paragraphs: [
      "Data digunakan secukupnya untuk menindaklanjuti kebutuhan yang Anda sampaikan, mengelola komunikasi profesional, meninjau permintaan akses CV, dan menjaga fungsi serta keamanan situs.",
    ],
    bullets: [
      "Menghubungi Anda kembali mengenai brief, peluang kerja, kolaborasi, atau permintaan akses CV.",
      "Memahami konteks proyek dan menyiapkan diskusi atau penawaran yang relevan.",
      "Mengukur performa halaman dan kampanye promosi agar informasi serta perjalanan pengunjung dapat ditingkatkan.",
      "Menangani kendala operasional, mencegah penyalahgunaan formulir, dan memenuhi kewajiban yang berlaku.",
    ],
  },
  {
    number: "03",
    title: "Penyimpanan dan layanan pendukung",
    icon: Database,
    paragraphs: [
      "Data formulir proyek dan permintaan akses CV disimpan melalui layanan basis data Supabase yang digunakan situs. Situs di-host dan dapat menggunakan layanan analitik dari Vercel.",
      "Untuk notifikasi permintaan akses CV, sistem dapat menggunakan Resend dan/atau endpoint webhook yang dikonfigurasi. Jika layanan notifikasi tersebut diaktifkan, informasi yang diperlukan untuk meninjau permintaan dapat diteruskan kepada layanan terkait.",
      "Penyedia layanan dapat memproses data sesuai pengaturan akun, lokasi infrastruktur, dan kebijakan privasi masing-masing. Situs tidak menjual data pribadi Anda.",
    ],
    bullets: [
      "Formulir brief menyimpan data yang dikirim agar permintaan dapat ditindaklanjuti. Setelah penyimpanan berhasil, situs dapat membuka WhatsApp dengan draf pesan yang sudah diisi; pesan tersebut tidak dikirim otomatis dan Anda tetap mengendalikan apakah akan mengirimkannya.",
      "Jika Anda memilih mengirim pesan melalui WhatsApp atau mengunjungi layanan pihak ketiga, pemrosesan selanjutnya juga mengikuti kebijakan layanan tersebut.",
    ],
  },
  {
    number: "04",
    title: "Analitik dan penyimpanan sesi browser",
    icon: Activity,
    paragraphs: [
      "Situs menggunakan Vercel Web Analytics/Insights dan pelacakan tautan promosi untuk memahami kunjungan serta efektivitas konten. Saat tautan promosi dengan sumber yang dikenali dibuka, situs dapat membaca parameter UTM dan referrer, membuat ID sesi sementara, lalu mengirim informasi kampanye dan halaman ke server.",
      "ID sesi dan penanda untuk mencegah pencatatan berulang disimpan sementara melalui sessionStorage pada browser. Informasi tersebut digunakan untuk analitik promosi, bukan untuk meminta kata sandi atau mengakses isi perangkat Anda.",
    ],
    bullets: [
      "Parameter kampanye dapat mencakup sumber seperti Instagram, TikTok, YouTube Shorts, Pinterest, LinkedIn, WhatsApp, atau sumber lain yang didukung.",
      "Pengaturan browser yang membatasi penyimpanan sesi dapat membuat sebagian pelacakan tidak berfungsi; fitur utama situs tetap dirancang agar dapat digunakan.",
    ],
  },
  {
    number: "05",
    title: "Akses, pembagian, dan kerahasiaan",
    icon: ShieldCheck,
    paragraphs: [
      "Data hanya digunakan oleh Eryawan Agung untuk tujuan yang dijelaskan dalam kebijakan ini dan dibagikan kepada penyedia infrastruktur atau notifikasi bila diperlukan untuk menjalankan fungsi situs. Data tidak dijual atau disewakan untuk pemasaran pihak lain.",
      "Informasi proyek dan komunikasi diperlakukan sebagai informasi profesional yang perlu dijaga. Mohon jangan mengirimkan kata sandi, data keuangan sensitif, atau informasi pribadi pihak lain yang tidak diperlukan melalui formulir.",
    ],
    bullets: [
      "Akses internal dibatasi sesuai kebutuhan pengelolaan permintaan dan administrasi situs.",
      "Jika Anda menyertakan informasi milik orang lain, pastikan Anda berhak membagikannya untuk tujuan yang dimaksud.",
    ],
  },
  {
    number: "06",
    title: "Lama penyimpanan",
    icon: FileText,
    paragraphs: [
      "Data disimpan selama diperlukan untuk menanggapi permintaan, mengelola komunikasi atau proyek, menjaga keamanan, dan memenuhi kewajiban yang relevan. Lama penyimpanan dapat berbeda menurut jenis data dan konteks permintaan.",
      "Jika data tidak lagi diperlukan, data dapat dihapus atau ditangani secara wajar sesuai kebutuhan operasional dan kewajiban yang berlaku. Permintaan penghapusan dapat diajukan melalui email yang tercantum di bawah.",
    ],
  },
  {
    number: "07",
    title: "Pilihan dan permintaan terkait data",
    icon: UserRound,
    paragraphs: [
      "Anda dapat menghubungi Eryawan Agung untuk meminta informasi mengenai data yang Anda kirimkan, memperbaiki data yang tidak akurat, atau meminta penghapusan jika memungkinkan. Untuk membantu verifikasi, permintaan mungkin memerlukan informasi tambahan yang wajar.",
      "Permintaan akan ditinjau dan ditangani sesuai konteks, keamanan, dan kewajiban yang berlaku. Sebagian catatan mungkin perlu dipertahankan jika terdapat alasan operasional atau kewajiban yang sah.",
    ],
  },
  {
    number: "08",
    title: "Keamanan dan perubahan kebijakan",
    icon: ShieldCheck,
    paragraphs: [
      "Langkah teknis dan operasional yang wajar digunakan untuk melindungi data. Namun, pengiriman melalui internet dan penyimpanan digital tidak dapat dijamin sepenuhnya bebas dari risiko.",
      "Kebijakan ini dapat diperbarui ketika fitur, penyedia layanan, atau cara pengelolaan data berubah. Versi terbaru akan dipublikasikan di halaman ini beserta tanggal pembaruannya.",
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
            Privasi & Pengelolaan Data
          </p>
          <h1 className="font-display mt-5 max-w-4xl text-4xl font-normal leading-[1.08] tracking-[-0.035em] text-[#F6F1E8] sm:text-5xl md:text-6xl">
            Data Anda digunakan untuk tujuan yang jelas.
          </h1>
          <p className="mt-5 max-w-3xl text-sm leading-7 text-white/65 sm:text-base sm:leading-8">
            Kebijakan ini menjelaskan data yang dapat diterima melalui situs
            Eryawan Agung, bagaimana data digunakan dan disimpan, serta cara
            mengajukan permintaan terkait data pribadi Anda.
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
              data hanya diminta untuk kebutuhan komunikasi, peninjauan permintaan,
              pengelolaan proyek, dan peningkatan fungsi situs. Jangan kirimkan
              data sensitif yang tidak diperlukan melalui formulir.
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
                title: "Penyedia layanan",
                detail: "Supabase, Vercel, dan layanan notifikasi yang diaktifkan mendukung fungsi situs.",
              },
              {
                title: "Anda dapat menghubungi",
                detail: "Kirim permintaan akses, koreksi, atau penghapusan data melalui email.",
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
              Cara data dikelola.
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
                Kontak Privasi
              </p>
              <h2 className="font-display mt-3 text-3xl leading-tight text-[#F4F1E8] sm:text-4xl">
                Ada pertanyaan tentang data Anda?
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/60 sm:text-base">
                Hubungi saya melalui email untuk permintaan akses, koreksi,
                atau penghapusan data yang Anda kirimkan melalui situs.
              </p>
            </div>
            <a
              href="mailto:eryawanagungtrimuda@gmail.com?subject=Permintaan%20Terkait%20Data%20Pribadi"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#D4AF37] bg-[#D4AF37] px-6 py-3 text-center font-mono text-[11px] font-black uppercase tracking-[0.12em] text-[#080807] transition hover:bg-[#E2C866] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#080807]"
            >
              <Mail size={15} aria-hidden="true" /> Email untuk Privasi
            </a>
          </div>
          <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-6 text-white/40">
            Terakhir diperbarui: 4 November 2026. Kebijakan ini menjelaskan
            praktik pengelolaan data situs dan dapat diperbarui apabila praktik
            tersebut berubah.
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
