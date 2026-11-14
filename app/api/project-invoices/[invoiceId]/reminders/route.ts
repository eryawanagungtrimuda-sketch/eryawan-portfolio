import { NextResponse } from 'next/server';
import { getAdminRequestContext, writeInvoiceAudit } from '@/lib/admin-api-auth';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const stageLabels: Record<string, string> = {
  dp: 'DP 50% sebelum pekerjaan dimulai',
  progress: 'termin progres 30% saat presentasi progres',
  final: 'termin final 20% sebelum hasil final diserahkan',
};
const reminderLabels: Record<string, string> = {
  h_minus_1: 'pengingat menjelang jatuh tempo',
  due_today: 'pengingat pada tanggal jatuh tempo',
  overdue: 'pengingat atas tagihan yang melewati jatuh tempo',
};

function formatRupiah(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(value + 'T00:00:00Z'));
}

export async function POST(request: Request, { params }: { params: Promise<{ invoiceId: string }> }) {
  const auth = await getAdminRequestContext(request);
  if ('response' in auth) return auth.response;

  const { invoiceId } = await params;
  if (!uuidPattern.test(invoiceId)) return NextResponse.json({ error: 'ID invoice tidak valid.' }, { status: 400 });

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return NextResponse.json({ error: 'Payload tidak valid.' }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Payload tidak valid.' }, { status: 400 });
  }

  const channel = body.channel;
  const reminderType = body.reminderType;
  if (channel !== 'whatsapp' && channel !== 'email') {
    return NextResponse.json({ error: 'Saluran pengingat tidak valid.' }, { status: 400 });
  }
  if (typeof reminderType !== 'string' || !Object.prototype.hasOwnProperty.call(reminderLabels, reminderType)) {
    return NextResponse.json({ error: 'Jenis pengingat tidak valid.' }, { status: 400 });
  }

  const { data: invoice, error: invoiceError } = await auth.supabase
    .from('project_invoices')
    .select('*')
    .eq('id', invoiceId)
    .maybeSingle();

  if (invoiceError || !invoice) return NextResponse.json({ error: 'Invoice tidak ditemukan.' }, { status: 404 });
  if (invoice.invoice_status !== 'approved' && invoice.invoice_status !== 'sent') {
    return NextResponse.json({ error: 'Invoice harus disetujui sebelum draf pengingat dibuat.' }, { status: 409 });
  }
  const { data: paymentRows, error: paymentRowsError } = await auth.supabase
    .from('project_invoice_payments')
    .select('amount')
    .eq('invoice_id', invoiceId);
  if (paymentRowsError) return NextResponse.json({ error: 'Gagal memeriksa status pembayaran.' }, { status: 500 });
  const paidTotal = (paymentRows || []).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  if (paidTotal >= Number(invoice.amount_due)) {
    return NextResponse.json({ error: 'Invoice sudah lunas; pengingat pembayaran tidak diperlukan.' }, { status: 409 });
  }
  if (channel === 'whatsapp' && !invoice.client_whatsapp_snapshot) {
    return NextResponse.json({ error: 'Nomor WhatsApp klien belum tersedia.' }, { status: 400 });
  }
  if (channel === 'email' && !invoice.client_email_snapshot) {
    return NextResponse.json({ error: 'Email klien belum tersedia.' }, { status: 400 });
  }

  const clientName = invoice.client_name_snapshot || 'Bapak/Ibu';
  const amount = formatRupiah(Number(invoice.amount_due));
  const dueDate = formatDate(invoice.due_date);
  const stage = stageLabels[invoice.installment_stage] || 'termin pembayaran';
  const reminderLabel = reminderLabels[reminderType];
  const subject = channel === 'email' ? 'Pengingat pembayaran ' + invoice.invoice_number + ' — Eryawan Agung' : null;
  const message = channel === 'whatsapp'
    ? 'Halo ' + clientName + ', izin menyampaikan ' + reminderLabel + ' untuk invoice ' + invoice.invoice_number + ' (' + stage + ') sebesar ' + amount + '. Jatuh tempo: ' + dueDate + '. Pembayaran dapat dilakukan melalui QRIS Shopee pada invoice. Jika sudah membayar, mohon kabari agar pembayaran dapat kami verifikasi. Terima kasih.'
    : 'Yth. ' + clientName + ',\n\nKami ingin menyampaikan ' + reminderLabel + ' untuk invoice ' + invoice.invoice_number + ' (' + stage + ') sebesar ' + amount + '.\n\nTanggal jatuh tempo: ' + dueDate + '. Pembayaran dapat dilakukan melalui QRIS Shopee yang tercantum pada invoice. Jika pembayaran telah dilakukan, mohon abaikan pengingat ini dan informasikan kepada kami agar dapat kami verifikasi.\n\nTerima kasih,\nEryawan Agung';

  const { data: reminder, error } = await auth.supabase
    .from('project_invoice_reminder_drafts')
    .insert({
      invoice_id: invoiceId,
      channel,
      reminder_type: reminderType,
      status: 'draft',
      subject,
      message_body: message,
      created_by: auth.email,
    })
    .select('*')
    .single();

  if (error || !reminder) {
    console.error('[invoice-reminder][POST]', { code: error?.code });
    return NextResponse.json({ error: 'Gagal membuat draf pengingat.' }, { status: 500 });
  }

  await writeInvoiceAudit(auth.supabase, invoiceId, 'reminder_draft_created', auth.email, {
    reminder_id: reminder.id,
    channel,
    reminder_type: reminderType,
  });

  return NextResponse.json({ data: reminder }, { status: 201 });
}
