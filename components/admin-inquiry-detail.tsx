'use client';

import { useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import type { ProjectInquiry } from '@/lib/types';

export default function AdminInquiryDetail({ id }: { id: string }) {
  const [row, setRow] = useState<ProjectInquiry | null>(null);
  const [error, setError] = useState('');
  const [copyState, setCopyState] = useState('');
  const [updating, setUpdating] = useState(false);
  const [proposalDraft, setProposalDraft] = useState('');
  const [followUpMessage, setFollowUpMessage] = useState('');
  const [proposalError, setProposalError] = useState('');
  const [proposalLoading, setProposalLoading] = useState(false);

  const authedFetch = async (url: string, init?: RequestInit) => {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    return fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${session?.access_token || ''}`,
        ...(init?.headers || {}),
      },
    });
  };

  const load = async () => {
    setError('');
    const res = await authedFetch(`/api/project-inquiries/${id}`);
    const json = await res.json();
    if (!res.ok) setError(json.error || 'Gagal memuat detail inquiry.');
    else setRow(json.data);
  };

  useEffect(() => { load(); }, [id]);

  const patch = async (status: ProjectInquiry['status']) => {
    setUpdating(true);
    const res = await authedFetch(`/api/project-inquiries/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    if (!res.ok) {
      const json = await res.json();
      setError(json.error || 'Gagal memperbarui status inquiry.');
    }
    await load();
    setUpdating(false);
  };

  const copyMessage = async () => {
    if (!row) return;
    await navigator.clipboard.writeText(row.message_preview);
    setCopyState('Pesan berhasil disalin.');
    setTimeout(() => setCopyState(''), 2000);
  };

  const generateProposalDraft = async () => {
    setProposalLoading(true);
    setProposalError('');
    const res = await authedFetch(`/api/project-inquiries/${id}/proposal-draft`, { method: 'POST' });
    const json = await res.json();
    if (!res.ok) {
      setProposalError(json.error || 'Draft proposal belum berhasil dibuat. Silakan coba lagi.');
      setProposalLoading(false);
      return;
    }

    setProposalDraft(json.draft || '');
    setFollowUpMessage(json.followUpMessage || '');
    setProposalLoading(false);
  };

  const copyProposal = async () => {
    if (!proposalDraft) return;
    await navigator.clipboard.writeText(proposalDraft);
    setCopyState('Draft proposal berhasil disalin.');
    setTimeout(() => setCopyState(''), 2000);
  };

  const copyFollowUp = async () => {
    if (!followUpMessage) return;
    await navigator.clipboard.writeText(followUpMessage);
    setCopyState('Pesan follow-up berhasil disalin.');
    setTimeout(() => setCopyState(''), 2000);
  };

  if (!row && !error) return <p className="text-white/60">Memuat detail...</p>;
  if (error && !row) return <p className="rounded-xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>;
  if (!row) return null;

  return (
    <div className="space-y-6">
      {error ? <p className="rounded-xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-200">{error}</p> : null}

      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.015] p-5 text-sm">
        {[
          ['Nama', row.nama],
          ['Perusahaan / Brand / Instansi', row.perusahaan || '—'],
          ['Email', row.email || '—'],
          ['WhatsApp', row.whatsapp || '—'],
          ['Jenis kebutuhan', row.jenis_kebutuhan],
          ['Lokasi project', row.lokasi_project || '—'],
          ['Estimasi luas', row.estimasi_luas || '—'],
          ['Tahap project', row.tahap_project || '—'],
          ['Timeline', row.timeline || '—'],
          ['Budget range', row.budget_range || '—'],
          ['Status file', row.status_file || '—'],
          ['Kebutuhan utama', row.kebutuhan_utama],
          ['Message preview', row.message_preview],
          ['Created at', new Date(row.created_at).toLocaleString('id-ID')],
          ['Current status', row.status],
        ].map(([k, v]) => (
          <p key={String(k)}><span className="text-white/55">{k}:</span> {String(v)}</p>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <button onClick={copyMessage} className="rounded-full border border-white/20 px-4 py-2 text-xs hover:border-[#D4AF37]/45 hover:text-[#D4AF37]">Salin Pesan WhatsApp</button>
        {row.whatsapp ? <a className="rounded-full border border-[#D4AF37]/35 px-4 py-2 text-xs text-[#D4AF37]" href={`https://wa.me/${row.whatsapp.replace(/[^\d]/g, '')}?text=${encodeURIComponent(row.message_preview)}`} target="_blank" rel="noreferrer">Buka WhatsApp</a> : null}
        <button disabled={updating} onClick={() => patch('ditinjau')} className="rounded-full border border-white/20 px-4 py-2 text-xs disabled:opacity-50">Tandai Ditinjau</button>
        <button disabled={updating} onClick={() => patch('dihubungi')} className="rounded-full border border-white/20 px-4 py-2 text-xs disabled:opacity-50">Tandai Dihubungi</button>
        <button disabled={updating} onClick={() => patch('selesai')} className="rounded-full border border-white/20 px-4 py-2 text-xs disabled:opacity-50">Tandai Selesai</button>
        <button disabled={updating} onClick={() => patch('arsip')} className="rounded-full border border-white/20 px-4 py-2 text-xs disabled:opacity-50">Arsipkan</button>
      </div>

      <section className="space-y-4 rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/[0.04] p-5">
        <div>
          <h2 className="text-base font-semibold text-[#F4F1EA]">Draft Proposal AI</h2>
          <p className="mt-1 text-sm text-white/70">Gunakan AI untuk menyusun draft proposal awal dari data inquiry. Draft ini bisa diedit sebelum dikirim ke calon klien.</p>
        </div>

        <button onClick={generateProposalDraft} disabled={proposalLoading} className="rounded-full border border-[#D4AF37]/45 px-4 py-2 text-xs text-[#D4AF37] hover:bg-[#D4AF37]/10 disabled:opacity-60">
          {proposalLoading ? 'Menyusun draft proposal...' : proposalDraft ? 'Generate Ulang' : 'Buat Draft Proposal dengan AI'}
        </button>

        {proposalError ? <p className="rounded-xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-200">{proposalError || 'Draft proposal belum berhasil dibuat. Silakan coba lagi.'}</p> : null}

        {proposalDraft ? (
          <div className="space-y-3 rounded-xl border border-white/15 bg-black/20 p-4">
            <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-6 text-white/90">{proposalDraft}</pre>
            <div className="flex flex-wrap gap-3">
              <button onClick={copyProposal} className="rounded-full border border-white/20 px-4 py-2 text-xs hover:border-[#D4AF37]/45 hover:text-[#D4AF37]">Salin Draft Proposal</button>
              <button onClick={generateProposalDraft} disabled={proposalLoading} className="rounded-full border border-white/20 px-4 py-2 text-xs hover:border-[#D4AF37]/45 hover:text-[#D4AF37] disabled:opacity-60">Generate Ulang</button>
            </div>
            <p className="text-xs text-white/60">Jika draft sudah digunakan untuk follow-up, Anda dapat menandai inquiry sebagai Dihubungi.</p>
          </div>
        ) : null}

        {followUpMessage ? (
          <div className="space-y-3 rounded-xl border border-white/15 bg-black/20 p-4">
            <h3 className="text-sm font-semibold text-[#F4F1EA]">Pesan Follow-up WhatsApp</h3>
            <pre className="whitespace-pre-wrap break-words font-sans text-sm leading-6 text-white/85">{followUpMessage}</pre>
            <button onClick={copyFollowUp} className="rounded-full border border-white/20 px-4 py-2 text-xs hover:border-[#D4AF37]/45 hover:text-[#D4AF37]">Salin Pesan Follow-up</button>
          </div>
        ) : null}
      </section>

      {copyState ? <p className="text-xs text-emerald-300">{copyState}</p> : null}
    </div>
  );
}
