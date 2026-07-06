import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isValidEmail, sanitizeCvField } from '@/lib/cv-access';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function POST(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey) return NextResponse.json({ error: 'Konfigurasi server belum siap.' }, { status: 500 });
  let payload: Record<string, unknown>;
  try { payload = await request.json(); } catch { return NextResponse.json({ error: 'Payload tidak valid.' }, { status: 400 }); }

  if (sanitizeCvField(payload.website_url_hidden, 200)) return NextResponse.json({ success: true });

  const full_name = sanitizeCvField(payload.full_name, 160);
  const email = sanitizeCvField(payload.email, 180).toLowerCase();
  const company = sanitizeCvField(payload.company, 180);
  const role = sanitizeCvField(payload.role, 180);
  const purpose = sanitizeCvField(payload.purpose, 1600);
  const linkedin_url = sanitizeCvField(payload.linkedin_url, 300);
  const whatsapp = sanitizeCvField(payload.whatsapp, 80);

  if (!full_name || !email || !purpose || !isValidEmail(email)) return NextResponse.json({ error: 'Nama, email valid, dan tujuan wajib diisi.' }, { status: 400 });

  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const { error } = await supabase.from('cv_access_requests').insert({ full_name, email, company: company || null, role: role || null, purpose, linkedin_url: linkedin_url || null, whatsapp: whatsapp || null });
  if (error) return NextResponse.json({ error: 'Permintaan belum dapat disimpan. Coba lagi nanti.' }, { status: 500 });
  return NextResponse.json({ success: true });
}
