"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { useToast } from "@/components/toast-provider";

type FormState = {
  nama: string;
  perusahaan: string;
  email: string;
  whatsapp: string;
  jenisKebutuhan: string;
  lokasiProject: string;
  estimasiLuas: string;
  tahapProject: string;
  timeline: string;
  budgetRange: string;
  kebutuhanUtama: string;
  statusFile: string;
};

const kebutuhanOptions = [
  "Interior Residential",
  "Hospitality / Hotel / Villa",
  "Workspace / Office",
  "Retail / Commercial",
  "Design Review",
  "Design Development",
  "Kolaborasi / Mitra Bisnis",
  "Peluang Kerja / Rekrutmen",
  "Lainnya",
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
const initialState: FormState = {
  nama: "",
  perusahaan: "",
  email: "",
  whatsapp: "",
  jenisKebutuhan: "",
  lokasiProject: "",
  estimasiLuas: "",
  tahapProject: "",
  timeline: "",
  budgetRange: "Belum ditentukan",
  kebutuhanUtama: "",
  statusFile: "Belum ada file",
};

export default function ProjectBriefForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copyState, setCopyState] = useState("");
  const [submitState, setSubmitState] = useState<
    "idle" | "saving" | "success" | "error"
  >("idle");
  const [submitMessage, setSubmitMessage] = useState("");
  const [isFormClosed, setIsFormClosed] = useState(false);
  const isSubmittingRef = useRef(false);
  const waNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(
    /[^\d]/g,
    "",
  );
  const { toast } = useToast();

  const message = useMemo(
    () =>
      `Halo Eryawan, saya ingin memulai percakapan.\n\nNama: ${form.nama || "-"}\nPerusahaan / Brand / Instansi: ${form.perusahaan || "-"}\nEmail: ${form.email || "-"}\nWhatsApp: ${form.whatsapp || "-"}\n\nJenis Kebutuhan: ${form.jenisKebutuhan || "-"}\nLokasi Proyek: ${form.lokasiProject || "-"}\nEstimasi Luas: ${form.estimasiLuas || "-"}\nTahap Saat Ini: ${form.tahapProject || "-"}\nTimeline: ${form.timeline || "-"}\nRange Budget: ${form.budgetRange || "-"}\nStatus File: ${form.statusFile || "-"}\n\nKonteks Kebutuhan:\n${form.kebutuhanUtama || "-"}\n\nSaya ingin dibantu membaca kebutuhan ini dan menentukan langkah awal yang paling tepat.`,
    [form],
  );

  function validate() {
    const e: Record<string, string> = {};
    if (!form.nama.trim()) e.nama = "Nama lengkap wajib diisi.";
    if (!form.email.trim() && !form.whatsapp.trim())
      e.kontak = "Minimal isi Email atau WhatsApp.";
    if (!form.jenisKebutuhan)
      e.jenisKebutuhan = "Jenis kebutuhan wajib dipilih.";
    if (!form.kebutuhanUtama.trim())
      e.kebutuhanUtama = "Kebutuhan utama wajib diisi.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSend(event: FormEvent) {
    event.preventDefault();
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

    const response = await fetch("/api/project-inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, messagePreview: message }),
    });

    if (!response.ok) {
      setSubmitState("error");
      setSubmitMessage(
        "Brief belum berhasil disimpan. Silakan coba lagi atau salin brief secara manual.",
      );
      toast({
        type: "error",
        title: "Pengiriman brief gagal",
        description: "Silakan coba lagi atau salin brief secara manual.",
      });
      isSubmittingRef.current = false;
      return;
    }

    setSubmitState("success");

    if (!waNumber) {
      setSubmitMessage(
        "Brief berhasil disimpan, tetapi nomor WhatsApp belum dikonfigurasi.",
      );
      toast({
        type: "info",
        title: "Brief tersimpan",
        description: "Nomor WhatsApp belum dikonfigurasi.",
      });
      setIsFormClosed(true);
      return;
    }

    setSubmitMessage(
      "Brief berhasil disimpan. WhatsApp sudah dibuka untuk melanjutkan percakapan.",
    );
    toast({
      type: "success",
      title: "Brief berhasil dikirim",
      description: "WhatsApp dibuka untuk melanjutkan percakapan.",
    });
    const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    setIsFormClosed(true);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(message);
    setCopyState("Brief berhasil disalin.");
    setTimeout(() => setCopyState(""), 2400);
  }

  function handleReopenForm() {
    setForm(initialState);
    setErrors({});
    setSubmitState("idle");
    setSubmitMessage("");
    setIsFormClosed(false);
    isSubmittingRef.current = false;
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/14 bg-[#10100e] px-4 py-3 text-sm text-white/90 outline-none transition placeholder:text-white/35 hover:border-[#D4AF37]/35 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30";

  if (isFormClosed) {
    return (
      <section className="mt-8 rounded-2xl border border-emerald-300/25 bg-emerald-400/[0.06] p-5 text-sm text-emerald-100 sm:p-6">
        <p className="font-semibold">Brief sudah dikirim.</p>
        <p className="mt-2 text-emerald-100/85">
          {submitMessage || "WhatsApp sudah dibuka dan form ditutup otomatis."}
        </p>
        <button
          type="button"
          onClick={handleReopenForm}
          className="mt-4 rounded-xl border border-emerald-200/35 px-4 py-2 text-xs font-semibold text-emerald-100 transition hover:bg-emerald-100/10"
        >
          Kirim Brief Baru
        </button>
      </section>
    );
  }

  return (
    <form onSubmit={handleSend} className="mt-8 grid gap-6 lg:grid-cols-2">
      <section className="space-y-5 rounded-2xl border border-white/10 bg-[#0d0d0c] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] sm:p-6">
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
            onChange={(e) => setForm({ ...form, nama: e.target.value })}
          />
          {errors.nama ? (
            <p className="mt-2 text-xs text-amber-300">{errors.nama}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor="brief-perusahaan" className="text-sm text-white/80">
            Perusahaan / brand / instansi
          </label>
          <p className="mt-1 text-xs leading-5 text-white/45">
            Opsional, untuk membantu memahami konteks organisasi atau
            kolaborasi.
          </p>
          <input
            id="brief-perusahaan"
            className={inputClass}
            value={form.perusahaan}
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
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            />
          </div>
        </div>
        {errors.kontak ? (
          <p className="text-xs text-amber-300">{errors.kontak}</p>
        ) : null}
        <div>
          <p id="brief-jenis-kebutuhan-label" className="text-sm text-white/80">
            Peluang kerja, kolaborasi, atau proyek *
          </p>
          <p className="mt-1 text-xs leading-5 text-white/45">
            Pilih satu arah utama agar brief terbaca lebih jelas.
          </p>
          <div
            role="group"
            aria-labelledby="brief-jenis-kebutuhan-label"
            className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2"
          >
            {kebutuhanOptions.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => setForm({ ...form, jenisKebutuhan: item })}
                className={`min-h-11 rounded-xl border px-3 py-2 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/35 ${
                  form.jenisKebutuhan === item
                    ? "border-[#D4AF37] bg-[#D4AF37]/12 text-[#F3DF9C]"
                    : "border-white/12 bg-white/[0.02] text-white/75 hover:border-[#D4AF37]/35"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          {errors.jenisKebutuhan ? (
            <p className="mt-2 text-xs text-amber-300">
              {errors.jenisKebutuhan}
            </p>
          ) : null}
        </div>
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
          <p className="mt-1 text-xs leading-5 text-white/45">
            Tuliskan tujuan, kendala, ruang yang ingin dibahas, atau bentuk
            peluang yang ingin didiskusikan.
          </p>
          <textarea
            id="brief-kebutuhan"
            className={`${inputClass} min-h-36`}
            value={form.kebutuhanUtama}
            onChange={(e) =>
              setForm({ ...form, kebutuhanUtama: e.target.value })
            }
          />
          {errors.kebutuhanUtama ? (
            <p className="mt-2 text-xs text-amber-300">
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
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#D4AF37] bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#E1C25F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/45 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d0c] disabled:cursor-not-allowed disabled:opacity-70"
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
            className="min-h-11 rounded-xl border border-white/20 bg-white/[0.02] px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-[#D4AF37]/40 hover:text-[#D4AF37] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4AF37]/35"
          >
            Salin Brief
          </button>
        </div>
        {submitMessage ? (
          <p
            className={`text-xs ${submitState === "error" ? "text-amber-300" : "text-emerald-300"}`}
          >
            {submitMessage}
          </p>
        ) : null}
        {copyState ? (
          <p className="text-xs text-emerald-300">{copyState}</p>
        ) : null}
      </section>
      <section className="h-fit rounded-2xl border border-[#D4AF37]/20 bg-gradient-to-b from-[#12100b] to-[#0b0b0a] p-5 sm:p-6 lg:sticky lg:top-8">
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
        <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-white/10 bg-black/25 p-4 text-sm leading-7 text-white/80">
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
        className="mt-2 w-full rounded-xl border border-white/14 bg-[#10100e] px-4 py-3 text-sm text-white/90 outline-none transition hover:border-[#D4AF37]/35 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30"
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
