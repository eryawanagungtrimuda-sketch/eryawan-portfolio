import { NextResponse } from 'next/server';
import { getAdminRequestContext } from '@/lib/admin-api-auth';
import { invoiceRpcErrorResponse } from '@/lib/invoice-rpc-errors';

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

  const action = body.action;
  if (
    action !== 'update_draft'
    && action !== 'request_approval'
    && action !== 'approve'
    && action !== 'mark_sent'
  ) {
    return NextResponse.json({ error: 'Tindakan pengingat tidak dikenal.' }, { status: 400 });
  }

  const { data, error } = await auth.supabase.rpc('transition_project_invoice_reminder', {
    p_reminder_id: reminderId,
    p_action: action,
    p_message_body: action === 'update_draft' ? safeText(body.messageBody, 4000) : null,
    p_subject: typeof body.subject === 'string' ? safeText(body.subject, 200) : null,
  });

  if (error) return invoiceRpcErrorResponse(error, 'Gagal memperbarui draf pengingat.');
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return NextResponse.json({ error: 'Respons tindakan pengingat tidak valid.' }, { status: 500 });
  }

  return NextResponse.json({ data });
}
