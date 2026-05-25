import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAllowedAdminEmail } from '@/lib/admin-auth';

type ContentGoal = 'profesional' | 'edukatif' | 'viral-ready' | 'soft-selling';
type RegenerableField =
  | 'canvaReelsTimeline'
  | 'canvaCarouselSlides'
  | 'canvaOverlayText'
  | 'igCaption'
  | 'tiktokCaption'
  | 'youtubeDescription'
  | 'linkedInCaption'
  | 'whatsappMessage';

const allowedFields = new Set<RegenerableField>([
  'canvaReelsTimeline',
  'canvaCarouselSlides',
  'canvaOverlayText',
  'igCaption',
  'tiktokCaption',
  'youtubeDescription',
  'linkedInCaption',
  'whatsappMessage',
]);
const LOG_PREFIX = '[social-composer/regenerate]';

function normalizeJsonOutput(value: string) {
  let normalized = value.trim();
  if (normalized.startsWith('```json')) normalized = normalized.slice(7).trim();
  if (normalized.startsWith('```')) normalized = normalized.slice(3).trim();
  if (normalized.endsWith('```')) normalized = normalized.slice(0, -3).trim();
  const firstBrace = normalized.indexOf('{');
  const lastBrace = normalized.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    normalized = normalized.slice(firstBrace, lastBrace + 1);
  }
  return normalized;
}

