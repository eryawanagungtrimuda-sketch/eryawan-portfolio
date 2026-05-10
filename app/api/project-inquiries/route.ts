import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const MAX_FIELD_LENGTH = 3000;

function sanitize(input: unknown, max = MAX_FIELD_LENGTH) {
  if (typeof input !== 'string') return '';
  return input.trim().slice(0, max);
}

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.json({ error: 'Konfigurasi server belum siap.' }, { status: 500 });
  }

  let payload: Record<string, unknown>;
  try { payload = await request.json(); } catch { return NextResponse.json({ error: 'Payload tidak valid.' }, { status: 400 }); }

  const nama = sanitize(payload.nama, 160);
  const perusahaan = sanitize(payload.perusahaan, 160);
  const email = sanitize(payload.email, 160);
  const whatsapp = sanitize(payload.whatsapp, 80);
  const jenisKebutuhan = sanitize(payload.jenisKebutuhan, 160);
  const lokasiProject = sanitize(payload.lokasiProject, 160);
  const estimasiLuas = sanitize(payload.estimasiLuas, 120);
  const tahapProject = sanitize(payload.tahapProject, 160);
  const timeline = sanitize(payload.timeline, 120);
  const budgetRange = sanitize(payload.budgetRange, 120);
  const kebutuhanUtama = sanitize(payload.kebutuhanUtama, 3000);
  const statusFile = sanitize(payload.statusFile, 160);
  const messagePreview = sanitize(payload.messagePreview, 6000);

  if (!nama || !jenisKebutuhan || !kebutuhanUtama || (!email && !whatsapp) || !messagePreview) {
    return NextResponse.json({ error: 'Data brief belum lengkap.' }, { status: 400 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase.from('project_inquiries').insert({ nama, perusahaan: perusahaan || null, email: email || null, whatsapp: whatsapp || null, jenis_kebutuhan: jenisKebutuhan, lokasi_project: lokasiProject || null, estimasi_luas: estimasiLuas || null, tahap_project: tahapProject || null, timeline: timeline || null, budget_range: budgetRange || null, kebutuhan_utama: kebutuhanUtama, status_file: statusFile || null, message_preview: messagePreview });

  if (error) return NextResponse.json({ error: 'Gagal menyimpan brief untuk saat ini.' }, { status: 500 });
  return NextResponse.json({ success: true });
}
