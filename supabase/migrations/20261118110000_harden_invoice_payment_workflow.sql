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
security definer
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
security definer
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

create or replace function public.create_project_invoice(
  p_inquiry_id uuid,
  p_stage text,
  p_issue_date date,
  p_due_date date
)
returns jsonb
language plpgsql
security definer
set search_path = pg_catalog
as $create_invoice$
declare
  v_actor_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_profile public.project_inquiry_billing_profiles%rowtype;
  v_inquiry public.project_inquiries%rowtype;
  v_invoice public.project_invoices%rowtype;
  v_dp_amount bigint;
  v_progress_amount bigint;
  v_amount_due bigint;
  v_project_label text;
begin
  if v_actor_email <> 'eryawanagungtrimuda@gmail.com' then
    raise exception using errcode = '42501', message = 'Forbidden.';
  end if;

  if p_stage is null or p_stage not in ('dp', 'progress', 'final') then
    raise exception using errcode = '22023', message = 'Termin pembayaran tidak valid.';
  end if;

  if p_issue_date is null or p_due_date is null or p_due_date < p_issue_date then
    raise exception using errcode = '22023', message = 'Tanggal jatuh tempo harus sama atau setelah tanggal invoice.';
  end if;

  -- Lock the agreed fee so concurrent invoice creation and fee changes serialize.
  select profile_row.*
  into v_profile
  from public.project_inquiry_billing_profiles as profile_row
  where profile_row.inquiry_id = p_inquiry_id
  for update;

  if not found then
    raise exception using errcode = '22023', message = 'Simpan total biaya yang disepakati sebelum membuat invoice.';
  end if;

  if v_profile.agreed_total_fee < 100 or v_profile.agreed_total_fee > 1000000000000 then
    raise exception using errcode = '22023', message = 'Total biaya proyek harus antara Rp100 dan Rp1.000.000.000.000.';
  end if;

  select inquiry_row.*
  into v_inquiry
  from public.project_inquiries as inquiry_row
  where inquiry_row.id = p_inquiry_id;

  if not found then
    raise exception using errcode = 'P0002', message = 'Inquiry tidak ditemukan.';
  end if;

  if exists (
    select 1
    from public.project_invoices as invoice_row
    where invoice_row.inquiry_id = p_inquiry_id
      and invoice_row.installment_stage = p_stage
      and invoice_row.invoice_status <> 'cancelled'
  ) then
    raise exception using errcode = 'P0001', message = 'Invoice untuk termin ini sudah ada. Batalkan invoice lama jika memang perlu membuat pengganti.';
  end if;

  v_dp_amount := round(v_profile.agreed_total_fee::numeric * 50 / 100)::bigint;
  v_progress_amount := round(v_profile.agreed_total_fee::numeric * 30 / 100)::bigint;
  v_amount_due := case p_stage
    when 'dp' then v_dp_amount
    when 'progress' then v_progress_amount
    else v_profile.agreed_total_fee - v_dp_amount - v_progress_amount
  end;

  v_project_label := coalesce(
    nullif(
      concat_ws(
        ' — ',
        nullif(btrim(coalesce(v_inquiry.jenis_kebutuhan, '')), ''),
        nullif(btrim(coalesce(v_inquiry.jenis_proyek, '')), '')
      ),
      ''
    ),
    'Layanan desain'
  );

  insert into public.project_invoices (
    inquiry_id,
    installment_stage,
    installment_percentage,
    total_project_fee,
    amount_due,
    issue_date,
    due_date,
    invoice_status,
    payment_status,
    client_name_snapshot,
    client_email_snapshot,
    client_whatsapp_snapshot,
    project_label_snapshot,
    created_by
  )
  values (
    p_inquiry_id,
    p_stage,
    case p_stage when 'dp' then 50 when 'progress' then 30 else 20 end,
    v_profile.agreed_total_fee,
    v_amount_due,
    p_issue_date,
    p_due_date,
    'draft',
    'unpaid',
    coalesce(nullif(btrim(coalesce(v_inquiry.nama, '')), ''), 'Calon klien'),
    nullif(btrim(coalesce(v_inquiry.email, '')), ''),
    nullif(btrim(coalesce(v_inquiry.whatsapp, '')), ''),
    v_project_label,
    v_actor_email
  )
  returning *
  into v_invoice;

  return to_jsonb(v_invoice);
