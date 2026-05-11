import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAllowedAdminEmail } from '@/lib/admin-auth';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const MAX_FIELD_LENGTH = 3000;
const selectColumns = 'id,nama,perusahaan,email,whatsapp,jenis_kebutuhan,lokasi_project,estimasi_luas,tahap_project,timeline,budget_range,kebutuhan_utama,status_file,message_preview,status,source,created_at,updated_at';
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
  const nama = sanitize(payload.nama ?? payload.name, 160), perusahaan = sanitize(payload.perusahaan ?? payload.company, 160), email = sanitize(payload.email, 160), whatsapp = sanitize(payload.whatsapp, 80), jenisKebutuhan = sanitize(payload.jenisKebutuhan ?? payload.jenis_kebutuhan, 160), lokasiProject = sanitize(payload.lokasiProject ?? payload.projectLocation, 160), estimasiLuas = sanitize(payload.estimasiLuas, 120), tahapProject = sanitize(payload.tahapProject, 160), timeline = sanitize(payload.timeline, 120), budgetRange = sanitize(payload.budgetRange ?? payload.rangeBudget, 120), kebutuhanUtama = sanitize(payload.kebutuhanUtama ?? payload.mainNeeds, 3000), statusFile = sanitize(payload.statusFile, 160), messagePreview = sanitize(payload.messagePreview, 6000);
  if (!nama || !jenisKebutuhan || !kebutuhanUtama || (!email && !whatsapp) || !messagePreview) return NextResponse.json({ error: 'Data brief belum lengkap.' }, { status: 400 });
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase.from('project_inquiries').insert({ nama, perusahaan: perusahaan || null, email: email || null, whatsapp: whatsapp || null, jenis_kebutuhan: jenisKebutuhan, lokasi_project: lokasiProject || null, estimasi_luas: estimasiLuas || null, tahap_project: tahapProject || null, timeline: timeline || null, budget_range: budgetRange || null, kebutuhan_utama: kebutuhanUtama, status_file: statusFile || null, message_preview: messagePreview });
  if (error) return NextResponse.json({ error: 'Gagal menyimpan brief untuk saat ini.' }, { status: 500 });
  return NextResponse.json({ success: true });
}
