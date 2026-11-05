import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAllowedAdminEmail } from '@/lib/admin-auth';
import { sendProjectInquiryPushNotification } from '@/lib/project-inquiry-push';
import { ALLOWED_PROMO_SOURCES } from '@/lib/promo-attribution';
import { servicePackages } from '@/lib/service-packages';

export const runtime = 'nodejs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const MAX_FIELD_LENGTH = 3000;
const selectColumns = 'id,nama,perusahaan,email,whatsapp,paket_id,jenis_kebutuhan,lokasi_project,estimasi_luas,tahap_project,timeline,budget_range,kebutuhan_utama,status_file,message_preview,status,source,utm_source,utm_medium,utm_campaign,utm_content,created_at,updated_at';
function sanitize(input: unknown, max = MAX_FIELD_LENGTH) { if (typeof input !== 'string') return ''; return input.trim().slice(0, max); }

export async function GET(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) return NextResponse.json({ error: 'Konfigurasi server belum siap.' }, { status: 500 });
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  const supabase = createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: authHeader } } });
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  if (!isAllowedAdminEmail(userData.user.email)) return NextResponse.json({ error: 'Forbidden.' }, { status: 403 });
  const { data, error } = await supabase.from('project_inquiries').select(selectColumns).order('created_at', { ascending: false });
  if (error) return NextResponse.json({ error: 'Gagal memuat inquiry.' }, { status: 500 });
  return NextResponse.json({ data: data || [] });
}

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) return NextResponse.json({ error: 'Konfigurasi server belum siap.' }, { status: 500 });
  let payload: Record<string, unknown>; try { payload = await request.json(); } catch { return NextResponse.json({ error: 'Payload tidak valid.' }, { status: 400 }); }
  const nama = sanitize(payload.nama ?? payload.name, 160);
  const perusahaan = sanitize(payload.perusahaan ?? payload.company, 160);
  const email = sanitize(payload.email, 160);
  const whatsapp = sanitize(payload.whatsapp, 80);
  const jenisKebutuhan = sanitize(payload.jenisKebutuhan ?? payload.jenis_kebutuhan, 160);
  const lokasiProject = sanitize(payload.lokasiProject ?? payload.projectLocation, 160);
  const estimasiLuas = sanitize(payload.estimasiLuas, 120);
  const tahapProject = sanitize(payload.tahapProject, 160);
  const timeline = sanitize(payload.timeline, 120);
  const budgetRange = sanitize(payload.budgetRange ?? payload.rangeBudget, 120);
  const kebutuhanUtama = sanitize(payload.kebutuhanUtama ?? payload.mainNeeds, 3000);
  const statusFile = sanitize(payload.statusFile, 160);
  const messagePreview = sanitize(payload.messagePreview, 6000);
  const packageIdInput = sanitize(payload.paketId ?? payload.paket_id, 40);
  const selectedPackage = servicePackages.find((item) => item.id === packageIdInput);
  if (packageIdInput && !selectedPackage) {
    return NextResponse.json({ error: 'Paket yang dipilih tidak valid.' }, { status: 400 });
  }

  const sourceCandidate = sanitize(payload.utm_source, 80).toLowerCase();
  const utmSource = ALLOWED_PROMO_SOURCES.has(sourceCandidate) ? sourceCandidate : '';
  const utmMedium = utmSource ? sanitize(payload.utm_medium, 120) : '';
  const utmCampaign = utmSource ? sanitize(payload.utm_campaign, 160) : '';
  const utmContent = utmSource ? sanitize(payload.utm_content, 200) : '';

  if (!nama || !jenisKebutuhan || !kebutuhanUtama || (!email && !whatsapp) || !messagePreview) {
    return NextResponse.json({ error: 'Data brief belum lengkap.' }, { status: 400 });
  }
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase.from('project_inquiries').insert({
    nama,
    perusahaan: perusahaan || null,
    email: email || null,
    whatsapp: whatsapp || null,
    paket_id: selectedPackage?.id || null,
    jenis_kebutuhan: jenisKebutuhan,
    lokasi_project: lokasiProject || null,
    estimasi_luas: estimasiLuas || null,
    tahap_project: tahapProject || null,
    timeline: timeline || null,
    budget_range: budgetRange || null,
    kebutuhan_utama: kebutuhanUtama,
    status_file: statusFile || null,
    message_preview: messagePreview,
    source: utmSource || 'mulai_project',
    utm_source: utmSource || null,
    utm_medium: utmMedium || null,
    utm_campaign: utmCampaign || null,
    utm_content: utmContent || null,
  });
  if (error) return NextResponse.json({ error: 'Gagal menyimpan brief untuk saat ini.' }, { status: 500 });
  try {
    await sendProjectInquiryPushNotification();
  } catch {
    // The inquiry is already saved; notification delivery must never block the submission.
    console.warn('Inquiry saved, but desktop notification delivery failed.');
  }
  return NextResponse.json({ success: true });
}
