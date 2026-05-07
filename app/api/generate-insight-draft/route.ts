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

export async function POST(req: Request) {
  // TODO(security-phase): add auth guard + rate limit before production release.
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'OPENAI_API_KEY belum tersedia.' }, { status: 500 });

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: 'Request body tidak valid.' }, { status: 400 });
  }

  const sourceType = body.source_type;
  if (!sourceType || !['project', 'image_review', 'manual'].includes(sourceType)) {
    return NextResponse.json({ error: 'source_type wajib: project | image_review | manual.' }, { status: 400 });
  }

  const context = trimTo(body.context, 1200);
  const title = trimTo(body.title, 140);
  let prompt = '';

  if (sourceType === 'project') {
    const projectId = body.projectId || body.source_project_id;
    if (!projectId) return NextResponse.json({ error: 'projectId/source_project_id wajib untuk source_type project.' }, { status: 400 });
    const supabase = createSupabaseServerClient();
    const { data: project, error } = await supabase.from('projects').select('*').eq('id', projectId).single();
    if (error || !project) return NextResponse.json({ error: 'Project tidak ditemukan.' }, { status: 404 });
    prompt = `Buat draft wawasan desain edukatif dalam JSON valid: {"title":"","excerpt":"","content":"","category":""}. Gunakan data project: ${JSON.stringify(project)}.`;
  } else {
    const imageUrls = Array.isArray(body.imageUrls) ? body.imageUrls.filter((url) => typeof url === 'string' && url.startsWith('http')).slice(0, 5) : [];
    if (sourceType === 'image_review' && imageUrls.length === 0 && !context) {
      return NextResponse.json({ error: 'imageUrls atau context wajib diisi untuk image_review.' }, { status: 400 });
    }
    prompt = `Buat draft wawasan ${sourceType} dalam JSON valid: {"title":"","excerpt":"","content":"","category":""}. Title:${title || '-'}; Context:${context || '-'}; imageUrls:${JSON.stringify(imageUrls)}.`;
  }

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'gpt-4o-mini', input: prompt, temperature: 0.2, max_output_tokens: 900 }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `OpenAI gagal memproses draft insight: ${errorText}` }, { status: 502 });
    }

    const result = await response.json();
    const text = result.output_text || result.output?.[0]?.content?.[0]?.text || '';

    try {
      return NextResponse.json(JSON.parse(normalizeJsonOutput(text)));
    } catch {
      return NextResponse.json({ error: 'Output AI tidak valid JSON.', raw: text }, { status: 422 });
    }
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan saat menghubungi OpenAI.' }, { status: 500 });
  }
}
