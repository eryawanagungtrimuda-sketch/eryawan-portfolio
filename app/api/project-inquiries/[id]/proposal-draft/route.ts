import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAllowedAdminEmail } from '@/lib/admin-auth';

type InquiryRow = {
  id: string;
  nama: string;
  perusahaan: string | null;
  email: string | null;
  whatsapp: string | null;
  jenis_kebutuhan: string;
  lokasi_project: string | null;
  estimasi_luas: string | null;
  tahap_project: string | null;
  timeline: string | null;
  budget_range: string | null;
  kebutuhan_utama: string;
  status_file: string | null;
  status: string;
  source: string;
};

const selectColumns = 'id,nama,perusahaan,email,whatsapp,jenis_kebutuhan,lokasi_project,estimasi_luas,tahap_project,timeline,budget_range,kebutuhan_utama,status_file,status,source';

function safeValue(value: string | null | undefined) {
  const v = typeof value === 'string' ? value.trim() : '';
  return v || 'Belum diisi';
}

function normalizeText(value: string) {
  return value.replace(/\r\n/g, '\n').trim();
}

async function getAuthedSupabase(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return { error: NextResponse.json({ error: 'Konfigurasi server belum siap.' }, { status: 500 }) };
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return { error: NextResponse.json({ error: 'Unauthorized.' }, { status: 401 }) };
  const supabase = createClient(url, key, { global: { headers: { Authorization: authHeader } } });
  const { data } = await supabase.auth.getUser();
  if (!data.user) return { error: NextResponse.json({ error: 'Unauthorized.' }, { status: 401 }) };
  if (!isAllowedAdminEmail(data.user.email)) return { error: NextResponse.json({ error: 'Forbidden.' }, { status: 403 }) };
  return { supabase };
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'OPENAI_API_KEY belum tersedia. Silakan hubungi admin sistem.' }, { status: 500 });

  const auth = await getAuthedSupabase(request); if ('error' in auth) return auth.error;
  const { id } = await params;
  if (!id) return NextResponse.json({ error: 'ID inquiry tidak valid.' }, { status: 400 });

  const { data, error } = await auth.supabase.from('project_inquiries').select(selectColumns).eq('id', id).single<InquiryRow>();
  if (error || !data) return NextResponse.json({ error: 'Inquiry tidak ditemukan.' }, { status: 404 });

  const prompt = `Anda adalah Eryawan Agung, desainer interior profesional.
Tugas: susun draft proposal awal dalam Bahasa Indonesia berdasarkan data inquiry.
Nada: profesional, hangat, premium, ringkas, business-ready.

Aturan:
- Jangan menganggap project sudah disetujui.
- Jangan memberikan harga final jika budget belum jelas.
- Jangan menjanjikan timeline pasti jika data belum lengkap.
- Tegaskan bahwa scope, timeline, dan budget final perlu konfirmasi lanjutan.
- Jangan membuat testimoni/award/klaim klien palsu.
- Jangan mengarang layanan berlebihan.
- Untuk data kurang, gunakan frasa "perlu konfirmasi".

Struktur wajib:
1. Judul
2. Salam Pembuka
3. Ringkasan Kebutuhan
4. Pemahaman Awal
5. Rekomendasi Langkah Awal
6. Ruang Lingkup Awal yang Mungkin
7. Data Tambahan yang Perlu Dikonfirmasi
8. Catatan Timeline dan Budget
9. Penutup
10. Pesan Follow-up WhatsApp

Data inquiry:
- Nama: ${safeValue(data.nama)}
- Perusahaan / Brand / Instansi: ${safeValue(data.perusahaan)}
- Email: ${safeValue(data.email)}
- WhatsApp: ${safeValue(data.whatsapp)}
- Jenis kebutuhan: ${safeValue(data.jenis_kebutuhan)}
- Lokasi project: ${safeValue(data.lokasi_project)}
- Estimasi luas: ${safeValue(data.estimasi_luas)}
- Tahap project: ${safeValue(data.tahap_project)}
- Timeline: ${safeValue(data.timeline)}
- Range budget: ${safeValue(data.budget_range)}
- Status file: ${safeValue(data.status_file)}
- Kebutuhan utama: ${safeValue(data.kebutuhan_utama)}
- Status inquiry: ${safeValue(data.status)}
- Sumber inquiry: ${safeValue(data.source)}

Output wajib JSON valid tanpa teks tambahan:
{"draft":"...","followUpMessage":"..."}`;

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        input: [{ role: 'user', content: [{ type: 'input_text', text: prompt }] }],
        temperature: 0.3,
        max_output_tokens: 1200,
      }),
    });

    if (!response.ok) return NextResponse.json({ error: 'Draft proposal belum berhasil dibuat. Silakan coba lagi.' }, { status: 502 });

    const result = await response.json();
    const outputText = result.output_text || result.output?.[0]?.content?.[0]?.text || '';
    const raw = normalizeText(String(outputText)).replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```$/i, '').trim();

    let parsed: { draft?: string; followUpMessage?: string } | null = null;
    try { parsed = JSON.parse(raw); } catch { parsed = null; }
    if (!parsed?.draft?.trim()) return NextResponse.json({ error: 'Draft proposal belum berhasil dibuat. Silakan coba lagi.' }, { status: 502 });

    return NextResponse.json({ draft: normalizeText(parsed.draft), followUpMessage: normalizeText(parsed.followUpMessage || '') });
  } catch {
    return NextResponse.json({ error: 'Draft proposal belum berhasil dibuat. Silakan coba lagi.' }, { status: 500 });
  }
}
