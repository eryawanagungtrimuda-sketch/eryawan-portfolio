'use client';

import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase';

type Stage = 'dp' | 'progress' | 'final';
type InvoiceStatus = 'draft' | 'waiting_approval' | 'approved' | 'sent' | 'cancelled';
type ReminderChannel = 'whatsapp' | 'email';
type ReminderStatus = 'draft' | 'waiting_approval' | 'approved' | 'sent' | 'archived';

type InvoiceSettings = {
  id: number;
  billing_name: string | null;
  billing_contact: string | null;
  billing_address: string | null;
  qris_image_path: string | null;
  tax_note: string;
};

type BillingProfile = {
  id: string;
  inquiry_id: string;
  agreed_total_fee: number;
  created_at: string;
  updated_at: string;
};

type InvoicePayment = {
  id: string;
  amount: number;
  paid_at: string;
  payment_method: string;
  reference: string | null;
  notes: string | null;
  verified_by: string;
  verified_at: string;
};

type InvoiceReminder = {
  id: string;
  channel: ReminderChannel;
  reminder_type: 'h_minus_1' | 'due_today' | 'overdue';
  status: ReminderStatus;
  subject: string | null;
  message_body: string;
  created_at: string;
};

type InvoiceRecord = {
  id: string;
  invoice_number: string;
  installment_stage: Stage;
  installment_percentage: number;
  total_project_fee: number;
  amount_due: number;
  issue_date: string;
  due_date: string;
  invoice_status: InvoiceStatus;
  payment_status: 'unpaid' | 'partial' | 'paid';
  display_payment_status: 'unpaid' | 'partial' | 'paid' | 'overdue';
  sent_channel: string | null;
  client_name_snapshot: string;
  client_email_snapshot: string | null;
  client_whatsapp_snapshot: string | null;
  project_label_snapshot: string;
  billing_name_snapshot: string | null;
  billing_contact_snapshot: string | null;
  billing_address_snapshot: string | null;
  qris_image_path_snapshot: string | null;
  tax_note_snapshot: string;
  payments: InvoicePayment[];
  reminders: InvoiceReminder[];
};

type InquiryRecord = {
  id: string;
  nama: string;
  email: string | null;
  whatsapp: string | null;
  jenis_kebutuhan: string;
  jenis_proyek: string | null;
};

const stages: Array<{ value: Stage; label: string; percentage: number; description: string }> = [
  { value: 'dp', label: 'DP awal', percentage: 50, description: 'Sebelum pekerjaan dimulai' },
  { value: 'progress', label: 'Termin progres', percentage: 30, description: 'Saat presentasi progres desain' },
  { value: 'final', label: 'Termin final', percentage: 20, description: 'Sebelum hasil final diserahkan' },
];

const reminderTypes = [
  { value: 'h_minus_1', label: 'H-1 sebelum jatuh tempo' },
  { value: 'due_today', label: 'Tanggal jatuh tempo' },
  { value: 'overdue', label: 'Setelah terlambat' },
] as const;

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(value + 'T00:00:00Z'));
}

function localDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

function addCalendarDays(value: string, days: number) {
  const date = new Date(value + 'T12:00:00');
  date.setDate(date.getDate() + days);
  return localDateString(date);
}

function stageTitle(stage: Stage) {
  return stages.find((item) => item.value === stage)?.label || 'Termin pembayaran';
}

function stageAmount(total: number, stage: Stage) {
  const dp = Math.round(total * 0.5);
  const progress = Math.round(total * 0.3);
  if (stage === 'dp') return dp;
  if (stage === 'progress') return progress;
  return total - dp - progress;
}

function invoiceStatusTitle(status: InvoiceStatus) {
  const labels: Record<InvoiceStatus, string> = {
    draft: 'Draf',
    waiting_approval: 'Menunggu persetujuan',
    approved: 'Disetujui',
    sent: 'Terkirim',
    cancelled: 'Dibatalkan',
  };
  return labels[status];
}

function paymentStatusTitle(status: InvoiceRecord['display_payment_status']) {
  const labels = { unpaid: 'Belum dibayar', partial: 'Dibayar sebagian', paid: 'Lunas', overdue: 'Terlambat' };
  return labels[status];
}

function reminderStatusTitle(status: ReminderStatus) {
  const labels: Record<ReminderStatus, string> = {
    draft: 'Draf',
    waiting_approval: 'Menunggu persetujuan',
    approved: 'Disetujui',
    sent: 'Terkirim',
    archived: 'Arsip',
  };
  return labels[status];
}

function cleanWhatsappNumber(value: string) {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  if (digits.startsWith('0')) return '62' + digits.slice(1);
  return digits;
}