end;
$create_invoice$;

create or replace function public.guard_project_inquiry_billing_profile_fee()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $guard_billing_fee$
begin
  if old.inquiry_id is distinct from new.inquiry_id then
    raise exception using
      errcode = 'P0001',
      message = 'Billing profile tidak dapat dipindahkan ke inquiry lain.';
  end if;

  if old.agreed_total_fee is distinct from new.agreed_total_fee
    and exists (
      select 1
      from public.project_invoices as invoice_row
      where invoice_row.inquiry_id = old.inquiry_id
        and invoice_row.invoice_status <> 'cancelled'
    ) then
    raise exception using
      errcode = 'P0001',
      message = 'Total biaya tidak dapat diubah setelah invoice aktif dibuat.';
  end if;

  return new;
end;
$guard_billing_fee$;

drop trigger if exists guard_project_inquiry_billing_profile_fee on public.project_inquiry_billing_profiles;
create trigger guard_project_inquiry_billing_profile_fee
before update of inquiry_id, agreed_total_fee on public.project_inquiry_billing_profiles
for each row execute function public.guard_project_inquiry_billing_profile_fee();

create or replace function public.transition_project_invoice_reminder(
  p_reminder_id uuid,
  p_action text,
  p_message_body text,
  p_subject text
)
returns jsonb
language plpgsql
security definer
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

create or replace function public.audit_project_invoice_row()
returns trigger
language plpgsql
security definer
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
security definer
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
security definer
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

-- Preflight legacy rows and enforce installment math at the database boundary.
-- Fail closed if existing records need manual reconciliation before hardening.
do $invoice_integrity_preflight$
begin
  if exists (
    select 1
    from public.project_invoices as invoice_row
    where invoice_row.amount_due <> case invoice_row.installment_stage
      when 'dp' then round(invoice_row.total_project_fee::numeric * 50 / 100)::bigint
      when 'progress' then round(invoice_row.total_project_fee::numeric * 30 / 100)::bigint
      when 'final' then invoice_row.total_project_fee
        - round(invoice_row.total_project_fee::numeric * 50 / 100)::bigint
        - round(invoice_row.total_project_fee::numeric * 30 / 100)::bigint
    end
  ) then
    raise exception 'Invoice amounts do not match their installment percentages. Reconcile existing invoices before applying this migration.';
  end if;

  if exists (
    select 1
    from public.project_invoice_payments as payment_row
    join public.project_invoices as invoice_row on invoice_row.id = payment_row.invoice_id
    group by payment_row.invoice_id, invoice_row.amount_due
    having sum(payment_row.amount::numeric) > invoice_row.amount_due::numeric
  ) then
    raise exception 'Existing payments exceed an invoice balance. Reconcile payment records before applying this migration.';
  end if;

  if exists (
    select 1
    from public.project_invoices as invoice_row
    join public.project_inquiry_billing_profiles as profile_row
      on profile_row.inquiry_id = invoice_row.inquiry_id
    where invoice_row.invoice_status <> 'cancelled'
      and invoice_row.total_project_fee <> profile_row.agreed_total_fee
  ) then
    raise exception 'An active invoice differs from its agreed billing profile. Reconcile the fee before applying this migration.';
  end if;

  if exists (
    select 1
    from public.project_invoices as invoice_row
    left join (
      select payment_row.invoice_id, sum(payment_row.amount::numeric) as paid_total
      from public.project_invoice_payments as payment_row
      group by payment_row.invoice_id
    ) as payment_totals on payment_totals.invoice_id = invoice_row.id
    where invoice_row.payment_status <> case
      when coalesce(payment_totals.paid_total, 0) >= invoice_row.amount_due then 'paid'
      when coalesce(payment_totals.paid_total, 0) > 0 then 'partial'
      else 'unpaid'
    end
  ) then
    raise exception 'Invoice payment_status does not match its payment history. Reconcile statuses before applying this migration.';
  end if;

  if not exists (
    select 1
    from pg_catalog.pg_constraint
    where conrelid = 'public.project_invoices'::regclass
      and conname = 'project_invoices_amount_due_matches_stage'
  ) then
    alter table public.project_invoices
      add constraint project_invoices_amount_due_matches_stage
      check (
        amount_due = case installment_stage
          when 'dp' then round(total_project_fee::numeric * 50 / 100)::bigint
          when 'progress' then round(total_project_fee::numeric * 30 / 100)::bigint
          when 'final' then total_project_fee
            - round(total_project_fee::numeric * 50 / 100)::bigint
            - round(total_project_fee::numeric * 30 / 100)::bigint
        end
      );
  end if;
