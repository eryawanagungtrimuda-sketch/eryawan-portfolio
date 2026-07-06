'use client';

import { FormEvent, useState } from 'react';

const empty = { full_name: '', email: '', company: '', role: '', purpose: '', linkedin_url: '', whatsapp: '', website_url_hidden: '' };

export default function CvAccessRequestForm() {
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true); setMessage('');
    try {
      const res = await fetch('/api/cv-access-requests', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Permintaan belum dapat dikirim.');
      setSuccess(true); setForm(empty);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Permintaan belum dapat dikirim.');
    } finally { setLoading(false); }
  }

  if (success) return <div className="rounded-3xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 p-6 text-sm leading-7 text-[#F4E4B2]">Permintaan akses CV Anda sudah terkirim. Saya akan meninjau terlebih dahulu sebelum memberikan akses.</div>;

  return (
    <form onSubmit={submit} className="grid gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-7">
      <input className="hidden" tabIndex={-1} autoComplete="off" value={form.website_url_hidden} onChange={(e) => setForm({ ...form, website_url_hidden: e.target.value })} aria-hidden="true" name="website_url_hidden" />
      {[
        ['full_name', 'Nama lengkap *'], ['email', 'Email *'], ['company', 'Perusahaan / Organisasi'], ['role', 'Jabatan / Role'], ['linkedin_url', 'LinkedIn atau website perusahaan (optional)'], ['whatsapp', 'WhatsApp (optional)'],
      ].map(([key, label]) => (
        <label key={key} className="grid gap-2 text-sm text-white/72">
          <span>{label}</span>
          <input required={key === 'full_name' || key === 'email'} type={key === 'email' ? 'email' : 'text'} value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className="min-h-12 rounded-2xl border border-white/10 bg-[#0b0b0a] px-4 text-[#F4F1EA] outline-none transition focus:border-[#D4AF37]/60" />
        </label>
      ))}
      <label className="grid gap-2 text-sm text-white/72">
        <span>Tujuan melihat CV *</span>
        <textarea required rows={5} value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} className="rounded-2xl border border-white/10 bg-[#0b0b0a] px-4 py-3 text-[#F4F1EA] outline-none transition focus:border-[#D4AF37]/60" />
      </label>
      {message ? <p className="text-sm text-red-300">{message}</p> : null}
      <button disabled={loading} className="min-h-12 rounded-full bg-[#C8A951] px-6 font-mono text-xs font-black uppercase tracking-[0.16em] text-[#080807] transition hover:bg-[#D7BD72] disabled:opacity-60">{loading ? 'Mengirim...' : 'Kirim Permintaan Akses'}</button>
    </form>
  );
}
