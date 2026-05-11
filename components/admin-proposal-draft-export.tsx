'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import type { ProjectInquiry, ProjectInquiryProposalDraft } from '@/lib/types';
import { ProposalDraftRenderer } from '@/components/proposal-draft-renderer';
import { downloadProposalText } from '@/lib/proposal-export';

const fallbackText = 'Belum diisi';
const formatDate = (v: string) => new Date(v).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

export default function AdminProposalDraftExport({ id, draftId }: { id: string; draftId: string }) {
  const router = useRouter();
  const [inquiry, setInquiry] = useState<ProjectInquiry | null>(null);
  const [draft, setDraft] = useState<ProjectInquiryProposalDraft | null>(null);
  const [error, setError] = useState('');
  const [copyState, setCopyState] = useState('');

  const authedFetch = async (url: string) => {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    return fetch(url, { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}` } });
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

  if (error && !draft) return <p className="rounded-xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-200">{error || 'Draft proposal tidak ditemukan.'}</p>;
  if (!inquiry || !draft) return <p className="text-white/65">Memuat draft proposal...</p>;

  return <div className="space-y-6 pb-12 font-sans">
    <style jsx global>{`
      @media print {
        body { background: #fff !important; color: #000 !important; }
        .no-print { display: none !important; }
        .print-card { background: #fff !important; color: #000 !important; border-color: #d4d4d4 !important; box-shadow: none !important; }
        .print-card * { color: inherit !important; }
        .print-break-avoid { break-inside: avoid; page-break-inside: avoid; }
      }
    `}</style>

    <section className="print-card rounded-2xl border border-[#D4AF37]/35 bg-[#0D0D0C] p-6">
      <p className="text-[11px] uppercase tracking-[0.2em] text-[#D4AF37]">Proposal Draft</p>
      <h1 className="mt-2 text-3xl text-[#F4F1EA]">{draft.title}</h1>
      <p className="mt-2 text-sm text-white/70">Disusun berdasarkan inquiry project dari {inquiry.perusahaan || inquiry.nama || fallbackText}.</p>
      <p className="mt-4 text-xs text-white/55">Eryawan Agung · Eryawan Studio</p>
    </section>

    <section className="print-card print-break-avoid rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <h2 className="text-xl text-[#F4F1EA]">Ringkasan Inquiry</h2>
      <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
        {[['Nama calon klien', inquiry.nama], ['Perusahaan / Brand / Instansi', inquiry.perusahaan], ['Email', inquiry.email], ['WhatsApp', inquiry.whatsapp], ['Jenis kebutuhan', inquiry.jenis_kebutuhan], ['Lokasi project', inquiry.lokasi_project], ['Estimasi luas', inquiry.estimasi_luas], ['Tahap project', inquiry.tahap_project], ['Timeline', inquiry.timeline], ['Range budget', inquiry.budget_range], ['Status file', inquiry.status_file], ['Kebutuhan utama', inquiry.kebutuhan_utama]].map(([label, value]) => <p key={label} className="text-white/80"><span className="text-white/55">{label}:</span> {value || fallbackText}</p>)}
      </div>
    </section>

    <section className="print-card rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <h2 className="text-xl text-[#F4F1EA]">Isi Proposal</h2>
      <div className="mt-4"><ProposalDraftRenderer content={draft.draft_content} /></div>
    </section>

    {draft.follow_up_message ? <section className="print-card print-break-avoid rounded-2xl border border-white/10 bg-white/[0.02] p-6"><h2 className="text-xl text-[#F4F1EA]">Pesan Follow-up</h2><div className="mt-4 whitespace-pre-wrap rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/80">{draft.follow_up_message}</div></section> : null}

    <section className="print-card print-break-avoid rounded-2xl border border-white/10 bg-white/[0.02] p-6">
      <h2 className="text-xl text-[#F4F1EA]">Metadata Draft</h2>
      <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
        <p className="text-white/80"><span className="text-white/55">Versi draft:</span> {draft.version}</p>
        <p className="text-white/80"><span className="text-white/55">Status draft:</span> {draft.status}</p>
        <p className="text-white/80"><span className="text-white/55">Tanggal dibuat:</span> {formatDate(draft.created_at)}</p>
        <p className="text-white/80"><span className="text-white/55">Dibuat oleh:</span> {draft.created_by || fallbackText}</p>
      </div>
    </section>

    <section className="no-print flex flex-wrap items-center gap-2">
      <button onClick={() => window.print()} className="rounded-full border border-[#D4AF37]/45 px-4 py-2 text-xs text-[#D4AF37]">Print / Simpan PDF</button>
      <button onClick={() => downloadProposalText(inquiry, draft)} className="rounded-full border border-white/20 px-4 py-2 text-xs">Download Teks</button>
      <button onClick={copyDraft} className="rounded-full border border-white/20 px-4 py-2 text-xs">Salin Draft</button>
      <button onClick={() => router.back()} className="rounded-full border border-white/20 px-4 py-2 text-xs">Kembali ke Sebelumnya</button>
      <Link href={`/admin/inquiries/${id}`} className="rounded-full border border-white/20 px-4 py-2 text-xs">Detail Inquiry</Link>
    </section>

    {copyState ? <p className="no-print text-xs text-emerald-300">{copyState}</p> : null}
  </div>;
}
