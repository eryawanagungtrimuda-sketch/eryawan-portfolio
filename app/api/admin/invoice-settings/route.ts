import { NextResponse } from 'next/server';
import { getAdminRequestContext } from '@/lib/admin-api-auth';

const columns = 'id,billing_name,billing_contact,billing_address,qris_image_path,tax_note,updated_by,created_at,updated_at';

function sanitize(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function GET(request: Request) {
  const auth = await getAdminRequestContext(request);
  if ('response' in auth) return auth.response;

  const { data, error } = await auth.supabase
    .from('project_invoice_settings')
    .select(columns)
    .eq('id', 1)
    .single();

  if (error || !data) {
    console.error('[invoice-settings][GET]', { code: error?.code });
    return NextResponse.json({ error: 'Gagal memuat pengaturan invoice.' }, { status: 500 });
  }

  return NextResponse.json({ data });
}

export async function PATCH(request: Request) {
  const auth = await getAdminRequestContext(request);
  if ('response' in auth) return auth.response;

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

  const update: Record<string, unknown> = { updated_by: auth.email };
  if ('billingName' in body) update.billing_name = sanitize(body.billingName, 180) || null;
  if ('billingContact' in body) update.billing_contact = sanitize(body.billingContact, 180) || null;
  if ('billingAddress' in body) update.billing_address = sanitize(body.billingAddress, 500) || null;

  if ('qrisImagePath' in body) {
    if (body.qrisImagePath === null || body.qrisImagePath === '') {
      update.qris_image_path = null;
    } else if (
      typeof body.qrisImagePath === 'string' &&
      body.qrisImagePath.startsWith('qris/') &&
      /\.(png|jpe?g|webp)$/i.test(body.qrisImagePath) &&
      body.qrisImagePath.length <= 300
    ) {
      update.qris_image_path = body.qrisImagePath;
    } else {
      return NextResponse.json({ error: 'File QRIS tidak valid.' }, { status: 400 });
    }
  }

  if (Object.keys(update).length === 1) {
    return NextResponse.json({ error: 'Tidak ada pengaturan yang diubah.' }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from('project_invoice_settings')
    .update(update)
    .eq('id', 1)
    .select(columns)
    .single();

  if (error || !data) {
    console.error('[invoice-settings][PATCH]', { code: error?.code });
    return NextResponse.json({ error: 'Gagal menyimpan pengaturan invoice.' }, { status: 500 });
  }

  return NextResponse.json({ data });
}
