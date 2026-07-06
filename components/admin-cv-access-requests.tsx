'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabaseClient';

type CvRequest = { id:string; full_name:string; email:string; company:string|null; role:string|null; purpose:string; linkedin_url:string|null; whatsapp:string|null; status:'pending'|'approved'|'rejected'; admin_note:string|null; created_at:string; download_expires_at:string|null; download_count:number|null };
type RequestFilter = CvRequest['status'] | 'all';

const statusLabels = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected' };
const filterLabels: Record<RequestFilter, string> = { pending: 'Pending', approved: 'Approved', rejected: 'Rejected', all: 'Semua' };
const compactPendingLimit = 3;

export default function AdminCvAccessRequests() {
  const [items, setItems] = useState<CvRequest[]>([]), [loading, setLoading] = useState(true), [message, setMessage] = useState(''), [busy, setBusy] = useState<string|null>(null), [links, setLinks] = useState<Record<string,string>>({});
  const [activeFilter, setActiveFilter] = useState<RequestFilter>('pending');
  const [showAllPending, setShowAllPending] = useState(false);
  const [openDetails, setOpenDetails] = useState<Record<string, boolean>>({});

  async function authHeader(): Promise<Record<string, string>> { const { data } = await getSupabaseClient().auth.getSession(); return data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}; }
  const load = useCallback(async () => { setLoading(true); setMessage(''); try { const res = await fetch('/api/admin/cv-access-requests', { headers: await authHeader() }); const json = await res.json(); if (!res.ok) throw new Error(json.error); setItems(json.data || []); } catch(e) { setMessage(e instanceof Error ? e.message : 'Gagal memuat permintaan.'); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  async function setStatus(id:string, status:CvRequest['status']) { setBusy(id); try { const res = await fetch(`/api/admin/cv-access-requests/${id}`, { method:'PATCH', headers: { 'Content-Type':'application/json', ...(await authHeader()) }, body: JSON.stringify({ status }) }); const json = await res.json().catch(() => ({})); if (!res.ok) throw new Error(json.error); await load(); } catch(e) { setMessage(e instanceof Error ? e.message : 'Gagal update status.'); } finally { setBusy(null); } }
  async function makeLink(id:string) { setBusy(id); try { const res = await fetch(`/api/admin/cv-access-requests/${id}/download-link`, { method:'POST', headers: await authHeader() }); const json = await res.json(); if (!res.ok) throw new Error(json.error); setLinks((prev) => ({ ...prev, [id]: json.signedUrl })); await load(); } catch(e) { setMessage(e instanceof Error ? e.message : 'Gagal membuat link.'); } finally { setBusy(null); } }
  async function copy(id:string) { await navigator.clipboard.writeText(links[id]); setMessage('Link download disalin. Link berlaku 24 jam.'); }
  const pendingCount = items.filter((item) => item.status === 'pending').length;
  const counts = useMemo(() => ({ pending: pendingCount, approved: items.filter((item) => item.status === 'approved').length, rejected: items.filter((item) => item.status === 'rejected').length, all: items.length }), [items, pendingCount]);
  const filteredItems = useMemo(() => {
    const sortedItems = [...items].sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    const visibleByFilter = activeFilter === 'all' ? sortedItems : sortedItems.filter((item) => item.status === activeFilter);
    return activeFilter === 'pending' && !showAllPending ? visibleByFilter.slice(0, compactPendingLimit) : visibleByFilter;
  }, [activeFilter, items, showAllPending]);
  const hasHiddenPending = activeFilter === 'pending' && pendingCount > compactPendingLimit;
  const scrollToRequests = () => document.getElementById('cv-access-requests')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const toggleDetail = (id: string) => setOpenDetails((prev) => ({ ...prev, [id]: !prev[id] }));

  return <>
    {!loading && pendingCount > 0 ? <div className="mt-8 rounded-3xl border border-[#D4AF37]/25 bg-[#D4AF37]/10 p-5 text-[#F4E4B2] shadow-[0_18px_60px_rgba(212,175,55,0.08)] sm:flex sm:items-center sm:justify-between sm:gap-4"><p className="text-sm font-semibold">Ada {pendingCount} permintaan akses CV menunggu review.</p><button onClick={scrollToRequests} className="mt-4 rounded-full bg-[#C8A951] px-4 py-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-[#080807] transition hover:bg-[#D7BD72] sm:mt-0">Lihat Permintaan CV</button></div> : null}
    <section id="cv-access-requests" className="mt-8 scroll-mt-8 rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-6">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-mono text-[10px] font-black uppercase tracking-[0.28em] text-[#D4AF37]">Permintaan Akses CV</p><p className="mt-2 text-sm text-white/55">Review request secara ringkas. Detail panjang disembunyikan agar dashboard tetap compact.</p></div><button onClick={load} className="rounded-full border border-white/10 px-4 py-2 text-xs text-white/70 hover:border-[#D4AF37]/40">Refresh</button></div>
    <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
      {(Object.keys(filterLabels) as RequestFilter[]).map((filter) => <button key={filter} onClick={() => { setActiveFilter(filter); setShowAllPending(false); }} className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition ${activeFilter === filter ? 'border-[#D4AF37]/60 bg-[#D4AF37]/15 text-[#F4E4B2]' : 'border-white/10 bg-black/20 text-white/55 hover:border-[#D4AF37]/30 hover:text-white/80'}`}>{filterLabels[filter]} <span className="ml-1 text-[10px] opacity-70">{counts[filter]}</span></button>)}
    </div>
    {message ? <p className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-sm text-white/70">{message}</p> : null}
    {loading ? <p className="mt-5 text-sm text-white/50">Memuat permintaan...</p> : <div className="mt-5 grid gap-2.5">{filteredItems.length === 0 ? <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/45">Tidak ada permintaan di tab {filterLabels[activeFilter]}.</p> : filteredItems.map((item) => <article key={item.id} className={`rounded-2xl border p-3 transition ${item.status === 'pending' ? 'border-[#D4AF37]/20 bg-[#0b0b0a]' : 'border-white/10 bg-[#090908]/70 opacity-85'}`}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="truncate font-semibold text-[#F4F1EA]">{item.full_name}</h3><span className={`rounded-full border px-2 py-0.5 text-[10px] uppercase ${item.status === 'pending' ? 'border-[#D4AF37]/30 text-[#D4AF37]' : 'border-white/10 text-white/45'}`}>{statusLabels[item.status]}</span></div><p className="mt-1 truncate text-xs text-white/50">{item.email}</p><p className="mt-1 text-xs text-white/45">{item.company || '—'} · {item.role || '—'} · {new Date(item.created_at).toLocaleDateString('id-ID')}</p></div><div className="flex shrink-0 flex-wrap gap-2"><button onClick={() => toggleDetail(item.id)} className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/65 hover:border-[#D4AF37]/35 hover:text-[#F4E4B2]">{openDetails[item.id] ? 'Sembunyikan Detail' : 'Lihat Detail'}</button>{item.status !== 'approved' ? <button disabled={busy===item.id} onClick={() => setStatus(item.id,'approved')} className="rounded-full bg-[#C8A951] px-3 py-2 text-xs font-semibold text-[#080807] disabled:opacity-50">Setujui</button> : null}{item.status !== 'rejected' ? <button disabled={busy===item.id} onClick={() => setStatus(item.id,'rejected')} className="rounded-full border border-red-300/30 px-3 py-2 text-xs text-red-200 disabled:opacity-50">Tolak</button> : null}{item.status === 'approved' ? <button disabled={busy===item.id} onClick={() => makeLink(item.id)} className="rounded-full border border-[#D4AF37]/25 px-3 py-2 text-xs text-[#F4E4B2] disabled:opacity-50">Buat Link Download</button> : null}</div></div>
      {openDetails[item.id] ? <div className="mt-3 grid gap-2 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-white/60 sm:grid-cols-2"><p className="sm:col-span-2"><span className="text-white/40">Tujuan:</span> {item.purpose}</p><p className="break-all"><span className="text-white/40">LinkedIn:</span> {item.linkedin_url || '—'}</p><p><span className="text-white/40">WhatsApp:</span> {item.whatsapp || '—'}</p>{item.download_expires_at ? <p><span className="text-white/40">Link aktif sampai:</span> {new Date(item.download_expires_at).toLocaleString('id-ID')}</p> : null}{item.admin_note ? <p className="sm:col-span-2"><span className="text-white/40">Admin note:</span> {item.admin_note}</p> : null}{typeof item.download_count === 'number' ? <p><span className="text-white/40">Download:</span> {item.download_count}</p> : null}</div> : null}
      {links[item.id] ? <div className="mt-3 rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/10 p-3"><p className="break-all text-xs text-[#F4E4B2]">{links[item.id]}</p><button onClick={() => copy(item.id)} className="mt-2 rounded-full bg-[#C8A951] px-3 py-1.5 text-xs font-semibold text-[#080807]">Copy Link Download</button><span className="ml-3 text-xs text-white/50">Link berlaku 24 jam</span></div> : null}</article>)}{hasHiddenPending ? <button onClick={() => setShowAllPending((value) => !value)} className="mt-1 rounded-2xl border border-[#D4AF37]/25 bg-[#D4AF37]/10 px-4 py-3 text-xs font-semibold text-[#F4E4B2] hover:bg-[#D4AF37]/15">{showAllPending ? 'Sembunyikan' : 'Lihat Semua'}</button> : null}</div>}
  </section>
  </>;
}