export default function AdminInvoiceWorkspace({ inquiryId }: { inquiryId: string }) {
  const [inquiry, setInquiry] = useState<InquiryRecord | null>(null);
  const [profile, setProfile] = useState<BillingProfile | null>(null);
  const [settings, setSettings] = useState<InvoiceSettings | null>(null);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [totalFeeInput, setTotalFeeInput] = useState('');
  const [stage, setStage] = useState<Stage>('dp');
  const [issueDate, setIssueDate] = useState(localDateString());
  const [dueDate, setDueDate] = useState(addCalendarDays(localDateString(), 3));
  const [reminderChannel, setReminderChannel] = useState<ReminderChannel>('whatsapp');
  const [reminderType, setReminderType] = useState<(typeof reminderTypes)[number]['value']>('due_today');
  const [paymentInvoiceId, setPaymentInvoiceId] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(localDateString());
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [reminderEdits, setReminderEdits] = useState<Record<string, { subject: string; message_body: string }>>({});
  const [printInvoiceId, setPrintInvoiceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const authedFetch = useCallback(async (url: string, init?: RequestInit) => {
    const supabase = createSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    return fetch(url, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + (session?.access_token || ''),
        ...(init?.headers || {}),
      },
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const results = await Promise.all([
        authedFetch('/api/project-inquiries/' + inquiryId + '/invoices'),
        authedFetch('/api/admin/invoice-settings'),
      ]);
      const invoiceJson = await results[0].json();
      const settingsJson = await results[1].json();

      if (!results[0].ok) {
        setError(invoiceJson.error || 'Gagal memuat data invoice.');
      } else {
        setInquiry(invoiceJson.inquiry || null);
        setProfile(invoiceJson.profile || null);
        setInvoices((invoiceJson.invoices || []) as InvoiceRecord[]);
        setTotalFeeInput(invoiceJson.profile ? String(invoiceJson.profile.agreed_total_fee) : '');
      }

      if (!results[1].ok) {
        setError((current) => current || settingsJson.error || 'Gagal memuat pengaturan invoice.');
      } else {
        setSettings(settingsJson.data as InvoiceSettings);
      }
    } catch {
      setError('Koneksi belum berhasil. Muat ulang Panel Inquiry lalu coba lagi.');
    } finally {
      setLoading(false);
    }
  }, [authedFetch, inquiryId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!printInvoiceId) return;
    const onAfterPrint = () => setPrintInvoiceId(null);
    window.addEventListener('afterprint', onAfterPrint);
    window.print();
    return () => window.removeEventListener('afterprint', onAfterPrint);
  }, [printInvoiceId]);

  const getQrisUrl = useCallback((path: string | null | undefined) => {
    if (!path) return '';
    try {
      return createSupabaseBrowserClient().storage.from('invoice-assets').getPublicUrl(path).data.publicUrl;
    } catch {
      return '';
    }
  }, []);

  const activeStages = useMemo(
    () => invoices.filter((invoice) => invoice.invoice_status !== 'cancelled').map((invoice) => invoice.installment_stage),
    [invoices],
  );

  const printInvoice = useMemo(
    () => invoices.find((invoice) => invoice.id === printInvoiceId) || null,
    [invoices, printInvoiceId],
  );

  const saveSettings = async () => {
    if (!settings) return;
    setBusy('settings');
    setError('');
    setNotice('');
    try {
      const response = await authedFetch('/api/admin/invoice-settings', {
        method: 'PATCH',
        body: JSON.stringify({
          billingName: settings.billing_name || '',
          billingContact: settings.billing_contact || '',
          billingAddress: settings.billing_address || '',
        }),
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error || 'Gagal menyimpan pengaturan invoice.');
      } else {
        setSettings(json.data as InvoiceSettings);
        setNotice('Pengaturan penagih tersimpan.');
      }
    } catch {
      setError('Pengaturan belum berhasil disimpan.');
    } finally {
      setBusy('');
    }
  };

  const uploadQris = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setError('QRIS harus berupa gambar PNG, JPG, atau WebP.');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError('Ukuran gambar QRIS maksimal 2 MB.');
      return;
    }

    setBusy('qris');
    setError('');
    setNotice('');
    try {
      const extension = file.type === 'image/png' ? 'png' : file.type === 'image/webp' ? 'webp' : 'jpg';
      const path = 'qris/qris-' + Date.now() + '.' + extension;
      const supabase = createSupabaseBrowserClient();
      const { error: uploadError } = await supabase.storage
        .from('invoice-assets')
        .upload(path, file, { contentType: file.type, cacheControl: '3600', upsert: false });

      if (uploadError) {
        setError('Gambar QRIS belum berhasil diunggah. Periksa koneksi dan izin admin.');
        return;
      }

      const response = await authedFetch('/api/admin/invoice-settings', {
        method: 'PATCH',
        body: JSON.stringify({ qrisImagePath: path }),
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error || 'Gambar terunggah, tetapi pengaturan QRIS belum tersimpan.');
      } else {
        setSettings(json.data as InvoiceSettings);
        setNotice('Gambar QRIS tersimpan. Invoice baru dapat memakai gambar ini setelah disetujui.');
      }
    } catch {
      setError('Gambar QRIS belum berhasil diunggah.');
    } finally {
      setBusy('');
    }
  };

  const saveProfile = async () => {
    const total = Number(totalFeeInput);
    if (!Number.isSafeInteger(total) || total < 100) {
      setError('Masukkan total biaya proyek minimal Rp100, dalam rupiah tanpa titik atau koma.');
      return;
    }
    setBusy('profile');
    setError('');
    setNotice('');
    try {
      const response = await authedFetch('/api/project-inquiries/' + inquiryId + '/invoices', {
        method: 'PATCH',
        body: JSON.stringify({ agreedTotalFee: total }),
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error || 'Gagal menyimpan total biaya proyek.');
      } else {
        setProfile(json.profile as BillingProfile);
        setNotice('Total biaya proyek tersimpan.');
        await load();
      }
    } catch {
      setError('Total biaya proyek belum berhasil disimpan.');
    } finally {
      setBusy('');
    }
  };

  const createInvoice = async () => {
    setBusy('create-invoice');
    setError('');
    setNotice('');
    try {
      const response = await authedFetch('/api/project-inquiries/' + inquiryId + '/invoices', {
        method: 'POST',
        body: JSON.stringify({ stage, issueDate, dueDate }),
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error || 'Gagal membuat draf invoice.');
      } else {
        setNotice('Draf invoice ' + json.data.invoice_number + ' berhasil dibuat. Invoice belum dikirim.');
        await load();
      }
    } catch {
      setError('Draf invoice belum berhasil dibuat.');
    } finally {
      setBusy('');
    }
  };

  const invoiceAction = async (invoice: InvoiceRecord, action: string, payload: Record<string, unknown> = {}) => {
    setBusy(invoice.id);
    setError('');
    setNotice('');
    try {
      const response = await authedFetch('/api/project-invoices/' + invoice.id, {
        method: 'PATCH',
        body: JSON.stringify({ action, ...payload }),
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error || 'Tindakan invoice belum berhasil.');
        return;
      }
      setNotice(action === 'record_payment' ? 'Pembayaran dicatat dan diverifikasi secara manual.' : 'Status invoice diperbarui.');
      await load();
    } catch {
      setError('Tindakan invoice belum berhasil.');
    } finally {
      setBusy('');
    }
  };

  const createReminder = async (invoice: InvoiceRecord) => {
    setBusy('reminder-' + invoice.id);
    setError('');
    setNotice('');
    try {
      const response = await authedFetch('/api/project-invoices/' + invoice.id + '/reminders', {
        method: 'POST',
        body: JSON.stringify({ channel: reminderChannel, reminderType }),
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error || 'Draf pengingat belum berhasil dibuat.');
      } else {
        setNotice('Draf pengingat dibuat dan belum dikirim.');
        await load();
      }
    } catch {
      setError('Draf pengingat belum berhasil dibuat.');
    } finally {
      setBusy('');
    }
  };

  const reminderAction = async (
    reminder: InvoiceReminder,
    action: string,
    payload: Record<string, unknown> = {},
  ) => {
    setBusy(reminder.id);
    setError('');
    setNotice('');
    try {
      const response = await authedFetch('/api/project-invoice-reminders/' + reminder.id, {
        method: 'PATCH',
        body: JSON.stringify({ action, ...payload }),
      });
      const json = await response.json();
      if (!response.ok) {
        setError(json.error || 'Tindakan pengingat belum berhasil.');
      } else {
        setNotice('Status draf pengingat diperbarui.');
        await load();
      }
    } catch {
      setError('Tindakan pengingat belum berhasil.');
    } finally {
      setBusy('');
    }
  };

  const openInvoiceChannel = (invoice: InvoiceRecord, channel: ReminderChannel) => {
    if (invoice.invoice_status !== 'approved') {
      setError('Invoice harus disetujui sebelum disiapkan untuk pengiriman.');
      return;
    }
    const message = 'Halo ' + invoice.client_name_snapshot + ', berikut invoice ' + invoice.invoice_number + ' untuk ' +
      stageTitle(invoice.installment_stage) + ' sebesar ' + formatRupiah(Number(invoice.amount_due)) +
      ', dengan jatuh tempo ' + formatDate(invoice.due_date) + '. Saya lampirkan file PDF invoice. Terima kasih.';
    if (channel === 'whatsapp') {
      const number = cleanWhatsappNumber(invoice.client_whatsapp_snapshot || '');
      if (!number) {
        setError('Nomor WhatsApp klien belum tersedia.');
        return;
      }
      window.open('https://wa.me/' + number + '?text=' + encodeURIComponent(message), '_blank', 'noopener,noreferrer');
      return;
    }
    const email = invoice.client_email_snapshot || '';
    if (!email) {
      setError('Email klien belum tersedia.');
      return;
    }
    const subject = 'Invoice ' + invoice.invoice_number + ' — Eryawan Agung';
    window.location.href = 'mailto:' + email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(message);
  };

  const openReminderChannel = (invoice: InvoiceRecord, reminder: InvoiceReminder) => {
    if (reminder.status !== 'approved') {
      setError('Draf pengingat harus disetujui sebelum dibuka untuk pengiriman.');
      return;
    }
    if (reminder.channel === 'whatsapp') {
      const number = cleanWhatsappNumber(invoice.client_whatsapp_snapshot || '');
      if (!number) {
        setError('Nomor WhatsApp klien belum tersedia.');
        return;
      }
      window.open('https://wa.me/' + number + '?text=' + encodeURIComponent(reminder.message_body), '_blank', 'noopener,noreferrer');
      return;
    }
    const email = invoice.client_email_snapshot || '';
    if (!email) {
      setError('Email klien belum tersedia.');
      return;
    }
    window.location.href = 'mailto:' + email + '?subject=' + encodeURIComponent(reminder.subject || 'Pengingat pembayaran') +
      '&body=' + encodeURIComponent(reminder.message_body);
  };

  if (loading) {
    return <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-sm text-white/60">Memuat workspace invoice dan pembayaran…</section>;
  }

  const settingsQrisUrl = getQrisUrl(settings?.qris_image_path);

  return (
    <section className="space-y-6 rounded-2xl border border-[#D4AF37]/25 bg-white/[0.015] p-4 md:p-6">
      <header className="border-b border-white/10 pb-5">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.24em] text-[#D4AF37]">Workspace Admin</p>
        <h2 className="mt-2 text-2xl font-semibold text-white">Invoice & Pengingat Termin Pembayaran</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
          Draf dibuat per termin. Invoice dan pengingat tidak dikirim otomatis; admin harus meninjau dan menyetujui sebelum menyiapkan pengiriman.
        </p>
      </header>

      {error ? <p role="alert" className="rounded-xl border border-red-400/25 bg-red-500/10 p-3 text-sm text-red-200">{error}</p> : null}
      {notice ? <p role="status" className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-100">{notice}</p> : null}

      <section className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
        <div>
          <h3 className="text-base font-semibold text-white">Identitas penagih & QRIS Shopee</h3>
          <p className="mt-1 text-xs leading-5 text-white/50">Informasi ini disimpan sebagai pengaturan bersama. QRIS dapat diunggah belakangan, tetapi invoice belum dapat disetujui sebelum QRIS tersedia.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="invoice-billing-name">Nama penagih / usaha</label>
            <input
              id="invoice-billing-name"
              value={settings?.billing_name || ''}
              onChange={(event) => setSettings((current) => current ? { ...current, billing_name: event.target.value } : current)}
              placeholder="Nama yang dicantumkan pada invoice"
            />
          </div>
          <div>
            <label htmlFor="invoice-billing-contact">Kontak penagih</label>
            <input
              id="invoice-billing-contact"
              value={settings?.billing_contact || ''}
              onChange={(event) => setSettings((current) => current ? { ...current, billing_contact: event.target.value } : current)}
              placeholder="Email atau nomor WhatsApp"
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="invoice-billing-address">Alamat / informasi tambahan (opsional)</label>
            <textarea
              id="invoice-billing-address"
              rows={2}
              value={settings?.billing_address || ''}
              onChange={(event) => setSettings((current) => current ? { ...current, billing_address: event.target.value } : current)}
              placeholder="Alamat usaha atau informasi penagih jika diperlukan"
            />
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={saveSettings} disabled={busy === 'settings' || !settings} className="rounded-lg bg-[#D4AF37] px-4 py-2.5 text-xs font-bold uppercase tracking-wide text-black disabled:opacity-50">
            {busy === 'settings' ? 'Menyimpan…' : 'Simpan Identitas'}
          </button>
          <div className="min-w-[240px] flex-1">
            <label htmlFor="invoice-qris-upload">Gambar QRIS Shopee (PNG/JPG/WebP, maks. 2 MB)</label>
            <input id="invoice-qris-upload" type="file" accept="image/png,image/jpeg,image/webp" onChange={uploadQris} disabled={busy === 'qris'} />
          </div>
        </div>
        {settingsQrisUrl ? (
          <div className="flex flex-wrap items-center gap-4 rounded-lg border border-white/10 p-3">
            <img src={settingsQrisUrl} alt="QRIS Shopee yang tersimpan" className="h-28 w-28 rounded-md bg-white object-contain p-2" />
            <div className="text-sm text-white/70">
              <p className="font-semibold text-white">QRIS tersimpan</p>
              <p className="mt-1 text-xs text-white/50">Gambar ini akan digunakan pada invoice yang disetujui berikutnya. Invoice lama tetap memakai salinan pengaturan saat disetujui.</p>
              {busy === 'qris' ? <p className="mt-2 text-xs text-[#D4AF37]">Mengunggah QRIS…</p> : null}
            </div>
          </div>
        ) : (
          <p className="rounded-lg border border-amber-300/20 bg-amber-300/5 p-3 text-xs leading-5 text-amber-100/80">QRIS belum diunggah. Anda tetap bisa menyusun draf invoice, tetapi persetujuan invoice akan terkunci sampai QRIS resmi tersedia.</p>
        )}
        <p className="text-xs leading-5 text-white/45">Catatan pajak pada invoice saat ini: “Pajak tidak ditambahkan pada invoice ini.” Ini bukan pernyataan bahwa usaha otomatis bebas dari kewajiban pajak.</p>
      </section>

      <section className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
        <div>
          <h3 className="text-base font-semibold text-white">Total biaya proyek yang disepakati</h3>
          <p className="mt-1 text-xs leading-5 text-white/50">Masukkan nilai final yang sudah disepakati dengan klien, bukan perkiraan budget dari formulir inquiry.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <div>
            <label htmlFor="invoice-total-fee">Total biaya proyek (rupiah)</label>
            <input
              id="invoice-total-fee"
              type="number"
              min="100"
              step="1"
              value={totalFeeInput}
              onChange={(event) => setTotalFeeInput(event.target.value)}
              placeholder="Contoh: 10000000"
            />
          </div>
          <button type="button" onClick={saveProfile} disabled={busy === 'profile'} className="rounded-lg border border-white/20 px-4 py-3 text-xs font-bold uppercase tracking-wide text-white hover:border-[#D4AF37]/60 disabled:opacity-50">
            {busy === 'profile' ? 'Menyimpan…' : 'Simpan Total Biaya'}
          </button>
        </div>
        {profile ? (
          <div className="grid gap-3 sm:grid-cols-3">
            {stages.map((item) => (
              <article key={item.value} className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
                <p className="text-xs text-white/50">{item.label} · {item.percentage}%</p>
                <p className="mt-1 text-sm font-semibold text-white">{formatRupiah(stageAmount(Number(profile.agreed_total_fee), item.value))}</p>
                <p className="mt-1 text-[11px] text-white/40">{item.description}</p>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <section className="space-y-4 rounded-xl border border-white/10 bg-black/20 p-4">
        <div>
          <h3 className="text-base font-semibold text-white">Buat invoice per termin</h3>
          <p className="mt-1 text-xs leading-5 text-white/50">Nomor invoice dibuat otomatis dengan format EA-INV-TAHUN-NOMOR. Jatuh tempo awal diusulkan 3 hari kalender setelah tanggal invoice dan dapat disesuaikan dengan kesepakatan klien.</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label htmlFor="invoice-stage">Termin</label>
            <select id="invoice-stage" value={stage} onChange={(event) => setStage(event.target.value as Stage)}>
              {stages.map((item) => <option key={item.value} value={item.value}>{item.label} — {item.percentage}%</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="invoice-issue-date">Tanggal invoice</label>
            <input id="invoice-issue-date" type="date" value={issueDate} onChange={(event) => { setIssueDate(event.target.value); if (event.target.value) setDueDate(addCalendarDays(event.target.value, 3)); }} />
          </div>
          <div>
            <label htmlFor="invoice-due-date">Tanggal jatuh tempo</label>
            <input id="invoice-due-date" type="date" min={issueDate} value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
          </div>
          <div className="flex items-end">
            <button type="button" onClick={createInvoice} disabled={!profile || activeStages.includes(stage) || busy === 'create-invoice'} className="w-full rounded-lg bg-[#D4AF37] px-4 py-3 text-xs font-bold uppercase tracking-wide text-black disabled:cursor-not-allowed disabled:opacity-40">
              {busy === 'create-invoice' ? 'Membuat…' : 'Buat Draf Invoice'}
            </button>
          </div>
        </div>
        {!profile ? <p className="text-xs text-amber-100/80">Simpan total biaya proyek terlebih dahulu untuk mengaktifkan pembuatan invoice.</p> : null}
        {activeStages.length === stages.length ? <p className="text-xs text-white/45">Semua termin sudah memiliki invoice aktif. Batalkan invoice yang salah sebelum membuat pengganti.</p> : null}
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-white">Riwayat invoice</h3>
            <p className="mt-1 text-xs text-white/50">{inquiry ? inquiry.nama + ' · ' + [inquiry.jenis_kebutuhan, inquiry.jenis_proyek].filter(Boolean).join(' — ') : 'Detail inquiry'}</p>
          </div>
          <p className="text-xs text-white/45">{invoices.length} invoice tercatat</p>
        </div>

        {invoices.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 p-6 text-sm text-white/50">Belum ada invoice untuk inquiry ini.</div>
        ) : invoices.map((invoice) => {
          const paidTotal = invoice.payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
          const remaining = Math.max(0, Number(invoice.amount_due) - paidTotal);
          const isBusy = busy === invoice.id;
          const availableToSend = invoice.invoice_status === 'approved';
          return (
            <article key={invoice.id} className="space-y-4 rounded-xl border border-white/10 bg-white/[0.02] p-4 md:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-mono text-xs font-bold tracking-wide text-[#D4AF37]">{invoice.invoice_number}</p>
                  <h4 className="mt-1 text-lg font-semibold text-white">{stageTitle(invoice.installment_stage)} · {invoice.installment_percentage}%</h4>
                  <p className="mt-1 text-xs text-white/45">Diterbitkan {formatDate(invoice.issue_date)} · Jatuh tempo {formatDate(invoice.due_date)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/15 px-3 py-1 text-[11px] text-white/70">{invoiceStatusTitle(invoice.invoice_status)}</span>
                  <span className={'rounded-full border px-3 py-1 text-[11px] ' + (invoice.display_payment_status === 'paid' ? 'border-emerald-300/30 text-emerald-200' : invoice.display_payment_status === 'overdue' ? 'border-red-300/30 text-red-200' : 'border-amber-300/25 text-amber-100')}>
                    {paymentStatusTitle(invoice.display_payment_status)}
                  </span>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-lg bg-black/20 p-3">
                  <p className="text-[11px] text-white/45">Nilai proyek</p>
                  <p className="mt-1 text-sm font-semibold text-white">{formatRupiah(Number(invoice.total_project_fee))}</p>
                </div>
                <div className="rounded-lg bg-black/20 p-3">
                  <p className="text-[11px] text-white/45">Tagihan termin</p>
                  <p className="mt-1 text-sm font-semibold text-white">{formatRupiah(Number(invoice.amount_due))}</p>
                </div>
                <div className="rounded-lg bg-black/20 p-3">
                  <p className="text-[11px] text-white/45">Sudah dibayar</p>
                  <p className="mt-1 text-sm font-semibold text-emerald-200">{formatRupiah(paidTotal)}</p>
                </div>
                <div className="rounded-lg bg-black/20 p-3">
                  <p className="text-[11px] text-white/45">Sisa tagihan</p>
                  <p className="mt-1 text-sm font-semibold text-white">{formatRupiah(remaining)}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {invoice.invoice_status === 'draft' ? (
                  <button type="button" onClick={() => invoiceAction(invoice, 'request_approval')} disabled={isBusy} className="rounded-lg bg-[#D4AF37] px-3 py-2 text-xs font-bold text-black disabled:opacity-50">Ajukan Persetujuan</button>
                ) : null}
                {invoice.invoice_status === 'waiting_approval' ? (
                  <button type="button" onClick={() => invoiceAction(invoice, 'approve')} disabled={isBusy} className="rounded-lg bg-emerald-300 px-3 py-2 text-xs font-bold text-black disabled:opacity-50">Setujui Invoice</button>
                ) : null}
                {availableToSend || invoice.invoice_status === 'sent' ? (
                  <button type="button" onClick={() => setPrintInvoiceId(invoice.id)} className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white hover:border-[#D4AF37]/60">Simpan PDF / Cetak</button>
                ) : null}
                {availableToSend ? (
                  <>
                    <button type="button" onClick={() => openInvoiceChannel(invoice, 'whatsapp')} className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white hover:border-[#D4AF37]/60">Siapkan WhatsApp</button>
                    <button type="button" onClick={() => openInvoiceChannel(invoice, 'email')} className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white hover:border-[#D4AF37]/60">Siapkan Email</button>
                    <button type="button" onClick={() => invoiceAction(invoice, 'mark_sent', { channel: 'whatsapp' })} disabled={isBusy || !invoice.client_whatsapp_snapshot} className="rounded-lg border border-emerald-300/30 px-3 py-2 text-xs font-semibold text-emerald-100 disabled:opacity-40">Tandai Terkirim WhatsApp</button>
                    <button type="button" onClick={() => invoiceAction(invoice, 'mark_sent', { channel: 'email' })} disabled={isBusy || !invoice.client_email_snapshot} className="rounded-lg border border-emerald-300/30 px-3 py-2 text-xs font-semibold text-emerald-100 disabled:opacity-40">Tandai Terkirim Email</button>
                    <button type="button" onClick={() => invoiceAction(invoice, 'mark_sent', { channel: 'manual' })} disabled={isBusy} className="rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white/70 disabled:opacity-50">Tandai Terkirim Manual</button>
                  </>
                ) : null}
                {invoice.invoice_status !== 'sent' && invoice.invoice_status !== 'cancelled' && paidTotal === 0 ? (
                  <button type="button" onClick={() => invoiceAction(invoice, 'cancel')} disabled={isBusy} className="rounded-lg border border-red-300/25 px-3 py-2 text-xs font-semibold text-red-200 disabled:opacity-50">Batalkan Invoice</button>
                ) : null}
                {invoice.invoice_status === 'approved' || invoice.invoice_status === 'sent' ? (
                  <button
                    type="button"
                    onClick={() => { setPaymentInvoiceId(paymentInvoiceId === invoice.id ? null : invoice.id); setPaymentAmount(String(remaining)); setPaymentDate(localDateString()); setPaymentReference(''); setPaymentNotes(''); }}
                    disabled={remaining <= 0}
                    className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold text-white hover:border-[#D4AF37]/60 disabled:opacity-40"
                  >
                    Catat Pembayaran
                  </button>
                ) : null}
              </div>

              {(availableToSend || invoice.invoice_status === 'sent') ? (
                <p className="text-xs leading-5 text-white/45">Simpan PDF terlebih dahulu. Saat menyiapkan WhatsApp atau email, lampirkan PDF secara manual dan tandai terkirim hanya setelah pesan benar-benar dikirim.</p>
              ) : null}

              {paymentInvoiceId === invoice.id ? (
                <div className="space-y-3 rounded-lg border border-emerald-300/15 bg-emerald-300/[0.03] p-3">
                  <h5 className="text-sm font-semibold text-white">Catat pembayaran yang sudah diverifikasi</h5>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div><label htmlFor={'payment-amount-' + invoice.id}>Nominal pembayaran (rupiah)</label><input id={'payment-amount-' + invoice.id} type="number" min="1" max={remaining} step="1" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} /></div>
                    <div><label htmlFor={'payment-date-' + invoice.id}>Tanggal pembayaran</label><input id={'payment-date-' + invoice.id} type="date" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} /></div>
                    <div><label htmlFor={'payment-reference-' + invoice.id}>Referensi transaksi (opsional)</label><input id={'payment-reference-' + invoice.id} value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} placeholder="Nomor referensi jika tersedia" /></div>
                    <div><label htmlFor={'payment-notes-' + invoice.id}>Catatan verifikasi (opsional)</label><input id={'payment-notes-' + invoice.id} value={paymentNotes} onChange={(event) => setPaymentNotes(event.target.value)} placeholder="Contoh: nominal cocok dengan mutasi" /></div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={() => invoiceAction(invoice, 'record_payment', { amount: Number(paymentAmount), paidAt: paymentDate, reference: paymentReference, notes: paymentNotes })} disabled={isBusy || !paymentAmount || Number(paymentAmount) <= 0} className="rounded-lg bg-emerald-300 px-3 py-2 text-xs font-bold text-black disabled:opacity-50">Simpan Pembayaran</button>
                    <button type="button" onClick={() => setPaymentInvoiceId(null)} className="rounded-lg border border-white/15 px-3 py-2 text-xs text-white/70">Tutup</button>
                  </div>
                </div>
              ) : null}

              {invoice.payments.length ? (
                <div className="space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wide text-white/50">Riwayat pembayaran</h5>
                  {invoice.payments.map((payment) => (
                    <div key={payment.id} className="flex flex-wrap justify-between gap-2 border-t border-white/10 pt-2 text-xs">
                      <span className="text-white/70">{formatDate(payment.paid_at)} · diverifikasi {payment.verified_by}</span>
                      <span className="font-semibold text-emerald-200">{formatRupiah(Number(payment.amount))}</span>
                    </div>
                  ))}
                </div>
              ) : null}

              {invoice.invoice_status === 'approved' || invoice.invoice_status === 'sent' ? (
                <div className="space-y-3 border-t border-white/10 pt-4">
                  <div>
                    <h5 className="text-sm font-semibold text-white">Draf pengingat manual</h5>
                    <p className="mt-1 text-xs text-white/45">Jadwal belum otomatis aktif. Pilih jenis pengingat saat diperlukan; semua draf tetap perlu persetujuan admin.</p>
                  </div>
                  <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
                    <div><label htmlFor={'reminder-channel-' + invoice.id}>Saluran</label><select id={'reminder-channel-' + invoice.id} value={reminderChannel} onChange={(event) => setReminderChannel(event.target.value as ReminderChannel)}><option value="whatsapp">WhatsApp</option><option value="email">Email</option></select></div>
                    <div><label htmlFor={'reminder-type-' + invoice.id}>Jenis pengingat</label><select id={'reminder-type-' + invoice.id} value={reminderType} onChange={(event) => setReminderType(event.target.value as (typeof reminderTypes)[number]['value'])}>{reminderTypes.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
                    <button type="button" onClick={() => createReminder(invoice)} disabled={busy === 'reminder-' + invoice.id || invoice.display_payment_status === 'paid'} className="rounded-lg border border-white/20 px-3 py-3 text-xs font-semibold text-white disabled:opacity-40">{busy === 'reminder-' + invoice.id ? 'Membuat…' : 'Buat Draf Pengingat'}</button>
                  </div>

                  {invoice.reminders.map((reminder) => {
                    const edit = reminderEdits[reminder.id] || { subject: reminder.subject || '', message_body: reminder.message_body };
                    const reminderBusy = busy === reminder.id;
                    return (
                      <div key={reminder.id} className="space-y-3 rounded-lg border border-white/10 bg-black/20 p-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-white">{reminder.channel === 'whatsapp' ? 'WhatsApp' : 'Email'} · {reminderTypes.find((item) => item.value === reminder.reminder_type)?.label}</p>
                          <span className="rounded-full border border-white/15 px-2 py-1 text-[10px] text-white/60">{reminderStatusTitle(reminder.status)}</span>
                        </div>
                        {reminder.status === 'draft' ? (
                          <>
                            {reminder.channel === 'email' ? <div><label htmlFor={'reminder-subject-' + reminder.id}>Subjek email</label><input id={'reminder-subject-' + reminder.id} value={edit.subject} onChange={(event) => setReminderEdits((current) => ({ ...current, [reminder.id]: { ...edit, subject: event.target.value } }))} /></div> : null}
                            <div><label htmlFor={'reminder-body-' + reminder.id}>Isi pesan untuk ditinjau</label><textarea id={'reminder-body-' + reminder.id} rows={4} value={edit.message_body} onChange={(event) => setReminderEdits((current) => ({ ...current, [reminder.id]: { ...edit, message_body: event.target.value } }))} /></div>
                            <div className="flex flex-wrap gap-2">
                              <button type="button" onClick={() => reminderAction(reminder, 'update_draft', { subject: edit.subject, messageBody: edit.message_body })} disabled={reminderBusy} className="rounded-lg border border-white/20 px-3 py-2 text-xs text-white disabled:opacity-50">Simpan Draf</button>
                              <button type="button" onClick={() => reminderAction(reminder, 'request_approval')} disabled={reminderBusy} className="rounded-lg bg-[#D4AF37] px-3 py-2 text-xs font-bold text-black disabled:opacity-50">Ajukan Persetujuan</button>
                            </div>
                          </>
                        ) : (
                          <p className="whitespace-pre-wrap text-xs leading-5 text-white/70">{reminder.message_body}</p>
                        )}
                        {reminder.status === 'waiting_approval' ? <button type="button" onClick={() => reminderAction(reminder, 'approve')} disabled={reminderBusy} className="rounded-lg bg-emerald-300 px-3 py-2 text-xs font-bold text-black disabled:opacity-50">Setujui Pengingat</button> : null}
                        {reminder.status === 'approved' ? (
                          <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={() => openReminderChannel(invoice, reminder)} className="rounded-lg border border-white/20 px-3 py-2 text-xs text-white">Buka {reminder.channel === 'whatsapp' ? 'WhatsApp' : 'Email'}</button>
                            <button type="button" onClick={() => reminderAction(reminder, 'mark_sent')} disabled={reminderBusy} className="rounded-lg border border-emerald-300/25 px-3 py-2 text-xs text-emerald-100 disabled:opacity-50">Tandai Terkirim</button>
                          </div>
                        ) : null}
                        {reminder.status === 'approved' ? <p className="text-[11px] leading-5 text-white/40">Pengiriman dilakukan manual di aplikasi {reminder.channel === 'whatsapp' ? 'WhatsApp' : 'email'}. Tandai terkirim setelah benar-benar mengirim pesan.</p> : null}
                      </div>
                    );
                  })}
                </div>
              ) : null}
            </article>
          );
        })}
      </section>

      {printInvoice ? (
        <div id="invoice-print-root" className="hidden">
          <div className="invoice-paper">
            <div className="invoice-paper-header">
              <div>
                <p className="invoice-paper-kicker">INVOICE</p>
                <h1>{printInvoice.billing_name_snapshot || settings?.billing_name || 'Eryawan Agung'}</h1>
                {printInvoice.billing_contact_snapshot || settings?.billing_contact ? <p>{printInvoice.billing_contact_snapshot || settings?.billing_contact}</p> : null}
                {printInvoice.billing_address_snapshot || settings?.billing_address ? <p>{printInvoice.billing_address_snapshot || settings?.billing_address}</p> : null}
              </div>
              <div className="invoice-paper-meta">
                <strong>{printInvoice.invoice_number}</strong>
                <p>Tanggal: {formatDate(printInvoice.issue_date)}</p>
                <p>Jatuh tempo: {formatDate(printInvoice.due_date)}</p>
              </div>
            </div>
            <hr />
            <div className="invoice-paper-section">
              <p className="invoice-paper-label">Ditagihkan kepada</p>
              <h2>{printInvoice.client_name_snapshot}</h2>
              {printInvoice.client_email_snapshot ? <p>{printInvoice.client_email_snapshot}</p> : null}
              {printInvoice.client_whatsapp_snapshot ? <p>{printInvoice.client_whatsapp_snapshot}</p> : null}
              <p className="invoice-paper-project">Proyek / layanan: {printInvoice.project_label_snapshot}</p>
            </div>
            <table className="invoice-paper-table">
              <thead><tr><th>Deskripsi</th><th>Nilai proyek</th><th>Termin</th><th>Jumlah tagihan</th></tr></thead>
              <tbody><tr><td>{stageTitle(printInvoice.installment_stage)} ({printInvoice.installment_percentage}%)</td><td>{formatRupiah(Number(printInvoice.total_project_fee))}</td><td>{printInvoice.installment_percentage}%</td><td>{formatRupiah(Number(printInvoice.amount_due))}</td></tr></tbody>
            </table>
            <div className="invoice-paper-total"><span>Total yang harus dibayar</span><strong>{formatRupiah(Number(printInvoice.amount_due))}</strong></div>
            <div className="invoice-paper-payment">
              <div>
                <p className="invoice-paper-label">Metode pembayaran</p>
                <h3>QRIS Shopee</h3>
                <p>Silakan pindai QRIS di samping. Pastikan nominal pembayaran sesuai dengan total tagihan.</p>
                <p className="invoice-paper-tax">{printInvoice.tax_note_snapshot || 'Pajak tidak ditambahkan pada invoice ini.'}</p>
              </div>
              {getQrisUrl(printInvoice.qris_image_path_snapshot) ? <img src={getQrisUrl(printInvoice.qris_image_path_snapshot)} alt="QRIS Shopee" /> : <div className="invoice-paper-no-qris">QRIS belum tersedia</div>}
            </div>
            <p className="invoice-paper-footer">Terima kasih atas kepercayaan Anda kepada Eryawan Agung.</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
