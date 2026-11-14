import { NextResponse } from 'next/server';
import { getAdminRequestContext, writeInvoiceAudit } from '@/lib/admin-api-auth';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function safeText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + 'T00:00:00.000Z');
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export async function PATCH(request: Request, { params }: { params: Promise<{ invoiceId: string }> }) {
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

  const action = body.action;
  const { data: invoice, error: invoiceError } = await auth.supabase
    .from('project_invoices')
    .select('*')
    .eq('id', invoiceId)
    .maybeSingle();

  if (invoiceError || !invoice) return NextResponse.json({ error: 'Invoice tidak ditemukan.' }, { status: 404 });

  if (action === 'request_approval') {
    if (invoice.invoice_status !== 'draft') {
      return NextResponse.json({ error: 'Hanya draf invoice yang dapat diajukan untuk persetujuan.' }, { status: 409 });
    }
    const { data, error } = await auth.supabase
      .from('project_invoices')
      .update({ invoice_status: 'waiting_approval' })
      .eq('id', invoiceId)
      .select('*')
      .single();
    if (error || !data) return NextResponse.json({ error: 'Gagal mengajukan invoice untuk persetujuan.' }, { status: 500 });
    await writeInvoiceAudit(auth.supabase, invoiceId, 'invoice_waiting_approval', auth.email);
    return NextResponse.json({ data });
  }

  if (action === 'approve') {
    if (invoice.invoice_status !== 'waiting_approval') {
      return NextResponse.json({ error: 'Ajukan draf untuk persetujuan terlebih dahulu.' }, { status: 409 });
    }
    const { data: settings, error: settingsError } = await auth.supabase
      .from('project_invoice_settings')
      .select('billing_name,billing_contact,billing_address,qris_image_path,tax_note')
      .eq('id', 1)
      .single();

    if (settingsError || !settings) return NextResponse.json({ error: 'Pengaturan invoice belum tersedia.' }, { status: 500 });
    if (!settings.billing_name || !settings.billing_contact || !settings.qris_image_path) {
      return NextResponse.json({
        error: 'Lengkapi identitas penagih, kontak, dan unggah QRIS Shopee terlebih dahulu sebelum menyetujui invoice.',
      }, { status: 400 });
    }
    if (!invoice.client_email_snapshot && !invoice.client_whatsapp_snapshot) {
      return NextResponse.json({ error: 'Inquiry belum memiliki email atau nomor WhatsApp klien untuk pengiriman invoice.' }, { status: 400 });
    }

    const { data, error } = await auth.supabase
      .from('project_invoices')
      .update({
        invoice_status: 'approved',
        approved_by: auth.email,
        approved_at: new Date().toISOString(),
        billing_name_snapshot: settings.billing_name,
        billing_contact_snapshot: settings.billing_contact,
        billing_address_snapshot: settings.billing_address,
        qris_image_path_snapshot: settings.qris_image_path,
        tax_note_snapshot: settings.tax_note || 'Pajak tidak ditambahkan pada invoice ini.',
      })
      .eq('id', invoiceId)
      .select('*')
      .single();

    if (error || !data) return NextResponse.json({ error: 'Gagal menyetujui invoice.' }, { status: 500 });
    await writeInvoiceAudit(auth.supabase, invoiceId, 'invoice_approved', auth.email);
    return NextResponse.json({ data });
  }

  if (action === 'mark_sent') {
    if (invoice.invoice_status !== 'approved') {
      return NextResponse.json({ error: 'Invoice harus disetujui sebelum ditandai terkirim.' }, { status: 409 });
    }
    const channel = body.channel;
    if (channel !== 'whatsapp' && channel !== 'email' && channel !== 'manual') {
      return NextResponse.json({ error: 'Saluran pengiriman tidak valid.' }, { status: 400 });
    }
    if (channel === 'whatsapp' && !invoice.client_whatsapp_snapshot) {
      return NextResponse.json({ error: 'Nomor WhatsApp klien belum tersedia.' }, { status: 400 });
    }
    if (channel === 'email' && !invoice.client_email_snapshot) {
      return NextResponse.json({ error: 'Email klien belum tersedia.' }, { status: 400 });
    }
    const { data, error } = await auth.supabase
      .from('project_invoices')
      .update({ invoice_status: 'sent', sent_channel: channel, sent_at: new Date().toISOString() })
      .eq('id', invoiceId)
      .select('*')
      .single();
    if (error || !data) return NextResponse.json({ error: 'Gagal memperbarui status pengiriman invoice.' }, { status: 500 });
    await writeInvoiceAudit(auth.supabase, invoiceId, 'invoice_marked_sent', auth.email, { channel });
    return NextResponse.json({ data });
  }

  if (action === 'cancel') {
    if (invoice.invoice_status === 'sent' || invoice.invoice_status === 'cancelled') {
      return NextResponse.json({ error: 'Invoice terkirim atau sudah dibatalkan tidak dapat dibatalkan lagi dari tindakan ini.' }, { status: 409 });
    }
    const { data: payments, error: paymentsError } = await auth.supabase
      .from('project_invoice_payments')
      .select('id')
      .eq('invoice_id', invoiceId)
      .limit(1);
    if (paymentsError) return NextResponse.json({ error: 'Gagal memeriksa riwayat pembayaran.' }, { status: 500 });
    if ((payments || []).length) {
      return NextResponse.json({ error: 'Invoice dengan pembayaran tercatat tidak dapat dibatalkan.' }, { status: 409 });
    }
    const { data, error } = await auth.supabase
      .from('project_invoices')
      .update({ invoice_status: 'cancelled' })
      .eq('id', invoiceId)
      .select('*')
      .single();
    if (error || !data) return NextResponse.json({ error: 'Gagal membatalkan invoice.' }, { status: 500 });
    await writeInvoiceAudit(auth.supabase, invoiceId, 'invoice_cancelled', auth.email);
    return NextResponse.json({ data });
  }

  if (action === 'record_payment') {
    if (invoice.invoice_status !== 'approved' && invoice.invoice_status !== 'sent') {
      return NextResponse.json({ error: 'Pembayaran hanya dapat dicatat setelah invoice disetujui.' }, { status: 409 });
    }
    const amount = Number(body.amount);
    const paidAt = isIsoDate(body.paidAt) ? body.paidAt : '';
    if (!Number.isSafeInteger(amount) || amount <= 0 || !paidAt) {
      return NextResponse.json({ error: 'Nominal dan tanggal pembayaran wajib valid.' }, { status: 400 });
    }

    const { data: priorPayments, error: priorError } = await auth.supabase
      .from('project_invoice_payments')
      .select('amount')
      .eq('invoice_id', invoiceId);
    if (priorError) return NextResponse.json({ error: 'Gagal memuat riwayat pembayaran.' }, { status: 500 });

    const paidSoFar = (priorPayments || []).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const remaining = Number(invoice.amount_due) - paidSoFar;
    if (amount > remaining) {
      return NextResponse.json({ error: 'Nominal pembayaran melebihi sisa tagihan sebesar Rp' + Math.max(remaining, 0).toLocaleString('id-ID') + '.' }, { status: 400 });
    }

    const { data: payment, error: paymentError } = await auth.supabase
      .from('project_invoice_payments')
      .insert({
        invoice_id: invoiceId,
        amount,
        paid_at: paidAt,
        payment_method: 'qris_shopee',
        reference: safeText(body.reference, 160) || null,
        notes: safeText(body.notes, 1000) || null,
        verified_by: auth.email,
        verified_at: new Date().toISOString(),
      })
      .select('*')
      .single();

    if (paymentError || !payment) {
      console.error('[invoice-payment][insert]', { code: paymentError?.code });
      return NextResponse.json({ error: 'Gagal mencatat pembayaran.' }, { status: 500 });
    }

    const newPaidTotal = paidSoFar + amount;
    const paymentStatus = newPaidTotal >= Number(invoice.amount_due) ? 'paid' : 'partial';
    const { error: statusError } = await auth.supabase
      .from('project_invoices')
      .update({ payment_status: paymentStatus })
      .eq('id', invoiceId);

    if (statusError) {
      console.warn('[invoice-payment] Payment was recorded but invoice status update failed', { invoiceId, code: statusError.code });
    }

    await writeInvoiceAudit(auth.supabase, invoiceId, 'payment_recorded', auth.email, {
      payment_id: payment.id,
      amount,
      payment_status: paymentStatus,
    });

    return NextResponse.json({ data: payment, paymentStatus, warning: statusError ? 'Pembayaran tercatat; status akan disegarkan dari riwayat pembayaran.' : null }, { status: 201 });
  }

  return NextResponse.json({ error: 'Tindakan invoice tidak dikenal.' }, { status: 400 });
}
