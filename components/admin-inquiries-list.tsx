'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import type { ProjectInquiry } from '@/lib/types';
import { useToast } from '@/components/toast-provider';
import { servicePackages } from '@/lib/service-packages';

type StatusFilter = 'active' | 'all_with_archive' | ProjectInquiry['status'];

const statusStyle: Record<ProjectInquiry['status'], string> = {
  baru: 'text-amber-200 bg-amber-400/10 border-amber-300/30',
  ditinjau: 'text-sky-200 bg-sky-400/10 border-sky-300/30',
  dihubungi: 'text-violet-200 bg-violet-400/10 border-violet-300/30',
  selesai: 'text-emerald-200 bg-emerald-400/10 border-emerald-300/30',
  arsip: 'text-white/65 bg-white/5 border-white/20',
};

const tableHeaderClass =
  'px-3 py-3 align-bottom text-left text-[11px] font-semibold leading-4 tracking-wide text-white/55';
const tableCellClass =
  'border-t border-white/10 px-3 py-4 align-top whitespace-normal break-words text-sm leading-5 text-white/80';

const formatTanggalMasuk = (dateValue: string) =>
  new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(dateValue));

function getPackageLabel(packageId: string | null) {
  return servicePackages.find((item) => item.id === packageId)?.title || 'Belum dipilih';
}

function getSourceLabel(row: ProjectInquiry) {
  if (row.utm_source) {
    return [row.utm_source, row.utm_medium, row.utm_campaign].filter(Boolean).join(' / ');
  }
  return row.source === 'mulai_project' ? 'Website (tanpa UTM)' : row.source || '—';
}

