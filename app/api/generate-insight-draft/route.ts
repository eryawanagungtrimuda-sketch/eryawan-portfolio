import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';

export async function POST(req: Request) {
  // TODO(security-phase): add auth guard/rate limit before production.
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: 'OPENAI_API_KEY belum tersedia.' }, { status: 500 });
  const body = await req.json();
  const sourceType = body.source_type;

  let prompt = '';
  if (sourceType === 'project') {
    const supabase = createSupabaseServerClient();
    const { data: project } = await supabase.from('projects').select('*').eq('id', body.projectId || body.source_project_id).single();
    prompt = `Buat draft wawasan desain edukatif dari project berikut. Keluarkan JSON: title,excerpt,content,category. Data: ${JSON.stringify(project)}`;
  } else {
    prompt = `Buat draft review foto/render edukatif. Keluarkan JSON: title,excerpt,content,category. imageUrls=${JSON.stringify(body.imageUrls || [])}, context=${body.context || ''}`;
  }

  const response = await fetch('https://api.openai.com/v1/responses', { method: 'POST', headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'gpt-4o-mini', input: prompt, temperature: 0.2 }) });
  const result = await response.json();
  const text = result.output_text || '{}';
  try { return NextResponse.json(JSON.parse(text)); } catch { return NextResponse.json({ content: text }); }
}
