import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

type SourceType = 'project' | 'image_review' | 'manual';
type Body = {
  source_type?: SourceType;
  projectId?: string;
  source_project_id?: string;
  imageUrls?: string[];
  context?: string;
  title?: string;
  category?: string;
  excerpt?: string;
};

const stylePrompt = 'Tulis dalam bahasa Indonesia yang matang, tenang, profesional, edukatif, tidak bombastis, dan relevan untuk arsitek/interior designer senior.';
const sectionPrompt = 'Gunakan markdown sederhana dengan urutan heading: Pembuka, Apa yang Terbaca dari Ruang Ini, Keputusan Desain yang Menarik, Pelajaran yang Bisa Diambil, Catatan Perbaikan / Pengembangan, Kesimpulan.';

const trimTo = (value: unknown, maxLength: number) => (typeof value === 'string' ? value.trim().slice(0, maxLength) : '');
const normalizeJsonOutput = (value: string) => {
  let normalized = value.trim();
  if (normalized.startsWith('```json')) normalized = normalized.slice(7).trim();
  if (normalized.startsWith('```')) normalized = normalized.slice(3).trim();
  if (normalized.endsWith('```')) normalized = normalized.slice(0, -3).trim();
  const firstBrace = normalized.indexOf('{');
  const lastBrace = normalized.lastIndexOf('}');
  return firstBrace !== -1 && lastBrace > firstBrace ? normalized.slice(firstBrace, lastBrace + 1) : normalized;
};

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'OPENAI_API_KEY belum tersedia.' }, { status: 500 });

  let body: Body;
  try { body = (await req.json()) as Body; } catch { return NextResponse.json({ error: 'Request body tidak valid.' }, { status: 400 }); }

  const sourceType = body.source_type;
  if (!sourceType || !['project', 'image_review', 'manual'].includes(sourceType)) return NextResponse.json({ error: 'source_type wajib: project | image_review | manual.' }, { status: 400 });

  const context = trimTo(body.context, 1200);
  let payloadForPrompt: Record<string, unknown> = {};

  if (sourceType === 'project') {
    const projectId = body.projectId || body.source_project_id;
    if (!projectId) return NextResponse.json({ error: 'projectId/source_project_id wajib untuk source_type project.' }, { status: 400 });
    const { data: project, error } = await createSupabaseServerClient().from('projects').select('title,category,problem,solution,konteks,konflik,keputusan_desain,pendekatan,dampak,insight_kunci').eq('id', projectId).single();
    if (error || !project) return NextResponse.json({ error: 'Project tidak ditemukan.' }, { status: 404 });
    payloadForPrompt = project;
  }

  if (sourceType === 'manual') payloadForPrompt = { title: trimTo(body.title, 120), category: trimTo(body.category, 120), excerpt: trimTo(body.excerpt, 400), content: trimTo(body.context, 1500) };

  if (sourceType === 'image_review') {
    const imageUrls = Array.isArray(body.imageUrls) ? body.imageUrls.filter((url) => typeof url === 'string' && url.startsWith('http')).slice(0, 4) : [];
    if (imageUrls.length === 0 && !context) return NextResponse.json({ error: 'imageUrls atau context wajib diisi untuk image_review.' }, { status: 400 });
    payloadForPrompt = { title: trimTo(body.title, 120), category: trimTo(body.category, 120), context, imageUrls };
  }

  const prompt = `Tugas: bantu susun atau perbaiki wawasan desain, khususnya review karya portfolio. ${stylePrompt} ${sectionPrompt} Output WAJIB JSON valid dengan schema: {"title":"","category":"","excerpt":"","content":""}. Jangan tambahkan teks di luar JSON. Data sumber (${sourceType}): ${JSON.stringify(payloadForPrompt)}`;

  try {
    const imageInputs = sourceType === 'image_review' && Array.isArray((payloadForPrompt as { imageUrls?: string[] }).imageUrls)
      ? ((payloadForPrompt as { imageUrls?: string[] }).imageUrls || []).map((url) => ({ type: 'input_image', image_url: url, detail: 'low' as const }))
      : [];
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4.1-mini', input: [{ role: 'user', content: [{ type: 'input_text', text: prompt }, ...imageInputs] }], temperature: 0.2, max_output_tokens: 1100 }),
    });
    if (!response.ok) return NextResponse.json({ error: 'OpenAI gagal memproses draft insight.' }, { status: 502 });
    const result = await response.json();
    const text = result.output_text || result.output?.[0]?.content?.[0]?.text || '';
    return NextResponse.json(JSON.parse(normalizeJsonOutput(text)));
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan saat menghubungi OpenAI.' }, { status: 500 });
  }
}
