"use client";

import type { CSSProperties, FormEvent } from "react";
import { useMemo, useRef, useState } from "react";
import { useToast } from "@/components/toast-provider";
import { readPromoAttribution } from "@/lib/promo-attribution";
import { servicePackages, type ServicePackageId } from "@/lib/service-packages";

type FormState = {
  nama: string;
  perusahaan: string;
  email: string;
  whatsapp: string;
  paketId: ServicePackageId | "";
  jenisKebutuhan: string;
  jenisProyek: string;
  lokasiProject: string;
  estimasiLuas: string;
  tahapProject: string;
  timeline: string;
  budgetRange: string;
  kebutuhanUtama: string;
  statusFile: string;
};

const kebutuhanOptions = [
  "Proyek Desain",
  "Design Review",
  "Design Development",
  "Kolaborasi / Mitra Bisnis",
  "Peluang Kerja / Rekrutmen",
  "Lainnya",
];
const projectTypeOptions = [
  "Interior Residential",
  "Hospitality / Hotel / Villa",
  "Workspace / Office",
  "Retail / Commercial",
  "Interior Lainnya",
  "Arsitektur Rumah",
];
const interiorProjectTypeOptions = [
  "Interior Residential",
  "Hospitality / Hotel / Villa",
  "Workspace / Office",
  "Retail / Commercial",
  "Interior Lainnya",
];
const luasOptions = [
  "< 50 m²",
  "50–100 m²",
  "100–300 m²",
  "300–500 m²",
  "> 500 m²",
  "Belum tahu",
];
const tahapOptions = [
  "Masih ide awal",
  "Sudah ada layout/gambar",
  "Butuh review desain",
  "Butuh konsep desain",
  "Butuh design development",
  "Siap masuk tahap eksekusi",
  "Butuh partner strategis",
];
const timelineOptions = [
  "Secepatnya",
  "1–3 bulan",
  "3–6 bulan",
  "> 6 bulan",
  "Fleksibel",
];
const budgetOptions = [
  "Belum ditentukan",
  "< Rp50 juta",
  "Rp50–150 juta",
  "Rp150–500 juta",
  "Rp500 juta–1 M",
  "> Rp1 M",
  "Rahasia / dibahas langsung",
];
const statusFileOptions = [
  "Belum ada file",
  "Ada foto lokasi",
  "Ada layout",
  "Ada gambar 3D/render",
  "Ada referensi moodboard",
  "Ada brief tertulis",
];
const focusRingClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d0c]";

const initialState: FormState = {
  nama: "",
  perusahaan: "",
  email: "",
  whatsapp: "",
  paketId: "",
  jenisKebutuhan: "",
  jenisProyek: "",
  lokasiProject: "",
  estimasiLuas: "",
  tahapProject: "",
  timeline: "",
  budgetRange: "Belum ditentukan",
  kebutuhanUtama: "",
  statusFile: "Belum ada file",
};

type ProjectBriefFormProps = {
  selectedPackageId?: ServicePackageId | "";
};

