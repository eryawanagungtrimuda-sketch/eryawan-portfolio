import { NextResponse } from 'next/server';
import { getAdminRequestContext, writeInvoiceAudit } from '@/lib/admin-api-auth';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function safeText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function PATCH(request: Request, { params }: { params: Promise<{ reminderId: string }> }) {
  const auth = await getAdminRequestContext(request);
  if ('response' in auth) return auth.response;

  const { reminderId } = await params;
  if (!uuidPattern.test(reminderId)) return NextResponse.json({ error: 'ID pengingat tidak valid.' }, { status: 400 });

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

  const { data: reminder, error: reminderError } = await auth.supabase
    .from('project_invoice_reminder_drafts')
    .select('*')
    .eq('id', reminderId)
    .maybeSingle();

  if (reminderError || !reminder) return NextResponse.json({ error: 'Draf pengingat tidak ditemukan.' }, { status: 404 });

  const action = body.action;
  let update: Record<string, unknown> = {};

  if (action === 'update_draft') {
    if (reminder.status !== 'draft') return NextResponse.json({ error: 'Hanya draf yang belum diajukan yang dapat diedit.' }, { status: 409 });
    const messageBody = safeText(body.messageBody, 4000);
    if (!messageBody) return NextResponse.json({ error: 'Isi pesan pengingat tidak boleh kosong.' }, { status: 400 });
    update = {
      message_body: messageBody,
      subject: reminder.channel === 'email' ? safeText(body.subject, 200) || 'Pengingat pembayaran — Eryawan Agung' : null,
    };
  } else if (action === 'request_approval') {
    if (reminder.status !== 'draft') return NextResponse.json({ error: 'Hanya draf yang dapat diajukan untuk persetujuan.' }, { status: 409 });
    update = { status: 'waiting_approval' };
  } else if (action === 'approve') {
    if (reminder.status !== 'waiting_approval') return NextResponse.json({ error: 'Ajukan draf untuk persetujuan terlebih dahulu.' }, { status: 409 });
    update = { status: 'approved', approved_by: auth.email, approved_at: new Date().toISOString() };
  } else if (action === 'mark_sent') {
    if (reminder.status !== 'approved') return NextResponse.json({ error: 'Pengingat harus disetujui sebelum ditandai terkirim.' }, { status: 409 });
    update = { status: 'sent', sent_at: new Date().toISOString() };
  } else {
    return NextResponse.json({ error: 'Tindakan pengingat tidak dikenal.' }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from('project_invoice_reminder_drafts')
    .update(update)
    .eq('id', reminderId)
    .select('*')
    .single();

  if (error || !data) return NextResponse.json({ error: 'Gagal memperbarui draf pengingat.' }, { status: 500 });

  await writeInvoiceAudit(auth.supabase, reminder.invoice_id, 'reminder_' + String(action), auth.email, { reminder_id: reminderId });
  return NextResponse.json({ data });
}
