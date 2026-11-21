import { NextResponse } from 'next/server';
import { getAdminRequestContext } from '@/lib/admin-api-auth';
import { invoiceRpcErrorResponse } from '@/lib/invoice-rpc-errors';

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
  if (channel === 'whatsapp' && !invoice.client_whatsapp_snapshot) {
    return NextResponse.json({ error: 'Nomor WhatsApp klien belum tersedia.' }, { status: 400 });
  }
  if (channel === 'email' && !invoice.client_email_snapshot) {
    return NextResponse.json({ error: 'Email klien belum tersedia.' }, { status: 400 });
  }

  const clientName = invoice.client_name_snapshot || 'Bapak/Ibu';
  const dueDate = formatDate(invoice.due_date);
  const stage = stageLabels[invoice.installment_stage] || 'termin pembayaran';
  const reminderLabel = reminderLabels[reminderType];
  const subject = channel === 'email' ? 'Pengingat pembayaran ' + invoice.invoice_number + ' — Eryawan Agung' : null;
  const message = channel === 'whatsapp'
    ? 'Halo ' + clientName + ', izin menyampaikan ' + reminderLabel + ' untuk invoice ' + invoice.invoice_number + ' (' + stage + ') dengan sisa tagihan sebesar {{SISA_TAGIHAN}}. Jatuh tempo: ' + dueDate + '. Pembayaran dapat dilakukan melalui QRIS Shopee pada invoice. Jika sudah membayar, mohon kabari agar pembayaran dapat kami verifikasi. Terima kasih.'
    : 'Yth. ' + clientName + ',\n\nKami ingin menyampaikan ' + reminderLabel + ' untuk invoice ' + invoice.invoice_number + ' (' + stage + ') dengan sisa tagihan sebesar {{SISA_TAGIHAN}}.\n\nTanggal jatuh tempo: ' + dueDate + '. Pembayaran dapat dilakukan melalui QRIS Shopee yang tercantum pada invoice. Jika pembayaran telah dilakukan, mohon abaikan pengingat ini dan informasikan kepada kami agar dapat kami verifikasi.\n\nTerima kasih,\nEryawan Agung';

  const { data, error } = await auth.supabase.rpc('create_project_invoice_reminder', {
    p_invoice_id: invoiceId,
    p_channel: channel,
    p_reminder_type: reminderType,
    p_subject: subject,
    p_message_body: message,
  });

  if (error) return invoiceRpcErrorResponse(error, 'Gagal membuat draf pengingat.');
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return NextResponse.json({ error: 'Respons pembuatan pengingat tidak valid.' }, { status: 500 });
  }

  return NextResponse.json({ data }, { status: 201 });
}