end;
$invoice_integrity_preflight$;

-- RPCs are the only write path for invoice/payment/reminder workflow state.
revoke all on function public.create_project_invoice(uuid, text, date, date) from public, anon, authenticated;
revoke all on function public.record_project_invoice_payment(uuid, bigint, date, text, text) from public, anon, authenticated;
revoke all on function public.transition_project_invoice(uuid, text, text) from public, anon, authenticated;
revoke all on function public.create_project_invoice_reminder(uuid, text, text, text, text) from public, anon, authenticated;
revoke all on function public.transition_project_invoice_reminder(uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.create_project_invoice(uuid, text, date, date) to authenticated;
grant execute on function public.record_project_invoice_payment(uuid, bigint, date, text, text) to authenticated;
grant execute on function public.transition_project_invoice(uuid, text, text) to authenticated;
grant execute on function public.create_project_invoice_reminder(uuid, text, text, text, text) to authenticated;
grant execute on function public.transition_project_invoice_reminder(uuid, text, text, text) to authenticated;

-- Trigger functions are not API entry points.
revoke all on function public.assign_project_invoice_number() from public, anon, authenticated;
revoke all on function public.set_project_invoice_updated_at() from public, anon, authenticated;
revoke all on function public.guard_project_inquiry_billing_profile_fee() from public, anon, authenticated;
revoke all on function public.audit_project_invoice_row() from public, anon, authenticated;
revoke all on function public.audit_project_invoice_payment_row() from public, anon, authenticated;
revoke all on function public.audit_project_invoice_reminder_row() from public, anon, authenticated;

-- Remove direct REST write access that could bypass the RPC validation.
revoke all on public.project_invoices from public, anon, authenticated;
grant select on public.project_invoices to authenticated;

revoke all on public.project_invoice_payments from public, anon, authenticated;
grant select on public.project_invoice_payments to authenticated;

revoke all on public.project_invoice_reminder_drafts from public, anon, authenticated;
grant select on public.project_invoice_reminder_drafts to authenticated;

revoke all on public.project_invoice_audit_log from public, anon, authenticated;
grant select on public.project_invoice_audit_log to authenticated;

drop policy if exists project_invoices_admin_all on public.project_invoices;
drop policy if exists project_invoices_admin_select on public.project_invoices;
create policy project_invoices_admin_select on public.project_invoices
for select to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com');

drop policy if exists project_invoice_payments_admin_all on public.project_invoice_payments;
drop policy if exists project_invoice_payments_admin_select on public.project_invoice_payments;
create policy project_invoice_payments_admin_select on public.project_invoice_payments
for select to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com');

drop policy if exists project_invoice_reminders_admin_all on public.project_invoice_reminder_drafts;
drop policy if exists project_invoice_reminders_admin_select on public.project_invoice_reminder_drafts;
create policy project_invoice_reminders_admin_select on public.project_invoice_reminder_drafts
for select to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com');

drop policy if exists project_invoice_audit_log_admin_select on public.project_invoice_audit_log;
drop policy if exists project_invoice_audit_log_admin_insert on public.project_invoice_audit_log;
create policy project_invoice_audit_log_admin_select on public.project_invoice_audit_log
for select to authenticated
using (lower(coalesce(auth.jwt() ->> 'email', '')) = 'eryawanagungtrimuda@gmail.com');

-- Refresh PostgREST so the new RPC functions are discoverable after migration.
notify pgrst, 'reload schema';
