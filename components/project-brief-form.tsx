'use client';

import { FormEvent, useMemo, useRef, useState } from 'react';

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
  'Interior Residential',
  'Hospitality / Hotel / Villa',
  'Workspace / Office',
  'Retail / Commercial',
  'Design Review',
  'Design Development',
  'Kolaborasi / Mitra Bisnis',
  'Peluang Kerja / Rekrutmen',
  'Lainnya',
];
const luasOptions = ['< 50 m²', '50–100 m²', '100–300 m²', '300–500 m²', '> 500 m²', 'Belum tahu'];
const tahapOptions = [
  'Masih ide awal',
  'Sudah ada layout/gambar',
  'Butuh review desain',
  'Butuh konsep desain',
  'Butuh design development',
  'Siap masuk tahap eksekusi',
  'Butuh partner strategis',
];
const timelineOptions = ['Secepatnya', '1–3 bulan', '3–6 bulan', '> 6 bulan', 'Fleksibel'];
const budgetOptions = ['Belum ditentukan', '< Rp50 juta', 'Rp50–150 juta', 'Rp150–500 juta', 'Rp500 juta–1 M', '> Rp1 M', 'Rahasia / dibahas langsung'];
const statusFileOptions = ['Belum ada file', 'Ada foto lokasi', 'Ada layout', 'Ada gambar 3D/render', 'Ada referensi moodboard', 'Ada brief tertulis'];
const initialState: FormState = {
  nama: '',
  perusahaan: '',
  email: '',
  whatsapp: '',
  jenisKebutuhan: '',
  lokasiProject: '',
  estimasiLuas: '',
  tahapProject: '',
  timeline: '',
  budgetRange: 'Belum ditentukan',
  kebutuhanUtama: '',
  statusFile: 'Belum ada file',
};

