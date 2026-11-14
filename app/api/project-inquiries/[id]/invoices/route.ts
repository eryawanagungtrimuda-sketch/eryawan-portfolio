import { NextResponse } from 'next/server';
import { getAdminRequestContext, writeInvoiceAudit } from '@/lib/admin-api-auth';

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const stageConfig = {
  dp: { percentage: 50, label: 'DP sebelum pekerjaan dimulai' },
  progress: { percentage: 30, label: 'Presentasi progres desain' },
  final: { percentage: 20, label: 'Sebelum hasil final diserahkan' },
} as const;

function isIsoDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value + 'T00:00:00.000Z');
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function jakartaDate() {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return String(values.year) + '-' + String(values.month) + '-' + String(values.day);
}

function safeText(value: unknown, maxLength: number) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAdminRequestContext(request);
  if ('response' in auth) return auth.response;

  const { id } = await params;
  if (!uuidPattern.test(id)) return NextResponse.json({ error: 'ID inquiry tidak valid.' }, { status: 400 });

  const { data: inquiry, error: inquiryError } = await auth.supabase
    .from('project_inquiries')
    .select('id,nama,perusahaan,email,whatsapp,jenis_kebutuhan,jenis_proyek,paket_id')
    .eq('id', id)
    .maybeSingle();

  if (inquiryError || !inquiry) {
    return NextResponse.json({ error: 'Inquiry tidak ditemukan.' }, { status: 404 });
  }

  const [profileResult, invoicesResult] = await Promise.all([
    auth.supabase
      .from('project_inquiry_billing_profiles')
      .select('id,inquiry_id,agreed_total_fee,created_by,created_at,updated_at')
      .eq('inquiry_id', id)
      .maybeSingle(),
    auth.supabase
      .from('project_invoices')
      .select('*')
      .eq('inquiry_id', id)
      .order('created_at', { ascending: false }),
  ]);

  if (profileResult.error || invoicesResult.error) {
    console.error('[invoices][GET]', { profileCode: profileResult.error?.code, invoiceCode: invoicesResult.error?.code });
    return NextResponse.json({ error: 'Gagal memuat data invoice.' }, { status: 500 });
  }

  const invoices = invoicesResult.data || [];
  const invoiceIds = invoices.map((invoice) => invoice.id);
  let payments: Array<Record<string, unknown>> = [];
  let reminders: Array<Record<string, unknown>> = [];

  if (invoiceIds.length) {
    const [paymentsResult, remindersResult] = await Promise.all([
      auth.supabase
        .from('project_invoice_payments')
        .select('id,invoice_id,amount,paid_at,payment_method,reference,notes,verified_by,verified_at,created_at')
        .in('invoice_id', invoiceIds)
        .order('paid_at', { ascending: false }),
      auth.supabase
        .from('project_invoice_reminder_drafts')
        .select('id,invoice_id,channel,reminder_type,status,subject,message_body,created_by,approved_by,approved_at,sent_at,created_at,updated_at')
        .in('invoice_id', invoiceIds)
        .order('created_at', { ascending: false }),
    ]);

    if (paymentsResult.error || remindersResult.error) {
      console.error('[invoices][GET related]', { paymentCode: paymentsResult.error?.code, reminderCode: remindersResult.error?.code });
      return NextResponse.json({ error: 'Gagal memuat riwayat pembayaran atau pengingat.' }, { status: 500 });
    }
    payments = (paymentsResult.data || []) as Array<Record<string, unknown>>;
    reminders = (remindersResult.data || []) as Array<Record<string, unknown>>;
  }

  const today = jakartaDate();
  const enrichedInvoices = invoices.map((invoice) => {
    const invoicePayments = payments.filter((payment) => payment.invoice_id === invoice.id);
    const paidTotal = invoicePayments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    const paymentStatus = paidTotal >= Number(invoice.amount_due) ? 'paid' : paidTotal > 0 ? 'partial' : 'unpaid';
    return {
      ...invoice,
      payment_status: paymentStatus,
      display_payment_status:
        (invoice.invoice_status === 'approved' || invoice.invoice_status === 'sent') && paymentStatus !== 'paid' && invoice.due_date < today
          ? 'overdue'
          : paymentStatus,
      payments: invoicePayments,
      reminders: reminders.filter((reminder) => reminder.invoice_id === invoice.id),
    };
  });

  return NextResponse.json({ inquiry, profile: profileResult.data || null, invoices: enrichedInvoices });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAdminRequestContext(request);
  if ('response' in auth) return auth.response;

  const { id } = await params;
  if (!uuidPattern.test(id)) return NextResponse.json({ error: 'ID inquiry tidak valid.' }, { status: 400 });

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

  const totalFee = Number(body.agreedTotalFee);
  if (!Number.isSafeInteger(totalFee) || totalFee < 100 || totalFee > 1000000000000) {
    return NextResponse.json({ error: 'Total biaya yang disepakati minimal Rp100 dan harus berupa angka rupiah yang valid.' }, { status: 400 });
  }

  const [existingProfile, existingInvoices] = await Promise.all([
    auth.supabase
      .from('project_inquiry_billing_profiles')
      .select('id,agreed_total_fee')
      .eq('inquiry_id', id)
      .maybeSingle(),
    auth.supabase.from('project_invoices').select('id').eq('inquiry_id', id).neq('invoice_status', 'cancelled').limit(1),
  ]);

  if (existingProfile.error || existingInvoices.error) {
    return NextResponse.json({ error: 'Gagal memeriksa data biaya proyek.' }, { status: 500 });
  }

  const hasInvoices = (existingInvoices.data || []).length > 0;
  if (hasInvoices && existingProfile.data && Number(existingProfile.data.agreed_total_fee) !== totalFee) {
    return NextResponse.json({
      error: 'Total biaya tidak dapat diubah setelah invoice dibuat. Batalkan invoice yang keliru dan tinjau perubahan melalui admin sebelum membuat invoice baru.',
    }, { status: 409 });
  }

  const values = { inquiry_id: id, agreed_total_fee: totalFee, created_by: auth.email };
  const saved = existingProfile.data
    ? await auth.supabase.from('project_inquiry_billing_profiles').update(values).eq('inquiry_id', id).select('*').single()
    : await auth.supabase.from('project_inquiry_billing_profiles').insert(values).select('*').single();

  if (saved.error || !saved.data) {
    console.error('[invoices][PATCH profile]', { code: saved.error?.code });
    return NextResponse.json({ error: 'Gagal menyimpan total biaya proyek.' }, { status: 500 });
  }

  return NextResponse.json({ profile: saved.data });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await getAdminRequestContext(request);
  if ('response' in auth) return auth.response;

  const { id } = await params;
  if (!uuidPattern.test(id)) return NextResponse.json({ error: 'ID inquiry tidak valid.' }, { status: 400 });

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

  const stage = body.stage;
  if (typeof stage !== 'string' || !Object.prototype.hasOwnProperty.call(stageConfig, stage)) {
    return NextResponse.json({ error: 'Termin pembayaran tidak valid.' }, { status: 400 });
  }
  const typedStage = stage as keyof typeof stageConfig;
  const issueDate = isIsoDate(body.issueDate) ? body.issueDate : jakartaDate();
  const dueDate = body.dueDate;
  if (!isIsoDate(dueDate) || dueDate < issueDate) {
    return NextResponse.json({ error: 'Tanggal jatuh tempo harus sama atau setelah tanggal invoice.' }, { status: 400 });
  }

  const [inquiryResult, profileResult, existingResult] = await Promise.all([
    auth.supabase.from('project_inquiries').select('id,nama,email,whatsapp,jenis_kebutuhan,jenis_proyek,paket_id').eq('id', id).maybeSingle(),
    auth.supabase.from('project_inquiry_billing_profiles').select('agreed_total_fee').eq('inquiry_id', id).maybeSingle(),
    auth.supabase.from('project_invoices').select('id').eq('inquiry_id', id).eq('installment_stage', typedStage).neq('invoice_status', 'cancelled').limit(1),
  ]);

  if (inquiryResult.error || !inquiryResult.data) return NextResponse.json({ error: 'Inquiry tidak ditemukan.' }, { status: 404 });
  if (profileResult.error) return NextResponse.json({ error: 'Gagal memuat total biaya proyek.' }, { status: 500 });
  if (!profileResult.data || !Number.isSafeInteger(Number(profileResult.data.agreed_total_fee))) {
    return NextResponse.json({ error: 'Simpan total biaya yang disepakati sebelum membuat invoice.' }, { status: 400 });
  }
  if (existingResult.error) return NextResponse.json({ error: 'Gagal memeriksa termin invoice.' }, { status: 500 });
  if ((existingResult.data || []).length) {
    return NextResponse.json({ error: 'Invoice untuk termin ini sudah ada. Batalkan invoice lama jika memang perlu membuat pengganti.' }, { status: 409 });
  }

  const totalFee = Number(profileResult.data.agreed_total_fee);
  const dpAmount = Math.round(totalFee * 0.5);
  const progressAmount = Math.round(totalFee * 0.3);
  const amountDue = typedStage === 'dp' ? dpAmount : typedStage === 'progress' ? progressAmount : totalFee - dpAmount - progressAmount;
  const inquiry = inquiryResult.data;
  const projectLabel = [inquiry.jenis_kebutuhan, inquiry.jenis_proyek].filter(Boolean).join(' — ') || 'Layanan desain';

  const { data: invoice, error } = await auth.supabase
    .from('project_invoices')
    .insert({
      inquiry_id: id,
      installment_stage: typedStage,
      installment_percentage: stageConfig[typedStage].percentage,
      total_project_fee: totalFee,
      amount_due: amountDue,
      issue_date: issueDate,
      due_date: dueDate,
      invoice_status: 'draft',
      payment_status: 'unpaid',
      client_name_snapshot: inquiry.nama || 'Calon klien',
      client_email_snapshot: inquiry.email || null,
      client_whatsapp_snapshot: inquiry.whatsapp || null,
      project_label_snapshot: projectLabel,
      created_by: auth.email,
    })
    .select('*')
    .single();

  if (error || !invoice) {
    console.error('[invoices][POST]', { code: error?.code });
    if (error?.code === '23505') {
      return NextResponse.json({ error: 'Nomor invoice atau termin sudah digunakan. Muat ulang daftar invoice lalu coba lagi.' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Gagal membuat draf invoice.' }, { status: 500 });
  }

  await writeInvoiceAudit(auth.supabase, invoice.id, 'invoice_created', auth.email, {
    stage: typedStage,
    amount_due: amountDue,
    invoice_number: invoice.invoice_number,
  });

  return NextResponse.json({ data: invoice }, { status: 201 });
}