export default function AdminInquiriesList() {
  const [rows, setRows] = useState<ProjectInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active');
  const [dateFilter, setDateFilter] = useState('');
  const { toast } = useToast();

  const authedFetch = useCallback(async (url: string, init?: RequestInit) => {
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
  }, []);

  const load = useCallback(async () => {
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
  }, [authedFetch]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      if (statusFilter === 'active' && row.status === 'arsip') return false;
      if (statusFilter === 'arsip' && row.status !== 'arsip') return false;
      if (statusFilter !== 'active' && statusFilter !== 'all_with_archive' && statusFilter !== 'arsip' && row.status !== statusFilter) return false;
      if (dateFilter && !row.created_at.startsWith(dateFilter)) return false;
      if (!query.trim()) return true;

      const search = query.trim().toLowerCase();
      return [
        row.nama,
        row.status,
        row.jenis_kebutuhan,
        row.jenis_proyek || '',
        row.perusahaan || '',
        getPackageLabel(row.paket_id),
        getSourceLabel(row),
      ].some((field) => field.toLowerCase().includes(search));
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
      const errorMessage = json.error || 'Gagal memperbarui status inquiry.';
      setError(errorMessage);
      toast({ type: 'error', title: 'Update status gagal', description: errorMessage });
    } else {
      toast({ type: 'success', title: 'Status diperbarui', description: `Inquiry ditandai sebagai ${status}.` });
    }

    await load();
    setUpdatingId(null);
  };

  const resetFilter = () => {
    setQuery('');
    setStatusFilter('active');
    setDateFilter('');
  };

  if (loading) {
    return (
      <section className="space-y-4" aria-label="Memuat inquiry" aria-busy="true">
        <div className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="premium-skeleton h-10 w-full" />
          <div className="grid gap-3 md:grid-cols-3">
            <div className="premium-skeleton h-10" />
            <div className="premium-skeleton h-10" />
            <div className="premium-skeleton h-10" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <div className="premium-skeleton h-3 w-24" />
              <div className="premium-skeleton h-10 w-16" />
            </div>
          ))}
        </div>
        <div className="space-y-3 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.015] p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="grid grid-cols-8 gap-3">
              <div className="premium-skeleton col-span-2 h-8" />
              <div className="premium-skeleton h-8" />
              <div className="premium-skeleton h-8" />
              <div className="premium-skeleton h-8" />
              <div className="premium-skeleton h-8" />
              <div className="premium-skeleton h-8" />
              <div className="premium-skeleton h-8" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      {error ? <p className="rounded-xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-200">{error}</p> : null}

      <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:grid-cols-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari nama, perusahaan, paket, sumber, atau kebutuhan"
          className="rounded-xl border border-white/15 bg-[#10100e] px-4 py-2 text-sm text-white/90 outline-none focus:border-[#D4AF37] md:col-span-2"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
          className="rounded-xl border border-white/15 bg-[#10100e] px-4 py-2 text-sm text-white/90 outline-none focus:border-[#D4AF37]"
        >
          <option value="active">Semua status aktif</option>
          <option value="baru">Baru</option>
          <option value="ditinjau">Ditinjau</option>
          <option value="dihubungi">Dihubungi</option>
          <option value="selesai">Selesai</option>
          <option value="arsip">Arsip</option>
          <option value="all_with_archive">Semua termasuk arsip</option>
        </select>
        <div className="space-y-1">
          <label className="text-xs text-white/60">Tanggal masuk</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(event) => setDateFilter(event.target.value)}
            className="w-full rounded-xl border border-white/15 bg-[#10100e] px-4 py-2 text-sm text-white/90 outline-none focus:border-[#D4AF37]"
          />
        </div>
        <button
          onClick={resetFilter}
          className="rounded-xl border border-white/20 px-4 py-2 text-sm text-white/80 transition hover:border-[#D4AF37]/50 hover:text-[#D4AF37]"
        >
          Reset Filter
        </button>
      </div>

      <div className="space-y-2">
        <p className="text-xs text-white/55">Menampilkan inquiry aktif. Arsip dapat dilihat melalui filter status.</p>
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
      </div>

      <div
        className="overflow-x-auto overscroll-x-contain rounded-2xl border border-white/10 bg-white/[0.015]"
        aria-label="Daftar inquiry; geser horizontal untuk melihat semua kolom"
      >
        <table className="w-full min-w-[1650px] table-fixed border-collapse text-sm">
          <colgroup>
            <col className="w-[130px]" />
            <col className="w-[130px]" />
            <col className="w-[160px]" />
            <col className="w-[160px]" />
            <col className="w-[145px]" />
            <col className="w-[180px]" />
            <col className="w-[110px]" />
            <col className="w-[130px]" />
            <col className="w-[110px]" />
            <col className="w-[140px]" />
            <col className="w-[255px]" />
          </colgroup>
          <thead className="bg-white/[0.025]">
            <tr>
              <th scope="col" className={tableHeaderClass}>Nama</th>
              <th scope="col" className={tableHeaderClass}>Perusahaan</th>
              <th scope="col" className={tableHeaderClass}>Jenis Kebutuhan</th>
              <th scope="col" className={tableHeaderClass}>Jenis Proyek</th>
              <th scope="col" className={tableHeaderClass}>Paket</th>
              <th scope="col" className={tableHeaderClass}>Sumber / Kampanye</th>
              <th scope="col" className={tableHeaderClass}>Timeline</th>
              <th scope="col" className={tableHeaderClass}>Range Budget</th>
              <th scope="col" className={tableHeaderClass}>Status</th>
              <th scope="col" className={tableHeaderClass}>Tanggal Masuk</th>
              <th scope="col" className={tableHeaderClass}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.length === 0 ? (
              <tr>
                <td colSpan={11} className="border-t border-white/10 p-10 text-center">
                  <p className="text-base font-semibold text-white/85">Tidak ada inquiry yang cocok</p>
                  <p className="mt-1 text-sm text-white/55">Coba ubah kata kunci, status, atau tanggal filter.</p>
                </td>
              </tr>
            ) : (
              filteredRows.map((r) => (
                <tr key={r.id} className="transition-colors hover:bg-white/[0.025]">
                  <td className={`${tableCellClass} font-semibold text-white/95`}>{r.nama}</td>
                  <td className={tableCellClass}>{r.perusahaan || '—'}</td>
                  <td className={tableCellClass}>{r.jenis_kebutuhan}</td>
                  <td className={tableCellClass}>{r.jenis_proyek || '—'}</td>
                  <td className={tableCellClass}>{r.paket_id ? getPackageLabel(r.paket_id) : '—'}</td>
                  <td className={tableCellClass} title={getSourceLabel(r)}>{getSourceLabel(r)}</td>
                  <td className={tableCellClass}>{r.timeline || '—'}</td>
                  <td className={tableCellClass}>{r.budget_range || '—'}</td>
                  <td className={tableCellClass}>
                    <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-xs ${statusStyle[r.status]}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className={`${tableCellClass} whitespace-nowrap`}>{formatTanggalMasuk(r.created_at)}</td>
                  <td className={tableCellClass}>
                    <div className="flex min-w-[230px] flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/inquiries/${r.id}`}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-white/20 px-3 py-2 text-xs leading-none transition hover:border-[#D4AF37]/50 hover:text-[#D4AF37]"
                      >
                        Detail
                      </Link>
                      {(r.status === 'baru' || r.status === 'ditinjau') && (
                        <button
                          disabled={updatingId === r.id}
                          onClick={() => patch(r.id, 'dihubungi')}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-[#D4AF37]/35 px-3 py-2 text-xs leading-none text-[#D4AF37] disabled:opacity-50"
                        >
                          Tandai Dihubungi
                        </button>
                      )}
                      {r.status === 'dihubungi' && (
                        <button
                          disabled={updatingId === r.id}
                          onClick={() => patch(r.id, 'selesai')}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-emerald-400/35 px-3 py-2 text-xs leading-none text-emerald-300 disabled:opacity-50"
                        >
                          Tandai Selesai
                        </button>
                      )}
                      {r.status === 'arsip' ? (
                        <button
                          disabled={updatingId === r.id}
                          onClick={() => patch(r.id, 'baru')}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-sky-400/35 px-3 py-2 text-xs leading-none text-sky-200 disabled:opacity-50"
                        >
                          Kembalikan ke Baru
                        </button>
                      ) : (
                        <button
                          disabled={updatingId === r.id}
                          onClick={() => patch(r.id, 'arsip')}
                          className="inline-flex items-center justify-center whitespace-nowrap rounded-full border border-white/20 px-3 py-2 text-xs leading-none text-white/70 disabled:opacity-50"
                        >
                          Arsipkan
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
