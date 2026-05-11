'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import type { ProjectInquiry } from '@/lib/types';

const statusStyle: Record<ProjectInquiry['status'], string> = {
  baru: 'text-amber-200 bg-amber-400/10 border-amber-300/30',
  ditinjau: 'text-sky-200 bg-sky-400/10 border-sky-300/30',
  dihubungi: 'text-violet-200 bg-violet-400/10 border-violet-300/30',
  selesai: 'text-emerald-200 bg-emerald-400/10 border-emerald-300/30',
  arsip: 'text-white/65 bg-white/5 border-white/20',
};

export default function AdminInquiriesList() {
  const [rows, setRows] = useState<ProjectInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ProjectInquiry['status']>('all');
  const [dateFilter, setDateFilter] = useState('');

  const authedFetch = async (url: string, init?: RequestInit) => {
    const supabase = createSupabaseBrowserClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();

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
    setLoading(true);
    setError('');
    const res = await authedFetch('/api/project-inquiries');
    const json = await res.json();

    if (!res.ok) {
      setError(json.error || 'Gagal memuat inquiry.');
    } else {
      setRows(json.data || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;
      if (dateFilter && !row.created_at.startsWith(dateFilter)) return false;
      if (!query.trim()) return true;

      const search = query.trim().toLowerCase();
      return [row.nama, row.status, row.jenis_kebutuhan, row.perusahaan || ''].some((field) => field.toLowerCase().includes(search));
    });
  }, [dateFilter, query, rows, statusFilter]);

  const stats = useMemo(
    () => ({
      total: filteredRows.length,
      baru: filteredRows.filter((r) => r.status === 'baru').length,
      progress: filteredRows.filter((r) => r.status === 'ditinjau' || r.status === 'dihubungi').length,
      selesai: filteredRows.filter((r) => r.status === 'selesai').length,
    }),
    [filteredRows],
  );

  const patch = async (id: string, status: ProjectInquiry['status']) => {
    setUpdatingId(id);
    setError('');
    const res = await authedFetch(`/api/project-inquiries/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });

    if (!res.ok) {
      const json = await res.json();
      setError(json.error || 'Gagal memperbarui status inquiry.');
    }

    await load();
    setUpdatingId(null);
  };

  if (loading) return <p className="text-white/60">Memuat inquiry...</p>;

  return (
    <div className="space-y-6">
      {error ? <p className="rounded-xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-200">{error}</p> : null}

      <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:grid-cols-3">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari nama / status / kebutuhan"
          className="rounded-xl border border-white/15 bg-[#10100e] px-4 py-2 text-sm text-white/90 outline-none focus:border-[#D4AF37]"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as 'all' | ProjectInquiry['status'])}
          className="rounded-xl border border-white/15 bg-[#10100e] px-4 py-2 text-sm text-white/90 outline-none focus:border-[#D4AF37]"
        >
          <option value="all">Semua status</option>
          <option value="baru">Baru</option>
          <option value="ditinjau">Ditinjau</option>
          <option value="dihubungi">Dihubungi</option>
          <option value="selesai">Selesai</option>
          <option value="arsip">Arsip</option>
        </select>
        <input
          type="date"
          value={dateFilter}
          onChange={(event) => setDateFilter(event.target.value)}
          className="rounded-xl border border-white/15 bg-[#10100e] px-4 py-2 text-sm text-white/90 outline-none focus:border-[#D4AF37]"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Total Inquiry', stats.total],
          ['Baru', stats.baru],
          ['Ditinjau / Dihubungi', stats.progress],
          ['Selesai', stats.selesai],
        ].map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">{label}</p>
            <p className="mt-3 font-display text-4xl">{String(value)}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.015]">
        <table className="min-w-[950px] w-full text-sm">
          <thead>
            <tr className="text-left text-white/45">
              <th className="p-4">Nama</th><th>Perusahaan</th><th>Jenis kebutuhan</th><th>Timeline</th><th>Budget range</th><th>Status</th><th>Created at</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r) => (
              <tr key={r.id} className="border-t border-white/10">
                <td className="p-4 font-semibold">{r.nama}</td><td>{r.perusahaan || '—'}</td><td>{r.jenis_kebutuhan}</td><td>{r.timeline || '—'}</td><td>{r.budget_range || '—'}</td>
                <td><span className={`rounded-full border px-3 py-1 text-xs ${statusStyle[r.status]}`}>{r.status}</span></td>
                <td>{new Date(r.created_at).toLocaleDateString('id-ID')}</td>
                <td className="space-x-2">
                  <Link href={`/admin/inquiries/${r.id}`} className="rounded-full border border-white/20 px-3 py-2 text-xs hover:border-[#D4AF37]/50 hover:text-[#D4AF37]">Detail</Link>
                  <button disabled={updatingId === r.id} onClick={() => patch(r.id, 'dihubungi')} className="rounded-full border border-[#D4AF37]/35 px-3 py-2 text-xs text-[#D4AF37] disabled:opacity-50">Tandai Dihubungi</button>
                  <button disabled={updatingId === r.id} onClick={() => patch(r.id, 'arsip')} className="rounded-full border border-white/20 px-3 py-2 text-xs text-white/70 disabled:opacity-50">Arsipkan</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
