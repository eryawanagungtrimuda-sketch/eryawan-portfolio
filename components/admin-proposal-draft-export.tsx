'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import type { ProjectInquiry, ProjectInquiryProposalDraft } from '@/lib/types';
import { ProposalDraftRenderer } from '@/components/proposal-draft-renderer';
import { downloadProposalText } from '@/lib/proposal-export';

const fallbackText = 'Belum diisi';
const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

function displayValue(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallbackText;
}

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="mb-5 border-b border-white/15 pb-3 print:border-[#d9d9d9]">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#D4AF37] print:text-black">{number}</p>
      <h2 className="mt-1 text-2xl font-semibold text-[#F4F1EA] print:text-black">{title}</h2>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/15 bg-white/[0.03] p-3 print:bg-white print:border-[#d9d9d9] print-card">
      <p className="text-[11px] uppercase tracking-[0.12em] text-white/55 print-muted">{label}</p>
      <p className="mt-1 text-sm text-white/90 print:text-black">{value}</p>
    </div>
  );
}

export default function AdminProposalDraftExport({ id, draftId }: { id: string; draftId: string }) {
  const router = useRouter();
  const [inquiry, setInquiry] = useState<ProjectInquiry | null>(null);
  const [draft, setDraft] = useState<ProjectInquiryProposalDraft | null>(null);
  const [error, setError] = useState('');
  const [copyState, setCopyState] = useState('');

  const authedFetch = async (url: string) => {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    return fetch(url, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` },
    });
  };

  useEffect(() => {
    async function load() {
      const [inquiryRes, draftRes] = await Promise.all([
        authedFetch(`/api/project-inquiries/${id}`),
        authedFetch(`/api/project-inquiries/${id}/proposal-drafts/${draftId}`),
      ]);
      const inquiryJson = await inquiryRes.json();
      const draftJson = await draftRes.json();

      if (!inquiryRes.ok) setError(inquiryJson.error || 'Gagal memuat inquiry.');
      else setInquiry(inquiryJson.data as ProjectInquiry);

      if (!draftRes.ok) setError(draftJson.error || 'Draft proposal tidak ditemukan.');
      else setDraft(draftJson.data as ProjectInquiryProposalDraft);
    }
    load();
  }, [id, draftId]);

  const copyDraft = async () => {
    if (!draft?.draft_content) return;
    await navigator.clipboard.writeText(draft.draft_content);
    setCopyState('Draft berhasil disalin.');
    setTimeout(() => setCopyState(''), 2000);
  };

  const preparedFor = useMemo(() => {
    if (!inquiry) return fallbackText;
    return inquiry.perusahaan?.trim() || inquiry.nama?.trim() || fallbackText;
  }, [inquiry]);

  if (error && !draft)
    return <p className="rounded-xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-200">{error || 'Draft proposal tidak ditemukan.'}</p>;
  if (!inquiry || !draft) return <p className="text-white/65">Memuat draft proposal...</p>;

  return (
    <div className="space-y-6 pb-16 font-sans">
      <style jsx global>{`
        @page { margin: 18mm; }
        @media print {
          body, main, #admin-shell { background: #fff !important; color: #000 !important; }
          .no-print, button, a[href] { display: none !important; }
          .print-card { background: #fff !important; color: #000 !important; border-color: #d9d9d9 !important; box-shadow: none !important; }
          .print-card * { color: inherit !important; }
          .print-muted { color: #555 !important; }
          .print-break-avoid { break-inside: avoid; page-break-inside: avoid; }
          .proposal-content :is(h1,h2,h3,h4) { margin-top: 1rem !important; margin-bottom: .5rem !important; color: #000 !important; }
          .proposal-content p, .proposal-content li { color: #111 !important; line-height: 1.6 !important; }
          .proposal-content ul, .proposal-content ol { padding-left: 1.25rem !important; }
        }
      `}</style>

      <section className="print-card print-break-avoid rounded-2xl border border-[#D4AF37]/35 bg-[#0D0D0C] p-7">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#D4AF37]">PROPOSAL DRAFT</p>
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-[#F4F1EA]">{displayValue(draft.title)}</h1>
        <p className="mt-4 max-w-3xl text-sm text-white/75 print-muted">Disusun sebagai draft awal berdasarkan inquiry project dan dapat disesuaikan setelah diskusi lanjutan.</p>

        <div className="mt-6 grid gap-3 text-sm md:grid-cols-2">
          <InfoCard label="Disusun oleh" value="Eryawan Agung" />
          <InfoCard label="Studio" value="Eryawan Studio" />
          <InfoCard label="Disusun untuk" value={preparedFor} />
          <InfoCard label="Tanggal" value={formatDate(draft.created_at)} />
        </div>
        <p className="mt-4 text-xs text-white/60 print-muted">Versi {draft.version}</p>
      </section>

      <section className="print-break-avoid grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <InfoCard label="Calon klien" value={displayValue(inquiry.nama)} />
        <InfoCard label="Perusahaan / Brand" value={displayValue(inquiry.perusahaan)} />
        <InfoCard label="Jenis kebutuhan" value={displayValue(inquiry.jenis_kebutuhan)} />
        <InfoCard label="Timeline" value={displayValue(inquiry.timeline)} />
        <InfoCard label="Range budget" value={displayValue(inquiry.budget_range)} />
        <InfoCard label="Status draft" value={displayValue(draft.status)} />
      </section>

      <section className="print-card rounded-2xl border border-white/10 bg-white/[0.02] p-6 print-break-avoid">
        <SectionHeader number="01" title="Ringkasan Inquiry" />

        <div className="space-y-5 text-sm text-white/85">
          <div className="rounded-xl border border-white/10 p-4 print:border-[#d9d9d9]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60 print-muted">Identitas Klien</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <p><span className="text-white/55 print-muted">Nama calon klien:</span> {displayValue(inquiry.nama)}</p>
              <p><span className="text-white/55 print-muted">Perusahaan / Brand / Instansi:</span> {displayValue(inquiry.perusahaan)}</p>
              <p><span className="text-white/55 print-muted">Email:</span> {displayValue(inquiry.email)}</p>
              <p><span className="text-white/55 print-muted">WhatsApp:</span> {displayValue(inquiry.whatsapp)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-white/10 p-4 print:border-[#d9d9d9]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60 print-muted">Informasi Project</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <p><span className="text-white/55 print-muted">Jenis kebutuhan:</span> {displayValue(inquiry.jenis_kebutuhan)}</p>
              <p><span className="text-white/55 print-muted">Lokasi project:</span> {displayValue(inquiry.lokasi_project)}</p>
              <p><span className="text-white/55 print-muted">Estimasi luas:</span> {displayValue(inquiry.estimasi_luas)}</p>
              <p><span className="text-white/55 print-muted">Tahap project:</span> {displayValue(inquiry.tahap_project)}</p>
              <p><span className="text-white/55 print-muted">Timeline:</span> {displayValue(inquiry.timeline)}</p>
              <p><span className="text-white/55 print-muted">Range budget:</span> {displayValue(inquiry.budget_range)}</p>
              <p><span className="text-white/55 print-muted">Status file:</span> {displayValue(inquiry.status_file)}</p>
            </div>
          </div>

          <div className="rounded-xl border border-[#D4AF37]/35 bg-[#D4AF37]/10 p-4 print:border-[#d9d9d9] print:bg-white">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#D4AF37] print:text-black">Kebutuhan Utama</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-white/90 print:text-black">{displayValue(inquiry.kebutuhan_utama)}</p>
          </div>
        </div>
      </section>

      <section className="print-card rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <SectionHeader number="02" title="Isi Proposal" />
        <div className="proposal-content mx-auto max-w-3xl text-[15px] leading-7 text-white/90 print:text-black">
          <ProposalDraftRenderer content={draft.draft_content} />
        </div>
      </section>

      {draft.follow_up_message ? (
        <section className="print-card print-break-avoid rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <SectionHeader number="03" title="Pesan Follow-up" />
          <p className="text-sm text-white/70 print-muted">Pesan ini disiapkan untuk follow-up manual melalui WhatsApp.</p>
          <div className="mt-4 whitespace-pre-wrap rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/85 print:border-[#d9d9d9] print:bg-white print:text-black">
            {draft.follow_up_message}
          </div>
        </section>
      ) : null}

      <section className="print-card print-break-avoid rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <SectionHeader number="04" title="Metadata Draft" />
        <div className="grid gap-3 text-sm md:grid-cols-2">
          <p className="text-white/85"><span className="text-white/55 print-muted">Versi:</span> {draft.version}</p>
          <p className="text-white/85"><span className="text-white/55 print-muted">Status draft:</span> {displayValue(draft.status)}</p>
          <p className="text-white/85"><span className="text-white/55 print-muted">Tanggal dibuat:</span> {formatDate(draft.created_at)}</p>
          <p className="text-white/85"><span className="text-white/55 print-muted">Dibuat oleh:</span> {displayValue(draft.created_by)}</p>
        </div>
      </section>

      <footer className="print-card print-break-avoid rounded-2xl border border-white/10 bg-white/[0.02] p-6">
        <p className="text-lg font-semibold text-[#F4F1EA]">Eryawan Agung</p>
        <p className="text-sm text-white/70 print-muted">Interior Design Portfolio</p>
        <p className="mt-4 text-xs leading-5 text-white/65 print-muted">Dokumen ini merupakan draft awal dan masih dapat disesuaikan setelah konfirmasi kebutuhan, ruang lingkup, timeline, dan budget.</p>
      </footer>

      <section className="no-print sticky bottom-4 z-10 rounded-2xl border border-white/15 bg-[#0F0F0E]/95 p-4 backdrop-blur">
        <p className="mb-3 text-xs text-white/65">Gunakan Print / Simpan PDF untuk membuat file PDF dari browser.</p>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => window.print()} className="rounded-full border border-[#D4AF37]/45 px-4 py-2 text-xs text-[#D4AF37]">Print / Simpan PDF</button>
          <button onClick={() => downloadProposalText(inquiry, draft)} className="rounded-full border border-white/20 px-4 py-2 text-xs">Download Teks</button>
          <button onClick={copyDraft} className="rounded-full border border-white/20 px-4 py-2 text-xs">Salin Draft</button>
          <button onClick={() => router.back()} className="rounded-full border border-white/20 px-4 py-2 text-xs">Kembali ke Sebelumnya</button>
          <Link href={`/admin/inquiries/${id}`} className="rounded-full border border-white/20 px-4 py-2 text-xs">Detail Inquiry</Link>
        </div>
        {copyState ? <p className="mt-2 text-xs text-emerald-300">{copyState}</p> : null}
      </section>
    </div>
  );
}
