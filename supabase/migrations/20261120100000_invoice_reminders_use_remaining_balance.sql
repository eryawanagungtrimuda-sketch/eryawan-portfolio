-- Ensure reminder drafts use the current outstanding balance under the invoice lock.

create or replace function public.create_project_invoice_reminder(
  p_invoice_id uuid,
  p_channel text,
  p_reminder_type text,
  p_subject text,
  p_message_body text
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $create_reminder$
declare
  v_actor_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_invoice public.project_invoices%rowtype;
  v_reminder public.project_invoice_reminder_drafts%rowtype;
  v_paid_total numeric;
  v_message_body text;
  v_subject text;
begin
  if v_actor_email <> 'eryawanagungtrimuda@gmail.com' then
    raise exception using errcode = '42501', message = 'Forbidden.';
  end if;

  if p_channel is null or p_channel not in ('whatsapp', 'email') then
    raise exception using errcode = '22023', message = 'Saluran pengingat tidak valid.';
  end if;

  if p_reminder_type is null or p_reminder_type not in ('h_minus_1', 'due_today', 'overdue') then
    raise exception using errcode = '22023', message = 'Jenis pengingat tidak valid.';
  end if;

  v_message_body := left(btrim(coalesce(p_message_body, '')), 4000);
  if v_message_body = '' then
    raise exception using errcode = '22023', message = 'Isi pesan pengingat tidak boleh kosong.';
  end if;

  if position('{{SISA_TAGIHAN}}' in v_message_body) = 0 then
    raise exception using errcode = '22023', message = 'Isi pesan pengingat harus menyertakan sisa tagihan.';
  end if;

  v_subject := case
    when p_channel = 'email'
      then coalesce(nullif(left(btrim(coalesce(p_subject, '')), 200), ''), 'Pengingat pembayaran — Eryawan Agung')
    else null
  end;

  -- Serialize reminder creation against payment recording and invoice transitions.
  select invoice_row.*
  into v_invoice
  from public.project_invoices as invoice_row
  where invoice_row.id = p_invoice_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'Invoice tidak ditemukan.';
  end if;

  if v_invoice.invoice_status not in ('approved', 'sent') then
    raise exception using errcode = 'P0001', message = 'Invoice harus disetujui sebelum draf pengingat dibuat.';
  end if;

  if p_channel = 'whatsapp'
    and nullif(btrim(coalesce(v_invoice.client_whatsapp_snapshot, '')), '') is null then
    raise exception using errcode = '22023', message = 'Nomor WhatsApp klien belum tersedia.';
  end if;

  if p_channel = 'email'
    and nullif(btrim(coalesce(v_invoice.client_email_snapshot, '')), '') is null then
    raise exception using errcode = '22023', message = 'Email klien belum tersedia.';
  end if;

  select coalesce(sum(payment_row.amount), 0)::numeric
  into v_paid_total
  from public.project_invoice_payments as payment_row
  where payment_row.invoice_id = p_invoice_id;

  if v_paid_total >= v_invoice.amount_due then
    raise exception using errcode = 'P0001', message = 'Invoice sudah lunas; pengingat pembayaran tidak diperlukan.';
  end if;

  -- Calculate and insert the remaining balance while the invoice row is locked.
  v_message_body := left(
    replace(
      v_message_body,
      '{{SISA_TAGIHAN}}',
      'Rp ' || replace(
        to_char(v_invoice.amount_due::numeric - v_paid_total, 'FM999,999,999,999,999,999'),
        ',',
        '.'
      )
    ),
    4000
  );

  insert into public.project_invoice_reminder_drafts (
    invoice_id,
    channel,
    reminder_type,
    status,
    subject,
    message_body,
    created_by
  )
  values (
    p_invoice_id,
    p_channel,
    p_reminder_type,
    'draft',
    v_subject,
    v_message_body,
    v_actor_email
  )
  returning *
  into v_reminder;

  return to_jsonb(v_reminder);
end;
$create_reminder$;
