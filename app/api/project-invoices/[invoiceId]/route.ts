import { NextResponse } from 'next/server';
import { getAdminRequestContext } from '@/lib/admin-api-auth';
import { invoiceRpcErrorResponse } from '@/lib/invoice-rpc-errors';

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

  if (action === 'record_payment') {
    const amount = Number(body.amount);
    const paidAt = isIsoDate(body.paidAt) ? body.paidAt : '';
    if (!Number.isSafeInteger(amount) || amount <= 0 || !paidAt) {
      return NextResponse.json({ error: 'Nominal dan tanggal pembayaran wajib valid.' }, { status: 400 });
    }

    const { data, error } = await auth.supabase.rpc('record_project_invoice_payment', {
      p_invoice_id: invoiceId,
      p_amount: amount,
      p_paid_at: paidAt,
      p_reference: safeText(body.reference, 160) || null,
      p_notes: safeText(body.notes, 1000) || null,
    });

    if (error) return invoiceRpcErrorResponse(error, 'Gagal mencatat pembayaran.');
    const result = data as { payment?: Record<string, unknown>; payment_status?: string } | null;
    if (!result?.payment || typeof result.payment_status !== 'string') {
      return NextResponse.json({ error: 'Respons pencatatan pembayaran tidak valid.' }, { status: 500 });
    }

    return NextResponse.json({
      data: result.payment,
      paymentStatus: result.payment_status,
      warning: null,
    }, { status: 201 });
  }

  if (
    action === 'request_approval'
    || action === 'approve'
    || action === 'mark_sent'
    || action === 'cancel'
  ) {
    const channel = typeof body.channel === 'string' ? body.channel : null;
    if (action === 'mark_sent' && channel !== 'whatsapp' && channel !== 'email' && channel !== 'manual') {
      return NextResponse.json({ error: 'Saluran pengiriman tidak valid.' }, { status: 400 });
    }

    const { data, error } = await auth.supabase.rpc('transition_project_invoice', {
      p_invoice_id: invoiceId,
      p_action: action,
      p_channel: channel,
    });

    if (error) return invoiceRpcErrorResponse(error, 'Gagal memproses tindakan invoice.');
    if (!data || typeof data !== 'object') {
      return NextResponse.json({ error: 'Respons tindakan invoice tidak valid.' }, { status: 500 });
    }

    return NextResponse.json({ data });
  }

  return NextResponse.json({ error: 'Tindakan invoice tidak dikenal.' }, { status: 400 });
}
