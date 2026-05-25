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
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseAnonKey) return NextResponse.json({ error: 'Supabase env not configured' }, { status: 500 });

    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData.user?.email || !isAllowedAdminEmail(userData.user.email)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

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
    if (!aiKey) return NextResponse.json({ data: fallbackData, fallbackUsed: true });

    const prompt = `Anda copywriter konten arsitektur/interior premium. Keluarkan JSON object valid tanpa markdown dan hanya field diminta. Bahasa Indonesia natural, ringkas, kuat hook, tanpa clickbait, tanpa klaim pasti viral (gunakan 'berpotensi menarik perhatian'). Untuk canvaCarouselSlides wajib tepat 7 slide dengan urutan: Hook, Context, Problem, Design decision, Detail/material/zoning, Result/user benefit, CTA to website; tiap slide wajib title/body/visual direction.`;

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

    if (!aiResponse.ok) return NextResponse.json({ data: fallbackData, fallbackUsed: true });
    const parsed = (await aiResponse.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const content = parsed.choices?.[0]?.message?.content || '{}';
    let json: Partial<Record<RegenerableField, string>> = {};
    try {
      json = JSON.parse(content) as Partial<Record<RegenerableField, string>>;
    } catch {
      return NextResponse.json({ data: fallbackData, fallbackUsed: true });
    }

    const safeResult: Partial<Record<RegenerableField, string>> = {};
    for (const field of uniqueFields as RegenerableField[]) {
      const value = json[field];
      safeResult[field] = typeof value === 'string' && value.trim() ? value.trim() : fallbackData[field] || '';
    }

    return NextResponse.json({ data: safeResult, fallbackUsed: false });
  } catch {
    return NextResponse.json({ data: {}, fallbackUsed: true });
  }
}