export default function ProjectBriefForm({ selectedPackageId = "" }: ProjectBriefFormProps) {
  const initialForm = useMemo<FormState>(
    () => ({
      ...initialState,
      paketId: selectedPackageId,
      jenisKebutuhan: selectedPackageId ? "Proyek Desain" : "",
      jenisProyek: selectedPackageId === "opsi-4" ? "Arsitektur Rumah" : "",
    }),
    [selectedPackageId],
  );
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copyState, setCopyState] = useState("");
  const [submitState, setSubmitState] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [whatsappHref, setWhatsappHref] = useState("");
  const [isFormClosed, setIsFormClosed] = useState(false);
  const isSubmittingRef = useRef(false);
  const formStartedAtRef = useRef(Date.now());
  const waNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(
    /[^\d]/g,
    "",
  );
  const { toast } = useToast();
  const selectedPackage = servicePackages.find((item) => item.id === form.paketId);
  const selectedPackageLabel = selectedPackage
    ? `${selectedPackage.option} — ${selectedPackage.title}`
    : "Belum dipilih";

  const message = useMemo(
    () =>
      `Halo Eryawan, saya ingin memulai percakapan.\n\nNama: ${form.nama || "-"}\nPerusahaan / Brand / Instansi: ${form.perusahaan || "-"}\nEmail: ${form.email || "-"}\nWhatsApp: ${form.whatsapp || "-"}\n\nArah Kebutuhan: ${form.jenisKebutuhan || "-"}\nJenis Proyek: ${form.jenisProyek || "-"}\nPaket yang Diminati: ${selectedPackageLabel}\nLokasi Proyek: ${form.lokasiProject || "-"}\nEstimasi Luas: ${form.estimasiLuas || "-"}\nTahap Saat Ini: ${form.tahapProject || "-"}\nTimeline: ${form.timeline || "-"}\nRange Budget: ${form.budgetRange || "-"}\nStatus File: ${form.statusFile || "-"}\n\nKonteks Kebutuhan:\n${form.kebutuhanUtama || "-"}\n\nSaya ingin dibantu membaca kebutuhan ini dan menentukan langkah awal yang paling tepat.`,
    [form, selectedPackageLabel],
  );

  function validate() {
    const e: Record<string, string> = {};
    if (!form.nama.trim()) e.nama = "Nama lengkap wajib diisi.";
    if (!form.email.trim() && !form.whatsapp.trim())
      e.kontak = "Minimal isi Email atau WhatsApp.";
    if (!form.jenisKebutuhan)
      e.jenisKebutuhan = "Arah kebutuhan wajib dipilih.";
    if (form.jenisKebutuhan === "Proyek Desain" && !form.jenisProyek)
      e.jenisProyek = "Jenis proyek wajib dipilih.";
    if (!form.kebutuhanUtama.trim())
      e.kebutuhanUtama = "Kebutuhan utama wajib diisi.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const honeypotValue = new FormData(formElement).get("website");
    const formStartedAt = formStartedAtRef.current;
    if (
      submitState === "saving" ||
      submitState === "success" ||
      isSubmittingRef.current
    )
      return;

    setSubmitMessage("");
    if (!validate()) return;

    setSubmitState("saving");
    isSubmittingRef.current = true;

    let response: Response;
    try {
      response = await fetch("/api/project-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          ...readPromoAttribution(),
          messagePreview: message,
          website: typeof honeypotValue === "string" ? honeypotValue : "",
          formStartedAt,
        }),
      });
    } catch {
      setSubmitState("error");
      setSubmitMessage(
        "Brief belum berhasil disimpan karena koneksi bermasalah. Periksa koneksi lalu coba lagi, atau salin brief secara manual.",
      );
      toast({
        type: "error",
        title: "Brief belum tersimpan",
        description: "Periksa koneksi lalu coba lagi, atau salin brief secara manual.",
      });
      isSubmittingRef.current = false;
      return;
    }

    if (!response.ok) {
      setSubmitState("error");
      setSubmitMessage(
        "Brief belum berhasil disimpan. Silakan coba lagi atau salin brief secara manual.",
      );
      toast({
        type: "error",
        title: "Brief belum tersimpan",
        description: "Silakan coba lagi atau salin brief secara manual.",
      });
      isSubmittingRef.current = false;
      return;
    }

    setSubmitState("success");

    if (!waNumber) {
      setWhatsappHref("");
      setSubmitMessage(
        "Brief berhasil disimpan. Untuk melanjutkan percakapan, silakan buka halaman Kontak.",
      );
      toast({
        type: "info",
        title: "Brief berhasil disimpan",
        description: "Anda dapat melanjutkan percakapan melalui halaman Kontak.",
      });
      setIsFormClosed(true);
      return;
    }

    const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    setWhatsappHref(whatsappUrl);
    let whatsappWindow: Window | null = null;
    try {
      whatsappWindow = window.open(whatsappUrl, "_blank");
      if (whatsappWindow) whatsappWindow.opener = null;
    } catch {
      whatsappWindow = null;
    }

    if (whatsappWindow) {
      setSubmitMessage(
        "Brief berhasil disimpan. Periksa draf pesan di WhatsApp, lalu kirim sendiri jika sudah sesuai.",
      );
      toast({
        type: "success",
        title: "Brief berhasil disimpan",
        description: "Periksa draf WhatsApp sebelum mengirim.",
      });
    } else {
      setSubmitMessage(
        "Brief berhasil disimpan. WhatsApp tidak terbuka otomatis. Klik tombol di bawah untuk melanjutkan; pesan tidak dikirim otomatis.",
      );
      toast({
        type: "info",
        title: "Brief berhasil disimpan",
        description: "Klik tombol WhatsApp di bawah untuk melanjutkan.",
      });
    }

    setIsFormClosed(true);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(message);
    setCopyState("Brief berhasil disalin.");
    setTimeout(() => setCopyState(""), 2400);
  }

  function handleReopenForm() {
    setForm(initialForm);
    setErrors({});
    setSubmitState("idle");
    setSubmitMessage("");
    setWhatsappHref("");
    setIsFormClosed(false);
    isSubmittingRef.current = false;
    formStartedAtRef.current = Date.now();
  }

  const inputClass =
    `mt-2 w-full rounded-xl border border-white/14 bg-[#10100e] px-4 py-3 text-sm text-white/90 outline-none transition placeholder:text-white/35 hover:border-[#D4AF37]/35 focus:border-[#D4AF37] ${focusRingClass}`;

  if (isFormClosed) {
    return (
      <section
        className="mt-8 rounded-2xl border border-emerald-300/25 bg-emerald-400/[0.06] p-5 text-sm text-emerald-100 sm:p-6"
        role="status"
        aria-live="polite"
      >
        <p className="font-semibold">Brief berhasil disimpan.</p>
        <p className="mt-2 text-emerald-100/85">
          {submitMessage || "Brief berhasil disimpan. Pilih langkah berikutnya untuk melanjutkan percakapan."}
        </p>
        {whatsappHref ? (
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-emerald-200/40 bg-emerald-100/10 px-4 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-100/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/50"
          >
            Lanjutkan di WhatsApp
          </a>
        ) : (
          <a
            href="/kontak"
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-xl border border-emerald-200/40 bg-emerald-100/10 px-4 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-100/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-200/50"
          >
            Buka Halaman Kontak
          </a>
        )}
        <button
          type="button"
          onClick={handleReopenForm}
          className={`mt-4 rounded-xl border border-emerald-200/35 px-4 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-100/10 ${focusRingClass}`}
          aria-label="Kirim brief baru"
        >
          Kirim Brief Baru
        </button>
      </section>
    );
  }

  return (
    <form onSubmit={handleSend} className="mt-8 grid min-w-0 gap-6 lg:grid-cols-2">
      <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="brief-website">Leave this field empty</label>
        <input id="brief-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <section style={{ "--reveal-delay": "80ms" } as CSSProperties} className="reveal-on-scroll mobile-card-reveal min-w-0 space-y-5 rounded-2xl border border-white/10 bg-[#0d0d0c] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] sm:p-6">
        <div>
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]/85">
            Ceritakan Kebutuhan Anda
          </p>
          <h2 className="font-display mt-2 text-2xl text-[#F6F1E8]">
            Susun Brief Awal
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/58">
            Ceritakan konteks singkatnya. Saya akan membaca arah kebutuhan Anda
            sebelum merespons.
          </p>
        </div>
        <div>
          <label htmlFor="brief-nama" className="text-sm text-white/80">
            Nama lengkap *
          </label>
          <input
            id="brief-nama"
            className={inputClass}
            value={form.nama}
            aria-invalid={Boolean(errors.nama)}
            aria-describedby={errors.nama ? "brief-nama-error" : undefined}
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
          />
          {errors.nama ? (
            <p id="brief-nama-error" className="mt-2 text-xs text-amber-300">
              {errors.nama}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor="brief-perusahaan" className="text-sm text-white/80">
            Perusahaan / brand / instansi
          </label>
          <p
            id="brief-perusahaan-helper"
            className="mt-1 text-xs leading-5 text-white/45"
          >
            Opsional, untuk membantu memahami konteks organisasi atau
            kolaborasi.
          </p>
          <input
            id="brief-perusahaan"
            className={inputClass}
            value={form.perusahaan}
            aria-describedby="brief-perusahaan-helper"
            onChange={(e) => setForm({ ...form, perusahaan: e.target.value })}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="brief-email" className="text-sm text-white/80">
              Email
            </label>
            <input
              id="brief-email"
              type="email"
              className={inputClass}
              value={form.email}
              aria-invalid={Boolean(errors.kontak)}
              aria-describedby={errors.kontak ? "brief-kontak-error" : undefined}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label htmlFor="brief-whatsapp" className="text-sm text-white/80">
              WhatsApp
            </label>
            <input
              id="brief-whatsapp"
              className={inputClass}
              value={form.whatsapp}
              aria-invalid={Boolean(errors.kontak)}
              aria-describedby={errors.kontak ? "brief-kontak-error" : undefined}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            />
          </div>
        </div>
        {errors.kontak ? (
          <p id="brief-kontak-error" className="text-xs text-amber-300">
            {errors.kontak}
          </p>
        ) : null}
        {(!form.jenisKebutuhan || form.jenisKebutuhan === "Proyek Desain") ? (
          <div>
            <label htmlFor="brief-paket" className="text-sm text-white/80">
              Paket yang diminati
            </label>
            <p id="brief-paket-helper" className="mt-1 text-xs leading-5 text-white/45">
              Jika memilih paket, arah kebutuhan otomatis menjadi Proyek Desain. Untuk kolaborasi atau peluang kerja, kosongkan paket terlebih dahulu.
            </p>
            <select
              id="brief-paket"
              value={form.paketId}
              onChange={(event) => {
                const paketId = event.target.value as ServicePackageId | "";
                setForm({
                  ...form,
                  paketId,
                  jenisKebutuhan: paketId ? "Proyek Desain" : form.jenisKebutuhan,
                  jenisProyek:
                    paketId === "opsi-4"
                      ? "Arsitektur Rumah"
                      : paketId && form.jenisProyek === "Arsitektur Rumah"
                        ? ""
                        : form.jenisProyek,
                });
              }}
              aria-describedby="brief-paket-helper"
              className={inputClass}
            >
              <option value="">Belum memilih paket</option>
              {servicePackages.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.option} — {item.title}
                </option>
              ))}
            </select>
          </div>
        ) : null}
        <div>
          <p id="brief-jenis-kebutuhan-label" className="text-sm text-white/80">
            Arah kebutuhan utama *
          </p>
          <p
            id="brief-jenis-kebutuhan-helper"
            className="mt-1 text-xs leading-5 text-white/45"
          >
            {form.paketId
              ? "Paket yang dipilih menetapkan kebutuhan sebagai Proyek Desain. Kosongkan paket jika ingin memilih arah kebutuhan lain."
              : "Pilih tujuan utama. Untuk Proyek Desain, Anda juga dapat menentukan jenis proyek dan paket layanan."}
          </p>
          {form.paketId ? (
            <div className="mt-2 rounded-xl border border-[#D4AF37]/45 bg-[#D4AF37]/10 px-3 py-3 text-sm font-medium text-[#F3DF9C]">
              Proyek Desain
            </div>
          ) : (
            <div
              role="group"
              aria-labelledby="brief-jenis-kebutuhan-label"
              aria-describedby={
                errors.jenisKebutuhan
                  ? "brief-jenis-kebutuhan-error"
                  : "brief-jenis-kebutuhan-helper"
              }
              className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2"
            >
              {kebutuhanOptions.map((item) => (
                <button
                  type="button"
                  key={item}
                  onClick={() =>
                    setForm({
                      ...form,
                      jenisKebutuhan: item,
                      paketId: "",
                      jenisProyek: item === "Proyek Desain" ? form.jenisProyek : "",
                    })
                  }
                  aria-pressed={form.jenisKebutuhan === item}
                  className={form.jenisKebutuhan === item
                    ? "min-h-11 max-w-full break-words rounded-xl border border-[#D4AF37] bg-[#D4AF37]/12 px-3 py-2 text-left text-sm leading-6 text-[#F3DF9C] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55"
                    : "min-h-11 max-w-full break-words rounded-xl border border-white/12 bg-white/[0.02] px-3 py-2 text-left text-sm leading-6 text-white/75 hover:border-[#D4AF37]/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/55"}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
          {errors.jenisKebutuhan ? (
            <p
              id="brief-jenis-kebutuhan-error"
              className="mt-2 text-xs text-amber-300"
            >
              {errors.jenisKebutuhan}
            </p>
          ) : null}
        </div>
        {form.jenisKebutuhan === "Proyek Desain" ? (
          <div>
            <label htmlFor="brief-jenis-proyek" className="text-sm text-white/80">
              Jenis proyek *
            </label>
            <p id="brief-jenis-proyek-helper" className="mt-1 text-xs leading-5 text-white/45">
              {form.paketId === "opsi-4"
                ? "Opsi 4 khusus untuk desain arsitektur rumah."
                : form.paketId
                  ? "Pilih kategori proyek interior yang sesuai."
                  : "Pilih kategori proyek yang akan dibahas."}
            </p>
            <select
              id="brief-jenis-proyek"
              value={form.jenisProyek}
              onChange={(event) => setForm({ ...form, jenisProyek: event.target.value })}
              aria-invalid={Boolean(errors.jenisProyek)}
              aria-describedby={errors.jenisProyek ? "brief-jenis-proyek-error" : "brief-jenis-proyek-helper"}
              className={inputClass}
            >
              <option value="">Pilih jenis proyek</option>
              {(form.paketId === "opsi-4"
                ? ["Arsitektur Rumah"]
                : form.paketId
                  ? interiorProjectTypeOptions
                  : projectTypeOptions
              ).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
            {errors.jenisProyek ? (
              <p id="brief-jenis-proyek-error" className="mt-2 text-xs text-amber-300">
                {errors.jenisProyek}
              </p>
            ) : null}
          </div>
        ) : null}
        <div>
          <label htmlFor="brief-lokasi" className="text-sm text-white/80">
            Lokasi proyek
          </label>
          <input
            id="brief-lokasi"
            className={inputClass}
            value={form.lokasiProject}
            onChange={(e) =>
              setForm({ ...form, lokasiProject: e.target.value })
            }
          />
        </div>
        <SelectField
          id="brief-luas"
          label="Estimasi luas area"
          value={form.estimasiLuas}
          options={luasOptions}
          onChange={(value) => setForm({ ...form, estimasiLuas: value })}
        />
        <SelectField
          id="brief-tahap"
          label="Tahap saat ini"
          value={form.tahapProject}
          options={tahapOptions}
          onChange={(value) => setForm({ ...form, tahapProject: value })}
        />
        <SelectField
          id="brief-timeline"
          label="Timeline pembicaraan"
          value={form.timeline}
          options={timelineOptions}
          onChange={(value) => setForm({ ...form, timeline: value })}
        />
        <SelectField
          id="brief-budget"
          label="Range budget / investasi"
          value={form.budgetRange}
          options={budgetOptions}
          onChange={(value) => setForm({ ...form, budgetRange: value })}
        />
        <div>
          <label htmlFor="brief-kebutuhan" className="text-sm text-white/80">
            Konteks kebutuhan utama *
          </label>
          <p
            id="brief-kebutuhan-helper"
            className="mt-1 text-xs leading-5 text-white/45"
          >
            Tuliskan tujuan, kendala, ruang yang ingin dibahas, atau bentuk
            peluang yang ingin didiskusikan.
          </p>
          <textarea
            id="brief-kebutuhan"
            className={`${inputClass} min-h-36`}
            value={form.kebutuhanUtama}
            aria-invalid={Boolean(errors.kebutuhanUtama)}
            aria-describedby={
              errors.kebutuhanUtama
                ? "brief-kebutuhan-error"
                : "brief-kebutuhan-helper"
            }
            onChange={(e) =>
              setForm({ ...form, kebutuhanUtama: e.target.value })
            }
          />
          {errors.kebutuhanUtama ? (
            <p id="brief-kebutuhan-error" className="mt-2 text-xs text-amber-300">
              {errors.kebutuhanUtama}
            </p>
          ) : null}
        </div>
        <SelectField
          id="brief-status-file"
          label="Status materi pendukung"
          value={form.statusFile}
          options={statusFileOptions}
          onChange={(value) => setForm({ ...form, statusFile: value })}
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={submitState === "saving" || submitState === "success"}
            className={`inline-flex min-h-11 max-w-full items-center justify-center whitespace-normal break-words text-center gap-2 rounded-xl border border-[#D4AF37] bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#E1C25F] disabled:cursor-not-allowed disabled:opacity-70 ${focusRingClass}`}
            aria-label="Kirim brief awal"
          >
            {submitState === "saving" ? (
              <>
                <span
                  className="h-4 w-4 animate-spin rounded-full border-2 border-black/35 border-t-black"
                  aria-hidden="true"
                />
                Menyimpan Brief...
              </>
            ) : (
              "Kirim Brief Awal"
            )}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className={`min-h-11 max-w-full rounded-xl border border-white/20 bg-white/[0.02] px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-[#D4AF37]/40 hover:text-[#D4AF37] ${focusRingClass}`}
            aria-label="Salin brief ke clipboard"
          >
            Salin Brief
          </button>
        </div>
        <p className="text-xs leading-6 text-white/45">
          Dengan mengirim formulir ini, Anda memahami bahwa informasi yang diberikan
          digunakan untuk menindaklanjuti permintaan sesuai{" "}
          <a href="/kebijakan-privasi" className="underline underline-offset-4 transition hover:text-[#D4AF37]">
            Kebijakan Privasi
          </a>
          .
        </p>
        {submitMessage ? (
          <p
            className={`text-xs ${submitState === "error" ? "text-amber-300" : "text-emerald-300"}`}
            role={submitState === "error" ? "alert" : "status"}
            aria-live="polite"
          >
            {submitMessage}
          </p>
        ) : null}
        {copyState ? (
          <p className="text-xs text-emerald-300" role="status" aria-live="polite">
            {copyState}
          </p>
        ) : null}
      </section>
      <section style={{ "--reveal-delay": "160ms" } as CSSProperties} className="reveal-on-scroll mobile-card-reveal min-w-0 h-fit rounded-2xl border border-[#D4AF37]/20 bg-gradient-to-b from-[#12100b] to-[#0b0b0a] p-5 sm:p-6 lg:sticky lg:top-8">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]/85">
          Preview Percakapan
        </p>
        <h3 className="font-display mt-2 text-2xl text-[#F7F0E0]">
          Pesan WhatsApp
        </h3>
        <p className="mt-2 text-sm leading-6 text-white/58">
          Ringkasan ini membantu percakapan pertama terasa terarah, personal,
          dan mudah ditindaklanjuti.
        </p>
        <pre className="mt-4 max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-white/10 bg-black/25 p-4 text-sm leading-7 text-white/80">
          {message}
        </pre>
      </section>
    </form>
  );
}

function SelectField({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm text-white/80">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`mt-2 w-full min-w-0 rounded-xl border border-white/14 bg-[#10100e] px-4 py-3 text-sm text-white/90 outline-none transition hover:border-[#D4AF37]/35 focus:border-[#D4AF37] ${focusRingClass}`}
      >
        <option value="">Pilih opsi</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}
