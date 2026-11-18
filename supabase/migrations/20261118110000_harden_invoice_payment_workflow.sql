-- Keep invoice payment, reminder transitions, and their audit entries atomic.
-- This migration is additive; it does not run until explicitly applied to a database.

create or replace function public.record_project_invoice_payment(
  p_invoice_id uuid,
  p_amount bigint,
  p_paid_at date,
  p_reference text,
  p_notes text
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog
as $record_payment$
declare
  v_actor_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_invoice public.project_invoices%rowtype;
  v_payment public.project_invoice_payments%rowtype;
  v_paid_total numeric;
  v_new_paid_total numeric;
  v_payment_status text;
begin
  if v_actor_email <> 'eryawanagungtrimuda@gmail.com' then
    raise exception using errcode = '42501', message = 'Forbidden.';
  end if;

  if p_amount is null or p_amount <= 0 or p_paid_at is null then
    raise exception using errcode = '22023', message = 'Nominal dan tanggal pembayaran wajib valid.';
  end if;

  -- Serialize all payment attempts for this invoice before calculating the balance.
  select invoice_row.*
  into v_invoice
  from public.project_invoices as invoice_row
  where invoice_row.id = p_invoice_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'Invoice tidak ditemukan.';
  end if;

  if v_invoice.invoice_status not in ('approved', 'sent') then
    raise exception using errcode = 'P0001', message = 'Pembayaran hanya dapat dicatat setelah invoice disetujui.';
  end if;

  select coalesce(sum(payment_row.amount), 0)::numeric
  into v_paid_total
  from public.project_invoice_payments as payment_row
  where payment_row.invoice_id = p_invoice_id;

  if p_amount::numeric > v_invoice.amount_due::numeric - v_paid_total then
    raise exception using errcode = '22023', message = 'Nominal pembayaran melebihi sisa tagihan.';
  end if;

  insert into public.project_invoice_payments (
    invoice_id,
    amount,
    paid_at,
    payment_method,
    reference,
    notes,
    verified_by,
    verified_at
  )
  values (
    p_invoice_id,
    p_amount,
    p_paid_at,
    'qris_shopee',
    nullif(left(btrim(coalesce(p_reference, '')), 160), ''),
    nullif(left(btrim(coalesce(p_notes, '')), 1000), ''),
    v_actor_email,
    now()
  )
  returning *
  into v_payment;

  v_new_paid_total := v_paid_total + p_amount::numeric;
  v_payment_status := case
    when v_new_paid_total >= v_invoice.amount_due then 'paid'
    else 'partial'
  end;

  update public.project_invoices
  set payment_status = v_payment_status
  where id = p_invoice_id;

  -- The payment audit is written by an AFTER INSERT trigger in this transaction.
  -- If audit insertion fails, PostgreSQL rolls back the payment and status update.
  return jsonb_build_object(
    'payment', to_jsonb(v_payment),
    'payment_status', v_payment_status
  );
end;
$record_payment$;

create or replace function public.transition_project_invoice(
  p_invoice_id uuid,
  p_action text,
  p_channel text
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog
as $invoice_transition$
declare
  v_actor_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_invoice public.project_invoices%rowtype;
  v_settings public.project_invoice_settings%rowtype;
begin
  if v_actor_email <> 'eryawanagungtrimuda@gmail.com' then
    raise exception using errcode = '42501', message = 'Forbidden.';
  end if;

  select invoice_row.*
  into v_invoice
  from public.project_invoices as invoice_row
  where invoice_row.id = p_invoice_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'Invoice tidak ditemukan.';
  end if;

  if p_action = 'request_approval' then
    if v_invoice.invoice_status <> 'draft' then
      raise exception using errcode = 'P0001', message = 'Hanya draf invoice yang dapat diajukan untuk persetujuan.';
    end if;

    update public.project_invoices
    set invoice_status = 'waiting_approval'
    where id = p_invoice_id
    returning *
    into v_invoice;

  elsif p_action = 'approve' then
    if v_invoice.invoice_status <> 'waiting_approval' then
      raise exception using errcode = 'P0001', message = 'Ajukan draf untuk persetujuan terlebih dahulu.';
    end if;

    select settings_row.*
    into v_settings
    from public.project_invoice_settings as settings_row
    where settings_row.id = 1;

    if not found then
      raise exception using errcode = 'P0001', message = 'Pengaturan invoice belum tersedia.';
    end if;

    if nullif(btrim(coalesce(v_settings.billing_name, '')), '') is null
      or nullif(btrim(coalesce(v_settings.billing_contact, '')), '') is null
      or nullif(btrim(coalesce(v_settings.qris_image_path, '')), '') is null then
      raise exception using errcode = '22023', message = 'Lengkapi identitas penagih, kontak, dan unggah QRIS Shopee terlebih dahulu sebelum menyetujui invoice.';
    end if;

    if nullif(btrim(coalesce(v_invoice.client_email_snapshot, '')), '') is null
      and nullif(btrim(coalesce(v_invoice.client_whatsapp_snapshot, '')), '') is null then
      raise exception using errcode = '22023', message = 'Inquiry belum memiliki email atau nomor WhatsApp klien untuk pengiriman invoice.';
    end if;

    update public.project_invoices
    set invoice_status = 'approved',
        approved_by = v_actor_email,
        approved_at = now(),
        billing_name_snapshot = v_settings.billing_name,
        billing_contact_snapshot = v_settings.billing_contact,
        billing_address_snapshot = v_settings.billing_address,
        qris_image_path_snapshot = v_settings.qris_image_path,
        tax_note_snapshot = coalesce(nullif(v_settings.tax_note, ''), 'Pajak tidak ditambahkan pada invoice ini.')
    where id = p_invoice_id
    returning *
    into v_invoice;

  elsif p_action = 'mark_sent' then
    if v_invoice.invoice_status <> 'approved' then
      raise exception using errcode = 'P0001', message = 'Invoice harus disetujui sebelum ditandai terkirim.';
    end if;

    if p_channel is null or p_channel not in ('whatsapp', 'email', 'manual') then
      raise exception using errcode = '22023', message = 'Saluran pengiriman tidak valid.';
    end if;

    if p_channel = 'whatsapp'
      and nullif(btrim(coalesce(v_invoice.client_whatsapp_snapshot, '')), '') is null then
      raise exception using errcode = '22023', message = 'Nomor WhatsApp klien belum tersedia.';
    end if;

    if p_channel = 'email'
      and nullif(btrim(coalesce(v_invoice.client_email_snapshot, '')), '') is null then
      raise exception using errcode = '22023', message = 'Email klien belum tersedia.';
    end if;

    update public.project_invoices
    set invoice_status = 'sent',
        sent_channel = p_channel,
        sent_at = now()
    where id = p_invoice_id
    returning *
    into v_invoice;

  elsif p_action = 'cancel' then
    if v_invoice.invoice_status in ('sent', 'cancelled') then
      raise exception using errcode = 'P0001', message = 'Invoice terkirim atau sudah dibatalkan tidak dapat dibatalkan lagi dari tindakan ini.';
    end if;

    if exists (
      select 1
      from public.project_invoice_payments as payment_row
      where payment_row.invoice_id = p_invoice_id
    ) then
      raise exception using errcode = 'P0001', message = 'Invoice dengan pembayaran tercatat tidak dapat dibatalkan.';
    end if;

    update public.project_invoices
    set invoice_status = 'cancelled'
    where id = p_invoice_id
    returning *
    into v_invoice;

  else
    raise exception using errcode = '22023', message = 'Tindakan invoice tidak dikenal.';
  end if;

  -- Invoice audit triggers run in this transaction with the state change.
  return to_jsonb(v_invoice);
end;
$invoice_transition$;

create or replace function public.transition_project_invoice_reminder(
  p_reminder_id uuid,
  p_action text,
  p_message_body text,
  p_subject text
)
returns jsonb
language plpgsql
security invoker
set search_path = pg_catalog
as $reminder_transition$
declare
  v_actor_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_invoice_id uuid;
  v_invoice public.project_invoices%rowtype;
  v_reminder public.project_invoice_reminder_drafts%rowtype;
  v_paid_total numeric;
  v_message_body text;
  v_subject text;
begin
  if v_actor_email <> 'eryawanagungtrimuda@gmail.com' then
    raise exception using errcode = '42501', message = 'Forbidden.';
  end if;

  select reminder_row.invoice_id
  into v_invoice_id
  from public.project_invoice_reminder_drafts as reminder_row
  where reminder_row.id = p_reminder_id;

  if not found then
    raise exception using errcode = 'P0002', message = 'Draf pengingat tidak ditemukan.';
  end if;

  -- Use the same invoice-first lock order as payment recording to serialize
  -- approval/sending against payments and invoice cancellation.
  select invoice_row.*
  into v_invoice
  from public.project_invoices as invoice_row
  where invoice_row.id = v_invoice_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'Invoice tidak ditemukan.';
  end if;

  select reminder_row.*
  into v_reminder
  from public.project_invoice_reminder_drafts as reminder_row
  where reminder_row.id = p_reminder_id
    and reminder_row.invoice_id = v_invoice_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'Draf pengingat tidak ditemukan.';
  end if;

  if p_action in ('request_approval', 'approve', 'mark_sent') then
    if v_invoice.invoice_status not in ('approved', 'sent') then
      raise exception using errcode = 'P0001', message = 'Pengingat tidak dapat disetujui atau dikirim karena invoice tidak aktif.';
    end if;

    select coalesce(sum(payment_row.amount), 0)::numeric
    into v_paid_total
    from public.project_invoice_payments as payment_row
    where payment_row.invoice_id = v_invoice_id;

    if v_paid_total >= v_invoice.amount_due then
      raise exception using errcode = 'P0001', message = 'Invoice sudah lunas; pengingat pembayaran tidak diperlukan.';
    end if;
  end if;

  if p_action = 'update_draft' then
    if v_reminder.status <> 'draft' then
      raise exception using errcode = 'P0001', message = 'Hanya draf yang belum diajukan yang dapat diedit.';
    end if;

    v_message_body := left(btrim(coalesce(p_message_body, '')), 4000);
    if v_message_body = '' then
      raise exception using errcode = '22023', message = 'Isi pesan pengingat tidak boleh kosong.';
    end if;

    v_subject := case
      when v_reminder.channel = 'email'
        then coalesce(nullif(left(btrim(coalesce(p_subject, '')), 200), ''), 'Pengingat pembayaran — Eryawan Agung')
      else null
    end;

    update public.project_invoice_reminder_drafts
    set message_body = v_message_body,
        subject = v_subject
    where id = p_reminder_id
    returning *
    into v_reminder;

  elsif p_action = 'request_approval' then
    if v_reminder.status <> 'draft' then
      raise exception using errcode = 'P0001', message = 'Hanya draf yang dapat diajukan untuk persetujuan.';
    end if;

    update public.project_invoice_reminder_drafts
    set status = 'waiting_approval'
    where id = p_reminder_id
    returning *
    into v_reminder;

  elsif p_action = 'approve' then
    if v_reminder.status <> 'waiting_approval' then
      raise exception using errcode = 'P0001', message = 'Ajukan draf untuk persetujuan terlebih dahulu.';
    end if;

    update public.project_invoice_reminder_drafts
    set status = 'approved',
        approved_by = v_actor_email,
        approved_at = now()
    where id = p_reminder_id
    returning *
    into v_reminder;

  elsif p_action = 'mark_sent' then
    if v_reminder.status <> 'approved' then
      raise exception using errcode = 'P0001', message = 'Pengingat harus disetujui sebelum ditandai terkirim.';
    end if;

    update public.project_invoice_reminder_drafts
    set status = 'sent',
        sent_at = now()
    where id = p_reminder_id
    returning *
    into v_reminder;

  else
    raise exception using errcode = '22023', message = 'Tindakan pengingat tidak dikenal.';
  end if;

  -- Reminder audit triggers run in this transaction with the state change.
  return to_jsonb(v_reminder);
end;
$reminder_transition$;

create or replace function public.audit_project_invoice_row()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $audit_invoice$
declare
  v_event_key text;
  v_actor_email text;
  v_metadata jsonb := '{}'::jsonb;
begin
  v_actor_email := coalesce(
    nullif(lower(auth.jwt() ->> 'email'), ''),
    nullif(lower(coalesce(new.created_by, new.approved_by)), ''),
    'system'
  );

  if tg_op = 'INSERT' then
    v_event_key := 'invoice_created';
    v_metadata := jsonb_build_object(
      'stage', new.installment_stage,
      'amount_due', new.amount_due,
      'invoice_number', new.invoice_number
    );
  else
    if old.invoice_status is not distinct from new.invoice_status then
      return new;
    end if;

    case new.invoice_status
      when 'waiting_approval' then v_event_key := 'invoice_waiting_approval';
      when 'approved' then v_event_key := 'invoice_approved';
      when 'sent' then
        v_event_key := 'invoice_marked_sent';
        v_metadata := jsonb_build_object('channel', new.sent_channel);
      when 'cancelled' then v_event_key := 'invoice_cancelled';
      else return new;
    end case;
  end if;

  insert into public.project_invoice_audit_log (invoice_id, event_key, actor_email, metadata)
  values (new.id, v_event_key, v_actor_email, v_metadata);

  return new;
end;
$audit_invoice$;

create or replace function public.audit_project_invoice_payment_row()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $audit_payment$
declare
  v_actor_email text;
  v_amount_due numeric;
  v_paid_total numeric;
  v_payment_status text;
begin
  select invoice_row.amount_due::numeric
  into v_amount_due
  from public.project_invoices as invoice_row
  where invoice_row.id = new.invoice_id;

  select coalesce(sum(payment_row.amount), 0)::numeric
  into v_paid_total
  from public.project_invoice_payments as payment_row
  where payment_row.invoice_id = new.invoice_id;

  v_payment_status := case
    when v_paid_total >= v_amount_due then 'paid'
    when v_paid_total > 0 then 'partial'
    else 'unpaid'
  end;

  v_actor_email := coalesce(
    nullif(lower(auth.jwt() ->> 'email'), ''),
    nullif(lower(new.verified_by), ''),
    'system'
  );

  insert into public.project_invoice_audit_log (invoice_id, event_key, actor_email, metadata)
  values (
    new.invoice_id,
    'payment_recorded',
    v_actor_email,
    jsonb_build_object(
      'payment_id', new.id,
      'amount', new.amount,
      'payment_status', v_payment_status
    )
  );

  return new;
end;
$audit_payment$;

create or replace function public.audit_project_invoice_reminder_row()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $audit_reminder$
declare
  v_event_key text;
  v_actor_email text;
  v_metadata jsonb;
begin
  if tg_op = 'INSERT' then
    v_event_key := 'reminder_draft_created';
  elsif old.status is distinct from new.status then
    case new.status
      when 'waiting_approval' then v_event_key := 'reminder_request_approval';
      when 'approved' then v_event_key := 'reminder_approve';
      when 'sent' then v_event_key := 'reminder_mark_sent';
      when 'archived' then v_event_key := 'reminder_archived';
      else v_event_key := 'reminder_status_changed';
    end case;
  elsif old.message_body is distinct from new.message_body
    or old.subject is distinct from new.subject then
    v_event_key := 'reminder_update_draft';
  else
    return new;
  end if;

  v_actor_email := coalesce(
    nullif(lower(auth.jwt() ->> 'email'), ''),
    nullif(lower(coalesce(new.approved_by, new.created_by)), ''),
    'system'
  );

  v_metadata := jsonb_build_object(
    'reminder_id', new.id,
    'channel', new.channel,
    'reminder_type', new.reminder_type
  );

  insert into public.project_invoice_audit_log (invoice_id, event_key, actor_email, metadata)
  values (new.invoice_id, v_event_key, v_actor_email, v_metadata);

  return new;
end;
$audit_reminder$;

drop trigger if exists audit_project_invoice_insert on public.project_invoices;
create trigger audit_project_invoice_insert
after insert on public.project_invoices
for each row execute function public.audit_project_invoice_row();

drop trigger if exists audit_project_invoice_status_update on public.project_invoices;
create trigger audit_project_invoice_status_update
after update of invoice_status on public.project_invoices
for each row when (old.invoice_status is distinct from new.invoice_status)
execute function public.audit_project_invoice_row();

drop trigger if exists audit_project_invoice_payment_insert on public.project_invoice_payments;
create trigger audit_project_invoice_payment_insert
after insert on public.project_invoice_payments
for each row execute function public.audit_project_invoice_payment_row();

drop trigger if exists audit_project_invoice_reminder_insert on public.project_invoice_reminder_drafts;
create trigger audit_project_invoice_reminder_insert
after insert on public.project_invoice_reminder_drafts
for each row execute function public.audit_project_invoice_reminder_row();

drop trigger if exists audit_project_invoice_reminder_update on public.project_invoice_reminder_drafts;
create trigger audit_project_invoice_reminder_update
after update of status, message_body, subject on public.project_invoice_reminder_drafts
for each row
when (
  old.status is distinct from new.status
  or old.message_body is distinct from new.message_body
  or old.subject is distinct from new.subject
)
execute function public.audit_project_invoice_reminder_row();

-- Only the authenticated admin can invoke the workflow functions directly.
revoke all on function public.record_project_invoice_payment(uuid, bigint, date, text, text) from public, anon, authenticated;
revoke all on function public.transition_project_invoice(uuid, text, text) from public, anon, authenticated;
revoke all on function public.transition_project_invoice_reminder(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.record_project_invoice_payment(uuid, bigint, date, text, text) to authenticated;
grant execute on function public.transition_project_invoice(uuid, text, text) to authenticated;
grant execute on function public.transition_project_invoice_reminder(uuid, text, text, text) to authenticated;

-- Trigger functions are not API entry points.
revoke all on function public.audit_project_invoice_row() from public, anon, authenticated;
revoke all on function public.audit_project_invoice_payment_row() from public, anon, authenticated;
revoke all on function public.audit_project_invoice_reminder_row() from public, anon, authenticated;