function fallbackText(field: RegenerableField, source: Record<string, string | null>, goal: ContentGoal) {
  const title = source.title || 'Proyek desain';
  const summary = source.summary || source.problem || 'Konten ini merangkum pendekatan desain yang fungsional dan relevan.';
  const solution = source.solution || 'solusi yang menyeimbangkan fungsi, kenyamanan, dan karakter visual';
  const impact = source.impact || 'hasil ruang yang lebih nyaman dipakai dan terukur manfaatnya';
  const styleHint = goal === 'profesional' ? 'profesional' : goal === 'edukatif' ? 'edukatif' : goal === 'soft-selling' ? 'soft-selling' : 'hook-driven';

  if (field === 'canvaCarouselSlides') {
    return `Slide 1: Hook\nJudul: ${title}\nTeks: Strategi desain yang ${styleHint} dan berpotensi menarik perhatian.\nVisual: Hero shot dengan framing bersih.\n\nSlide 2: Context\nJudul: Konteks Ruang\nTeks: ${summary}\nVisual: Potongan ruang utama + aktivitas pengguna.\n\nSlide 3: Problem\nJudul: Tantangan\nTeks: ${source.problem || 'Kebutuhan fungsi dan alur ruang belum optimal.'}\nVisual: Detail area bermasalah.\n\nSlide 4: Design decision\nJudul: Keputusan Desain\nTeks: ${solution}\nVisual: Diagram zoning atau before/after sederhana.\n\nSlide 5: Detail / material / zoning\nJudul: Detail Implementasi\nTeks: Material, zoning, dan komposisi dipilih untuk efisiensi + karakter premium.\nVisual: Close-up material dan sambungan detail.\n\nSlide 6: Result / user benefit\nJudul: Dampak ke Pengguna\nTeks: ${impact}\nVisual: Pengguna berinteraksi di ruang akhir.\n\nSlide 7: CTA to website\nJudul: Lihat Studi Lengkap\nTeks: Detail studi tersedia di website untuk referensi penuh.\nVisual: Closing frame dengan URL website.`;
  }

  const map: Record<RegenerableField, string> = {
    canvaReelsTimeline: `0-3 detik: Hook tentang ${title}.\n3-6 detik: Konteks ${summary}.\n6-10 detik: Problem ${source.problem || 'fungsi ruang belum optimal'}.\n10-14 detik: Design decision ${solution}.\n14-15 detik: CTA ke website + benefit ${impact}.`,
    canvaCarouselSlides: '',
    canvaOverlayText: `"${title}"\n"Masalah: ${source.problem || 'alur ruang belum efektif'}"\n"Solusi: ${solution}"\n"Dampak: ${impact}"\n"Lihat studi lengkap di website"`,
    igCaption: `${title}\n\n${summary}\n\nKeputusan desain: ${solution}\nDampak: ${impact}\n\nLihat studi lengkap di website: ${source.url || ''}`,
    tiktokCaption: `${title} — insight desain yang ${styleHint} untuk audiens arsitektur & interior.\n${source.url || ''}`,
    youtubeDescription: `${title}\n\nKonteks: ${summary}\nSolusi: ${solution}\nDampak: ${impact}\n\nDetail lengkap: ${source.url || ''}`,
    linkedInCaption: `${title}\n\n${summary}\n\nKeputusan desain difokuskan pada fungsi ruang dan pengalaman pengguna.\nDampak: ${impact}\n\nLihat studi lengkap: ${source.url || ''}`,
    whatsappMessage: `Halo, saya mau share studi ${title}.\n\n${summary}\n\nSolusi: ${solution}\nBaca lengkap: ${source.url || ''}`,
  };

  return map[field];
}

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (!token) return NextResponse.json({ error: 'Unauthorized', debugReason: 'auth_failed' }, { status: 401 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return NextResponse.json({ error: 'Supabase env not configured' }, { status: 500 });

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user?.email || !isAllowedAdminEmail(userData.user.email)) {
      return NextResponse.json({ error: 'Forbidden', debugReason: 'auth_failed' }, { status: 403 });
    }

    const body = (await request.json()) as {
      contentType?: string;
      slug?: string;
      source?: Record<string, string | number | null>;
      blankFields?: string[];
      goal?: string;
      notes?: string | null;
    };

    if (body.contentType !== 'karya' && body.contentType !== 'wawasan') return NextResponse.json({ error: 'Invalid contentType' }, { status: 400 });
    if (!body.slug || typeof body.slug !== 'string') return NextResponse.json({ error: 'Invalid slug' }, { status: 400 });
    if (!Array.isArray(body.blankFields) || body.blankFields.length === 0) return NextResponse.json({ error: 'blankFields required' }, { status: 400 });

    const uniqueFields = Array.from(new Set(body.blankFields));
    for (const field of uniqueFields) {
      if (!allowedFields.has(field as RegenerableField)) return NextResponse.json({ error: `Unknown field: ${field}` }, { status: 400 });
    }

    const safeGoal: ContentGoal = body.goal === 'profesional' || body.goal === 'edukatif' || body.goal === 'soft-selling' || body.goal === 'viral-ready' ? body.goal : 'viral-ready';
    const source = {
      title: String(body.source?.title || ''),
      category: body.source?.category ? String(body.source.category) : null,
      designCategory: body.source?.designCategory ? String(body.source.designCategory) : null,
      style: body.source?.style ? String(body.source.style) : null,
      year: body.source?.year ? String(body.source.year) : null,
      areaSize: body.source?.areaSize ? String(body.source.areaSize) : null,
      summary: body.source?.summary ? String(body.source.summary) : null,
      problem: body.source?.problem ? String(body.source.problem) : null,
      solution: body.source?.solution ? String(body.source.solution) : null,
      impact: body.source?.impact ? String(body.source.impact) : null,
      keyInsight: body.source?.keyInsight ? String(body.source.keyInsight) : null,
      url: String(body.source?.url || ''),
    };

    const fallbackData: Partial<Record<RegenerableField, string>> = {};
    for (const field of uniqueFields as RegenerableField[]) fallbackData[field] = fallbackText(field, source, safeGoal);

    const aiKey = process.env.OPENAI_API_KEY;
    console.info(`${LOG_PREFIX} OPENAI_API_KEY detected=${Boolean(aiKey)}`);
    if (!aiKey) return NextResponse.json({ data: fallbackData, fallbackUsed: true, debugReason: 'missing_openai_key' });

    const prompt = `Anda copywriter konten arsitektur/interior premium.
Keluarkan JSON object valid tanpa markdown, tanpa teks lain, dan hanya field yang diminta.
Gunakan nama key persis sama dengan field yang diminta user.
Bahasa Indonesia natural, ringkas, kuat hook, tanpa clickbait, tanpa klaim pasti viral (gunakan "berpotensi menarik perhatian").
Untuk canvaCarouselSlides: wajib berupa SATU string ramah textarea (bukan array/object), tepat 7 slide berurutan:
Slide 1 Hook, Slide 2 Context, Slide 3 Problem, Slide 4 Design decision, Slide 5 Detail/material/zoning, Slide 6 Result/user benefit, Slide 7 CTA to website.
Setiap slide wajib berisi:
Judul: ...
Teks: ...
Visual: ...`;

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${aiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        temperature: 0.6,
        max_tokens: 900,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: JSON.stringify({ contentType: body.contentType, slug: body.slug, goal: safeGoal, blankFields: uniqueFields, source, notes: body.notes || null }) },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const requestId = aiResponse.headers.get('x-request-id') || aiResponse.headers.get('openai-request-id');
      const errorText = (await aiResponse.text()).slice(0, 400);
      console.error(`${LOG_PREFIX} openai_http_error status=${aiResponse.status} requestId=${requestId || 'n/a'} msg=${errorText}`);
      return NextResponse.json({ data: fallbackData, fallbackUsed: true, debugReason: 'openai_http_error' });
    }
    const parsed = (await aiResponse.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = parsed.choices?.[0]?.message?.content || '';
    if (!content.trim()) {
      console.error(`${LOG_PREFIX} openai_empty_response`);
      return NextResponse.json({ data: fallbackData, fallbackUsed: true, debugReason: 'openai_empty_response' });
    }
    let json: Partial<Record<RegenerableField, string>> = {};
    try {
      json = JSON.parse(normalizeJsonOutput(content)) as Partial<Record<RegenerableField, string>>;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'invalid_json';
      console.error(`${LOG_PREFIX} openai_invalid_json msg=${errMsg}`);
      return NextResponse.json({ data: fallbackData, fallbackUsed: true, debugReason: 'openai_invalid_json' });
    }

    const safeResult: Partial<Record<RegenerableField, string>> = {};
    const missingFields: RegenerableField[] = [];
    for (const field of uniqueFields as RegenerableField[]) {
      const value = json[field];
      if (typeof value === 'string' && value.trim()) {
        safeResult[field] = value.trim();
      } else {
        missingFields.push(field);
        safeResult[field] = fallbackData[field] || '';
      }
    }

    if (missingFields.length > 0) {
      console.warn(`${LOG_PREFIX} openai_missing_requested_fields fields=${missingFields.join(',')}`);
      return NextResponse.json({ data: safeResult, fallbackUsed: true, debugReason: 'openai_missing_requested_fields' });
    }

    return NextResponse.json({ data: safeResult, fallbackUsed: false });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'unknown_error';
    console.error(`${LOG_PREFIX} unexpected_error msg=${errMsg}`);
    return NextResponse.json({ data: {}, fallbackUsed: true, debugReason: 'unexpected_error' });
  }
}
