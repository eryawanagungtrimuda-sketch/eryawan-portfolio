import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { isAllowedAdminEmail } from '@/lib/admin-auth';

export async function getAdminRequestContext(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return { response: NextResponse.json({ error: 'Konfigurasi server belum siap.' }, { status: 503 }) };
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader) return { response: NextResponse.json({ error: 'Unauthorized.' }, { status: 401 }) };

  const supabase = createClient(url, key, { global: { headers: { Authorization: authHeader } } });
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return { response: NextResponse.json({ error: 'Unauthorized.' }, { status: 401 }) };
  if (!isAllowedAdminEmail(data.user.email)) {
    return { response: NextResponse.json({ error: 'Forbidden.' }, { status: 403 }) };
  }

  return { supabase, email: data.user.email || '' };
}

export async function writeInvoiceAudit(
  supabase: SupabaseClient,
  invoiceId: string,
  eventKey: string,
  actorEmail: string,
  metadata: Record<string, unknown> = {},
) {
  const { error } = await supabase.from('project_invoice_audit_log').insert({
    invoice_id: invoiceId,
    event_key: eventKey,
    actor_email: actorEmail,
    metadata,
  });
  if (error) console.warn('[invoice-audit] Could not write audit event', { eventKey, code: error.code });
}
