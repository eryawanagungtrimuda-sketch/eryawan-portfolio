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

function trimTo(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function normalizeJsonOutput(value: string) {
  let normalized = value.trim();
  if (normalized.startsWith('```json')) normalized = normalized.slice(7).trim();
  if (normalized.startsWith('```')) normalized = normalized.slice(3).trim();
  if (normalized.endsWith('```')) normalized = normalized.slice(0, -3).trim();
  const firstBrace = normalized.indexOf('{');
  const lastBrace = normalized.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) normalized = normalized.slice(firstBrace, lastBrace + 1);
  return normalized;
}

const stylePrompt = 'Tulis dalam bahasa Indonesia yang matang, tenang, profesional, edukatif, tidak bombastis, dan relevan untuk arsitek/interior designer senior.';
const sectionPrompt = 'Gunakan markdown sederhana dengan urutan heading: Pembuka, Apa yang Terbaca dari Ruang Ini, Keputusan Desain yang Menarik, Pelajaran yang Bisa Diambil, Catatan Perbaikan / Pengembangan, Kesimpulan.';

export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'OPENAI_API_KEY belum tersedia.' }, { status: 500 });

  let body: Body;
  try { body = (await req.json()) as Body; } catch { return NextResponse.json({ error: 'Request body tidak valid.' }, { status: 400 }); }

  const sourceType = body.source_type;
  if (!sourceType || !['project', 'image_review', 'manual'].includes(sourceType)) {
    return NextResponse.json({ error: 'source_type wajib: project | image_review | manual.' }, { status: 400 });
  }

  const context = trimTo(body.context, 1200);
  const title = trimTo(body.title, 120);
  const category = trimTo(body.category, 120);
  const excerpt = trimTo(body.excerpt, 400);

  let payloadForPrompt: Record<string, unknown> = {};

  if (sourceType === 'project') {
    const projectId = body.projectId || body.source_project_id;
    if (!projectId) return NextResponse.json({ error: 'projectId/source_project_id wajib untuk source_type project.' }, { status: 400 });

    const supabase = createSupabaseServerClient();
    const { data: project, error } = await supabase
      .from('projects')
      .select('title,category,design_category,design_style,area_type,area_tags,problem,solution,impact,konteks,konflik,keputusan_desain,pendekatan,dampak,insight_kunci,project_size,area_scope')
      .eq('id', projectId)
      .single();

    if (error || !project) return NextResponse.json({ error: 'Project tidak ditemukan.' }, { status: 404 });

    payloadForPrompt = {
      title: trimTo(project.title, 120),
      category: trimTo(project.category, 120),
      design_category: trimTo(project.design_category, 120),
      design_style: trimTo(project.design_style, 120),
      area_type: trimTo(project.area_type, 120),
      area_tags: Array.isArray(project.area_tags) ? project.area_tags.map((tag: string) => trimTo(tag, 120)).slice(0, 10) : [],
      problem: trimTo(project.problem, 500),
      solution: trimTo(project.solution, 500),
      impact: trimTo(project.impact, 500),
      konteks: trimTo(project.konteks, 600),
      konflik: trimTo(project.konflik, 600),
      keputusan_desain: trimTo(project.keputusan_desain, 600),
      pendekatan: trimTo(project.pendekatan, 600),
      dampak: trimTo(project.dampak, 600),
      insight_kunci: trimTo(project.insight_kunci, 600),
      project_size: trimTo(project.project_size, 120),
      area_scope: trimTo(project.area_scope, 120),
    };
  }

  if (sourceType === 'manual') {
    payloadForPrompt = { title, category, excerpt, content: trimTo(body.context, 1500) };
  }

  if (sourceType === 'image_review') {
    const imageUrls = Array.isArray(body.imageUrls) ? body.imageUrls.filter((url) => typeof url === 'string' && url.startsWith('http')).slice(0, 3) : [];
    if (imageUrls.length === 0 && !context) {
      return NextResponse.json({ error: 'imageUrls atau context wajib diisi untuk image_review.' }, { status: 400 });
    }
    payloadForPrompt = { title, context, imageUrls, image_detail: 'low' };
  }

  const prompt = `Tugas: bantu susun atau perbaiki wawasan desain. ${stylePrompt} ${sectionPrompt} Output WAJIB JSON valid dengan schema: {"title":"","category":"","excerpt":"","content":""}. Jangan tambahkan teks di luar JSON. Data sumber (${sourceType}): ${JSON.stringify(payloadForPrompt)}`;

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini', input: prompt, temperature: 0.2, max_output_tokens: 1100 }),
    });

    if (!response.ok) return NextResponse.json({ error: 'OpenAI gagal memproses draft insight.' }, { status: 502 });

    const result = await response.json();
    const text = result.output_text || result.output?.[0]?.content?.[0]?.text || '';

    try {
      return NextResponse.json(JSON.parse(normalizeJsonOutput(text)));
    } catch {
      return NextResponse.json({ error: 'Output AI tidak valid JSON.' }, { status: 422 });
    }
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan saat menghubungi OpenAI.' }, { status: 500 });
  }
}
