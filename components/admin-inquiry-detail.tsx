'use client';

import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import type { ProjectInquiry, ProjectInquiryProposalDraft, ProjectInquiryProposalDraftStatus } from '@/lib/types';
import { ProposalDraftRenderer } from '@/components/proposal-draft-renderer';

function buildDraftTitle(row: ProjectInquiry) {
  const parts = [row.jenis_kebutuhan, row.nama || row.perusahaan || ''].filter(Boolean);
  return parts.length ? `Draft Proposal Awal — ${parts.join(' — ')}`.slice(0, 180) : 'Draft Proposal Awal';
}

function buildDraftPreview(content: string) {
  return content
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/^[\-\d.\s]+/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function AdminInquiryDetail({ id }: { id: string }) {
  const [row, setRow] = useState<ProjectInquiry | null>(null);
  const [history, setHistory] = useState<ProjectInquiryProposalDraft[]>([]);
  const [error, setError] = useState('');
  const [copyState, setCopyState] = useState('');
  const [updating, setUpdating] = useState(false);
  const [proposalDraft, setProposalDraft] = useState('');
  const [followUpMessage, setFollowUpMessage] = useState('');
  const [proposalError, setProposalError] = useState('');
  const [proposalLoading, setProposalLoading] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const authedFetch = async (url: string, init?: RequestInit) => {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    return fetch(url, { ...init, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session?.access_token || ''}`, ...(init?.headers || {}) } });
  };

  const load = async () => {
    setError('');
    const [detailRes, draftsRes] = await Promise.all([authedFetch(`/api/project-inquiries/${id}`), authedFetch(`/api/project-inquiries/${id}/proposal-drafts`)]);
    const detailJson = await detailRes.json();
    const draftsJson = await draftsRes.json();
    if (!detailRes.ok) setError(detailJson.error || 'Gagal memuat detail inquiry.'); else setRow(detailJson.data);
    if (draftsRes.ok) setHistory((draftsJson.data || []) as ProjectInquiryProposalDraft[]);
  };

  useEffect(() => { load(); }, [id]);

  const patch = async (status: ProjectInquiry['status']) => { setUpdating(true); const res = await authedFetch(`/api/project-inquiries/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }); if (!res.ok) { const json = await res.json(); setError(json.error || 'Gagal memperbarui status inquiry.'); } await load(); setUpdating(false); };
  const copyText = async (text: string, message: string) => { if (!text) return; await navigator.clipboard.writeText(text); setCopyState(message); setTimeout(() => setCopyState(''), 2000); };

  const generateProposalDraft = async () => {
    setProposalLoading(true); setProposalError(''); setSaveMessage('');
    const res = await authedFetch(`/api/project-inquiries/${id}/proposal-draft`, { method: 'POST' }); const json = await res.json();
    if (!res.ok) { setProposalError(json.error || 'Draft proposal belum berhasil dibuat. Silakan coba lagi.'); setProposalLoading(false); return; }
    setProposalDraft(json.draft || ''); setFollowUpMessage(json.followUpMessage || ''); setProposalLoading(false);
  };

  const saveProposalDraft = async () => {
    if (!row || !proposalDraft) return;
    setSavingDraft(true); setSaveMessage('');
    const res = await authedFetch(`/api/project-inquiries/${id}/proposal-drafts`, { method: 'POST', body: JSON.stringify({ title: buildDraftTitle(row), draftContent: proposalDraft, followUpMessage, model: 'gpt-4o-mini' }) });
    if (!res.ok) {
      const json = await res.json().catch(() => null) as { code?: string; error?: string } | null;
      const code = json?.code;
      setSaveMessage(code ? `Draft proposal belum berhasil disimpan. Kode teknis: ${code}` : (json?.error || 'Draft proposal belum berhasil disimpan. Silakan coba lagi.'));
      setSavingDraft(false);
      return;
    }
    setSaveMessage('Draft proposal berhasil disimpan.'); await load(); setSavingDraft(false);
  };

  const updateDraftStatus = async (draftId: string, status: ProjectInquiryProposalDraftStatus) => {
    const res = await authedFetch(`/api/project-inquiries/${id}/proposal-drafts/${draftId}`, { method: 'PATCH', body: JSON.stringify({ status }) });
    if (!res.ok) { setError('Gagal memperbarui status draft proposal.'); return; }
    await load();
  };

  const sortedHistory = useMemo(() => [...history].sort((a, b) => {
    const w = (v: ProjectInquiryProposalDraftStatus) => v === 'archived' ? 1 : 0;
    const d = w(a.status) - w(b.status);
    return d !== 0 ? d : new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  }), [history]);

  if (!row && !error) return <p className="text-white/60">Memuat detail...</p>;
  if (error && !row) return <p className="rounded-xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>;
  if (!row) return null;

  return <div className="space-y-6">{/* trimmed unchanged top actions for brevity */}
    <div className="flex flex-wrap gap-3"><button onClick={() => copyText(row.message_preview, 'Pesan berhasil disalin.')} className="rounded-full border border-white/20 px-4 py-2 text-xs">Salin Pesan WhatsApp</button><button disabled={updating} onClick={() => patch('ditinjau')} className="rounded-full border border-white/20 px-4 py-2 text-xs disabled:opacity-50">Tandai Ditinjau</button></div>

    <section className="space-y-4 rounded-2xl border border-[#D4AF37]/30 bg-[#D4AF37]/[0.04] p-5">
      <h2 className="text-base font-semibold text-[#F4F1EA]">Draft Proposal AI</h2>
      <p className="text-sm text-white/70">Buat dan simpan draft proposal awal berdasarkan data inquiry. Draft dapat disalin, digunakan sebagai follow-up, atau diarsipkan.</p>
      <button onClick={generateProposalDraft} disabled={proposalLoading} className="rounded-full border border-[#D4AF37]/45 px-4 py-2 text-xs text-[#D4AF37]">{proposalLoading ? 'Menyusun draft proposal...' : proposalDraft ? 'Generate Ulang' : 'Buat Draft Proposal dengan AI'}</button>
      {proposalError ? <p className="text-sm text-red-200">{proposalError}</p> : null}
      {proposalDraft ? <div className="space-y-3 rounded-xl border border-white/15 bg-black/20 p-4"><ProposalDraftRenderer content={proposalDraft} /><div className="flex flex-wrap gap-2"><button onClick={() => copyText(proposalDraft, 'Draft berhasil disalin.')} className="rounded-full border border-white/20 px-4 py-2 text-xs">Salin Draft Proposal</button><button onClick={saveProposalDraft} disabled={savingDraft} className="rounded-full border border-[#D4AF37]/45 px-4 py-2 text-xs text-[#D4AF37]">{savingDraft ? 'Menyimpan draft...' : 'Simpan Draft Proposal'}</button>{followUpMessage ? <button onClick={() => copyText(followUpMessage, 'Pesan follow-up berhasil disalin.')} className="rounded-full border border-white/20 px-4 py-2 text-xs">Salin Pesan Follow-up</button> : null}</div></div> : null}
      {followUpMessage ? <div className="whitespace-pre-wrap rounded-xl border border-white/15 bg-black/20 p-4 font-sans text-sm leading-relaxed text-white/85">{followUpMessage}</div> : null}
      {saveMessage ? <p className={`text-sm ${saveMessage.includes('berhasil') ? 'text-emerald-300' : 'text-red-200'}`}>{saveMessage}</p> : null}
    </section>

    <section className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.015] p-5">
      <h2 className="text-base font-semibold text-[#F4F1EA]">Riwayat Draft Proposal</h2>
      <p className="text-sm text-white/70">Draft yang pernah disimpan untuk inquiry ini.</p>
      {sortedHistory.length === 0 ? <p className="text-sm text-white/60">Belum ada draft proposal tersimpan.</p> : sortedHistory.map((draft) => <div key={draft.id} className={`rounded-xl border p-4 ${draft.status === 'archived' ? 'border-white/10 opacity-70' : 'border-white/20'}`}><div className="flex flex-wrap items-center gap-2 text-sm"><span className="font-semibold text-white">{draft.title}</span><span className="text-white/65">Versi {draft.version}</span><span className="rounded-full border border-[#D4AF37]/45 px-2 py-0.5 text-xs text-[#D4AF37]">{draft.status}</span></div><p className="mt-1 text-xs text-white/60">{new Date(draft.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}{draft.created_by ? ` • ${draft.created_by}` : ''}</p><p className="mt-2 text-sm text-white/80">{buildDraftPreview(draft.draft_content).slice(0, 180)}...</p><div className="mt-3 flex flex-wrap gap-2 text-xs"><button onClick={() => setExpandedId(expandedId === draft.id ? null : draft.id)} className="rounded-full border border-white/20 px-3 py-1">{expandedId === draft.id ? 'Tutup Draft' : 'Lihat Draft'}</button><button onClick={() => copyText(draft.draft_content, 'Draft berhasil disalin.')} className="rounded-full border border-white/20 px-3 py-1">Salin Draft</button>{draft.follow_up_message ? <button onClick={() => copyText(draft.follow_up_message || '', 'Pesan follow-up berhasil disalin.')} className="rounded-full border border-white/20 px-3 py-1">Salin Pesan Follow-up</button> : null}{draft.status !== 'used' && draft.status !== 'archived' ? <button onClick={() => updateDraftStatus(draft.id, 'used')} className="rounded-full border border-white/20 px-3 py-1">Tandai Digunakan</button> : null}{draft.status !== 'archived' ? <button onClick={() => updateDraftStatus(draft.id, 'archived')} className="rounded-full border border-white/20 px-3 py-1">Arsipkan Draft</button> : <button onClick={() => updateDraftStatus(draft.id, 'draft')} className="rounded-full border border-white/20 px-3 py-1">Kembalikan ke Draft</button>}</div>{draft.status === 'used' ? <p className="mt-2 text-xs text-white/65">Draft ini ditandai sebagai draft yang digunakan untuk follow-up. Jika sudah menghubungi calon klien, tandai inquiry sebagai Dihubungi.</p> : null}{expandedId === draft.id ? <div className="mt-3 space-y-2 rounded-lg border border-white/10 bg-black/20 p-3"><ProposalDraftRenderer content={draft.draft_content} />{draft.follow_up_message ? <div className="whitespace-pre-wrap rounded-lg border border-white/10 bg-black/30 p-3 font-sans text-xs leading-relaxed text-white/75">{draft.follow_up_message}</div> : null}</div> : null}</div>)}
    </section>
    {copyState ? <p className="text-xs text-emerald-300">{copyState}</p> : null}
  </div>;
}
