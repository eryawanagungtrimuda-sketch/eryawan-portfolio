'use client';

import { useCallback, useEffect, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';

type NotificationStatus =
  | 'checking'
  | 'active'
  | 'inactive'
  | 'unconfigured'
  | 'unsupported'
  | 'permission-denied'
  | 'error';

type PushConfig = {
  configured: boolean;
  publicKey: string | null;
  error?: string;
};

function decodeApplicationServerKey(value: string) {
  const padding = '='.repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let index = 0; index < raw.length; index += 1) {
    output[index] = raw.charCodeAt(index);
  }
  return output;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Terjadi kendala saat mengatur notifikasi.';
}

export default function AdminInquiryNotifications() {
  const [status, setStatus] = useState<NotificationStatus>('checking');
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const authedFetch = useCallback(async (url: string, init?: RequestInit) => {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    const headers = new Headers(init?.headers);
    headers.set('Content-Type', 'application/json');
    if (session?.access_token) headers.set('Authorization', 'Bearer ' + session.access_token);
    return fetch(url, { ...init, headers });
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function initialize() {
      if (
        typeof window === 'undefined' ||
        !window.isSecureContext ||
        !('serviceWorker' in navigator) ||
        !('PushManager' in window) ||
        !('Notification' in window)
      ) {
        if (!cancelled) setStatus('unsupported');
        return;
      }

      try {
        const response = await authedFetch('/api/admin/push-subscriptions');
        const result = (await response.json()) as PushConfig;
        if (!response.ok) throw new Error(result.error || 'Tidak dapat memeriksa pengaturan notifikasi.');
        if (!result.configured || !result.publicKey) {
          if (!cancelled) {
            setPublicKey(null);
            setStatus('unconfigured');
          }
          return;
        }
        if (cancelled) return;
        setPublicKey(result.publicKey);

        const registration = await navigator.serviceWorker.register('/sw.js');
        const subscription = await registration.pushManager.getSubscription();
        if (cancelled) return;
        if (subscription) {
          const saveResponse = await authedFetch('/api/admin/push-subscriptions', {
            method: 'POST',
            body: JSON.stringify(subscription.toJSON()),
          });
          if (!saveResponse.ok) {
            const saveResult = await saveResponse.json().catch(() => ({}));
            throw new Error(saveResult.error || 'Gagal menyelaraskan langganan notifikasi.');
          }
          if (!cancelled) setStatus('active');
        } else if (Notification.permission === 'denied') {
          setStatus('permission-denied');
        } else {
          setStatus('inactive');
        }
      } catch (caught) {
        if (!cancelled) {
          setError(getErrorMessage(caught));
          setStatus('error');
        }
      }
    }

    void initialize();
    return () => {
      cancelled = true;
    };
  }, [authedFetch]);

  const toggleNotifications = async () => {
    setBusy(true);
    setError('');
    try {
      if (status === 'active') {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          const endpoint = subscription.endpoint;
          await subscription.unsubscribe();
          const response = await authedFetch('/api/admin/push-subscriptions', {
            method: 'DELETE',
            body: JSON.stringify({ endpoint }),
          });
          if (!response.ok) {
            const result = await response.json().catch(() => ({}));
            throw new Error(result.error || 'Gagal menonaktifkan notifikasi.');
          }
        }
        setStatus('inactive');
        return;
      }

      if (!publicKey) {
        setStatus('unconfigured');
        return;
      }

      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setStatus(permission === 'denied' ? 'permission-denied' : 'inactive');
        setError(
          permission === 'denied'
            ? 'Izin notifikasi diblokir. Ubah izin notifikasi situs di pengaturan browser, lalu muat ulang halaman.'
            : 'Izin belum diberikan. Tekan tombol aktivasi lagi jika ingin mencoba kembali.'
        );
        return;
      }

      const registration = await navigator.serviceWorker.register('/sw.js');
      let subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: decodeApplicationServerKey(publicKey) as unknown as BufferSource,
        });
      }

      const response = await authedFetch('/api/admin/push-subscriptions', {
        method: 'POST',
        body: JSON.stringify(subscription.toJSON()),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Gagal menyimpan pengaturan notifikasi.');

      setStatus('active');
    } catch (caught) {
      setError(getErrorMessage(caught));
      setStatus('error');
    } finally {
      setBusy(false);
    }
  };

  const statusMessage: Record<NotificationStatus, string> = {
    checking: 'Memeriksa status notifikasi pada browser ini...',
    active: 'Aktif di browser ini. Notifikasi inquiry baru dapat muncul meskipun tab website tidak terbuka, selama browser dan sistem operasi mendukungnya.',
    inactive: 'Belum aktif. Aktifkan sekali pada browser ini agar inquiry baru dapat mengirim notifikasi desktop.',
    unconfigured: 'Fitur menunggu pengaturan server satu kali sebelum dapat diaktifkan.',
    unsupported: 'Browser atau koneksi ini tidak mendukung notifikasi desktop. Gunakan browser desktop modern melalui HTTPS.',
    'permission-denied': 'Izin notifikasi diblokir oleh browser. Izinkan notifikasi untuk website ini, lalu muat ulang halaman.',
    error: 'Status notifikasi belum dapat dipastikan. Periksa koneksi dan coba lagi.',
  };

  const disabled =
    busy ||
    status === 'checking' ||
    status === 'unsupported' ||
    status === 'unconfigured' ||
    status === 'permission-denied' ||
    (!publicKey && status !== 'active');

  return (
    <section
      aria-label="Pengaturan notifikasi inquiry"
      className="rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/[0.035] p-5"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-3xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-[#D4AF37]">
            Notifikasi Desktop
          </p>
          <h2 className="mt-2 text-lg font-semibold text-white/90">
            Dapatkan pemberitahuan inquiry baru
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/60" role="status">
            {statusMessage[status]}
          </p>
          {error ? (
            <p className="mt-2 text-sm leading-6 text-red-200" role="alert">
              {error}
            </p>
          ) : null}
        </div>
        <button
          type="button"
          onClick={toggleNotifications}
          disabled={disabled}
          className="shrink-0 rounded-full border border-[#D4AF37]/45 px-4 py-3 text-xs font-semibold text-[#E4C65A] transition hover:bg-[#D4AF37]/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy
            ? 'Memproses...'
            : status === 'active'
              ? 'Nonaktifkan di browser ini'
              : status === 'error'
                ? 'Coba Lagi'
                : 'Aktifkan Notifikasi Desktop'}
        </button>
      </div>
    </section>
  );
}