export default function ProjectBriefForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [copyState, setCopyState] = useState('');
  const [submitState, setSubmitState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const [isFormClosed, setIsFormClosed] = useState(false);
  const isSubmittingRef = useRef(false);
  const waNumber = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '').replace(/[^\d]/g, '');

  const message = useMemo(
    () =>
      `Halo Eryawan, saya ingin diskusi project.\n\nNama: ${form.nama || '-'}\nPerusahaan / Brand: ${form.perusahaan || '-'}\nEmail: ${form.email || '-'}\nWhatsApp: ${form.whatsapp || '-'}\n\nJenis Kebutuhan: ${form.jenisKebutuhan || '-'}\nLokasi Project: ${form.lokasiProject || '-'}\nEstimasi Luas: ${form.estimasiLuas || '-'}\nTahap Project: ${form.tahapProject || '-'}\nTimeline: ${form.timeline || '-'}\nRange Budget: ${form.budgetRange || '-'}\nStatus File: ${form.statusFile || '-'}\n\nKebutuhan Utama:\n${form.kebutuhanUtama || '-'}\n\nSaya ingin dibantu membaca kebutuhan ini dan menentukan langkah awal yang paling tepat.`,
    [form],
  );

  function validate() {
    const e: Record<string, string> = {};
    if (!form.nama.trim()) e.nama = 'Nama lengkap wajib diisi.';
    if (!form.email.trim() && !form.whatsapp.trim()) e.kontak = 'Minimal isi Email atau WhatsApp.';
    if (!form.jenisKebutuhan) e.jenisKebutuhan = 'Jenis kebutuhan wajib dipilih.';
    if (!form.kebutuhanUtama.trim()) e.kebutuhanUtama = 'Kebutuhan utama wajib diisi.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    if (submitState === 'saving' || submitState === 'success' || isSubmittingRef.current) return;

    setSubmitMessage('');
    if (!validate()) return;

    setSubmitState('saving');
    isSubmittingRef.current = true;

    const response = await fetch('/api/project-inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, messagePreview: message }),
    });

    if (!response.ok) {
      setSubmitState('error');
      setSubmitMessage('Brief belum berhasil disimpan. Silakan coba lagi atau salin brief secara manual.');
      isSubmittingRef.current = false;
      return;
    }

    setSubmitState('success');

    if (!waNumber) {
      setSubmitMessage('Brief berhasil disimpan, tetapi nomor WhatsApp belum dikonfigurasi.');
      setIsFormClosed(true);
      return;
    }

    setSubmitMessage('Brief berhasil disimpan. WhatsApp sudah dibuka untuk melanjutkan percakapan.');
    const whatsappUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setIsFormClosed(true);
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(message);
    setCopyState('Brief berhasil disalin.');
    setTimeout(() => setCopyState(''), 2400);
  }

  function handleReopenForm() {
    setForm(initialState);
    setErrors({});
    setSubmitState('idle');
    setSubmitMessage('');
    setIsFormClosed(false);
    isSubmittingRef.current = false;
  }

  const inputClass =
    'mt-2 w-full rounded-xl border border-white/14 bg-[#10100e] px-4 py-3 text-sm text-white/90 outline-none transition placeholder:text-white/35 hover:border-[#D4AF37]/35 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/30';

  if (isFormClosed) {
    return (
      <section className="mt-8 rounded-2xl border border-emerald-300/25 bg-emerald-400/[0.06] p-5 text-sm text-emerald-100 sm:p-6">
        <p className="font-semibold">Brief sudah dikirim.</p>
        <p className="mt-2 text-emerald-100/85">{submitMessage || 'WhatsApp sudah dibuka dan form ditutup otomatis.'}</p>
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
      <section className="space-y-5 rounded-2xl border border-white/10 bg-[#0d0d0c] p-5 sm:p-6">
        <h2 className="font-display text-2xl text-[#F6F1E8]">Susun Brief Anda</h2>
        <div>
          <label className="text-sm text-white/80">Nama lengkap *</label>
          <input className={inputClass} value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
          {errors.nama ? <p className="mt-2 text-xs text-amber-300">{errors.nama}</p> : null}
        </div>
        <div>
          <label className="text-sm text-white/80">Perusahaan / Brand / Instansi</label>
          <input className={inputClass} value={form.perusahaan} onChange={(e) => setForm({ ...form, perusahaan: e.target.value })} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm text-white/80">Email</label>
            <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="text-sm text-white/80">WhatsApp</label>
            <input className={inputClass} value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} />
          </div>
        </div>
        {errors.kontak ? <p className="text-xs text-amber-300">{errors.kontak}</p> : null}
        <div>
          <label className="text-sm text-white/80">Jenis kebutuhan *</label>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {kebutuhanOptions.map((item) => (
              <button
                type="button"
                key={item}
                onClick={() => setForm({ ...form, jenisKebutuhan: item })}
                className={`rounded-xl border px-3 py-2 text-left text-sm transition ${
                  form.jenisKebutuhan === item
                    ? 'border-[#D4AF37] bg-[#D4AF37]/12 text-[#F3DF9C]'
                    : 'border-white/12 bg-white/[0.02] text-white/75 hover:border-[#D4AF37]/35'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
          {errors.jenisKebutuhan ? <p className="mt-2 text-xs text-amber-300">{errors.jenisKebutuhan}</p> : null}
        </div>
        <div>
          <label className="text-sm text-white/80">Lokasi project</label>
          <input className={inputClass} value={form.lokasiProject} onChange={(e) => setForm({ ...form, lokasiProject: e.target.value })} />
        </div>
        <SelectField label="Estimasi luas area" value={form.estimasiLuas} options={luasOptions} onChange={(value) => setForm({ ...form, estimasiLuas: value })} />
        <SelectField label="Tahap project saat ini" value={form.tahapProject} options={tahapOptions} onChange={(value) => setForm({ ...form, tahapProject: value })} />
        <SelectField label="Timeline" value={form.timeline} options={timelineOptions} onChange={(value) => setForm({ ...form, timeline: value })} />
        <SelectField
          label="Range budget / investasi project"
          value={form.budgetRange}
          options={budgetOptions}
          onChange={(value) => setForm({ ...form, budgetRange: value })}
        />
        <div>
          <label className="text-sm text-white/80">Kebutuhan utama *</label>
          <textarea className={`${inputClass} min-h-32`} value={form.kebutuhanUtama} onChange={(e) => setForm({ ...form, kebutuhanUtama: e.target.value })} />
          {errors.kebutuhanUtama ? <p className="mt-2 text-xs text-amber-300">{errors.kebutuhanUtama}</p> : null}
        </div>
        <SelectField label="Status file" value={form.statusFile} options={statusFileOptions} onChange={(value) => setForm({ ...form, statusFile: value })} />
        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={submitState === 'saving' || submitState === 'success'}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#D4AF37] bg-[#D4AF37] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#E1C25F] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {submitState === 'saving' ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/35 border-t-black" aria-hidden="true" />
                Menyimpan Brief...
              </>
            ) : (
              'Kirim Brief via WhatsApp'
            )}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-xl border border-white/20 bg-white/[0.02] px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-[#D4AF37]/40 hover:text-[#D4AF37]"
          >
            Salin Brief
          </button>
        </div>
        {submitMessage ? <p className={`text-xs ${submitState === 'error' ? 'text-amber-300' : 'text-emerald-300'}`}>{submitMessage}</p> : null}
        {copyState ? <p className="text-xs text-emerald-300">{copyState}</p> : null}
      </section>
      <section className="h-fit rounded-2xl border border-[#D4AF37]/20 bg-gradient-to-b from-[#12100b] to-[#0b0b0a] p-5 sm:p-6 lg:sticky lg:top-8">
        <h3 className="font-display text-2xl text-[#F7F0E0]">Preview Pesan WhatsApp</h3>
        <pre className="mt-4 whitespace-pre-wrap rounded-xl border border-white/10 bg-black/25 p-4 text-sm leading-7 text-white/80">{message}</pre>
      </section>
    </form>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="text-sm text-white/80">{label}</label>
      <select
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
