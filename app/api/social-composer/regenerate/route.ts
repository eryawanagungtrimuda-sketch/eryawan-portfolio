import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAllowedAdminEmail } from '@/lib/admin-auth';

type ContentGoal = 'profesional' | 'edukatif' | 'viral-ready' | 'soft-selling';
type RegenerableField =
  | 'canvaReelsTimeline'
  | 'canvaCarouselSlides'
  | 'canvaOverlayText'
  | 'igCaption'
  | 'igHashtag'
  | 'tiktokHook'
  | 'tiktokScript'
  | 'tiktokCaption'
  | 'tiktokHashtag'
  | 'youtubeTitle'
  | 'youtubeDescription'
  | 'linkedInCaption'
  | 'linkedInBullets'
  | 'whatsappMessage';

const allowedFields = new Set<RegenerableField>([
  'canvaReelsTimeline',
  'canvaCarouselSlides',
  'canvaOverlayText',
  'igCaption',
  'igHashtag',
  'tiktokHook',
  'tiktokScript',
  'tiktokCaption',
  'tiktokHashtag',
  'youtubeTitle',
  'youtubeDescription',
  'linkedInCaption',
  'linkedInBullets',
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

async function repairInvalidJsonOutput(params: { aiKey: string; outputText: string; uniqueFields: string[] }) {
  const { aiKey, outputText, uniqueFields } = params;
  const repairPrompt = `Ubah output berikut menjadi JSON valid saja dengan key persis ini: ${uniqueFields.join(', ')}.\nAturan: tanpa markdown, tanpa komentar, tanpa key tambahan, semua value harus string.\n\nOutput awal:\n${outputText}`;

  const repairResponse = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { Authorization: `Bearer ${aiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      input: [
        {
          role: 'user',
          content: [{ type: 'input_text', text: repairPrompt }],
        },
      ],
      temperature: 0,
      max_output_tokens: 500,
    }),
  });

  if (!repairResponse.ok) return null;
  const repairResult = await repairResponse.json();
  const repairedText = repairResult.output_text || repairResult.output?.[0]?.content?.[0]?.text || '';
  if (!repairedText.trim()) return null;
  return JSON.parse(normalizeJsonOutput(repairedText)) as Partial<Record<RegenerableField, string>>;
}

function fallbackText(field: RegenerableField, source: Record<string, string | null>, goal: ContentGoal) {
  const title = source.title || 'Proyek desain';
  const summary = source.summary || source.problem || 'Konten ini merangkum pendekatan desain yang fungsional dan relevan.';
  const solution = source.solution || 'solusi yang menyeimbangkan fungsi, kenyamanan, dan karakter visual';
  const impact = source.impact || 'hasil ruang yang lebih nyaman dipakai dan terukur manfaatnya';
  const styleHint = goal === 'profesional' ? 'profesional' : goal === 'edukatif' ? 'edukatif' : goal === 'soft-selling' ? 'soft-selling' : 'hook-driven';

  if (field === 'canvaCarouselSlides') {
    return `Slide 1 — Hook
Area yang terlihat rapi belum tentu enak dipakai.

Di ${title}, fokus utamanya adalah membuat aktivitas harian tetap lancar tanpa terasa sesak.

Visual:
Gunakan hero shot yang memperlihatkan hubungan antar area utama.

Slide 2 — Konteks
Proyek ini berangkat dari kebutuhan keluarga yang aktif.

${summary}

Visual:
Tampilkan kondisi eksisting atau sudut yang menunjukkan pola aktivitas.

Slide 3 — Masalah
Tantangan utamanya ada di alur gerak dan titik kerja yang saling bertabrakan.

${source.problem || 'Beberapa zona belum saling mendukung saat dipakai bersamaan.'}

Visual:
Ambil detail area yang sering memicu hambatan penggunaan.

Slide 4 — Keputusan Desain
Solusi disusun agar pergerakan lebih jelas dan fungsi tidak saling mengganggu.

${solution}

Visual:
Gunakan diagram zoning sederhana atau perbandingan before-after.

Slide 5 — Detail Penting
Detail kecil dipilih untuk mempermudah perawatan sekaligus menjaga kualitas visual.

Material, pencahayaan, dan proporsi elemen diselaraskan agar nyaman dipakai tiap hari.

Visual:
Close-up sambungan material, permukaan kerja, dan titik lampu.

Slide 6 — Hasil
Setelah penataan ulang, area terasa lebih terarah dan efisien untuk rutinitas.

${impact}

Visual:
Tampilkan momen penggunaan nyata setelah implementasi.

Slide 7 — CTA
Kalau Anda sedang merencanakan pembaruan area serupa, studi lengkapnya bisa jadi referensi awal.

Lihat proses dan pertimbangannya di website.

Visual:
Closing frame dengan URL website dan foto akhir yang paling kuat.`;
  }

  const map: Record<RegenerableField, string> = {
    canvaReelsTimeline: `0–3 detik
Visual:
Wide shot area utama sebelum dijelaskan.
Narasi:
Rapi itu penting, tapi alurnya harus enak dipakai.
Overlay:
Rapi belum tentu efektif

3–7 detik
Visual:
Sorot titik yang sering bikin aktivitas terhambat.
Narasi:
Di ${title}, masalahnya muncul saat beberapa aktivitas terjadi bersamaan.
Overlay:
Masalah ada di sirkulasi

7–12 detik
Visual:
Tampilkan perubahan layout dan zoning.
Narasi:
Kami atur ulang zonanya supaya gerak, simpan, dan kerja lebih jelas.
Overlay:
Zoning dibuat lebih tegas

12–16 detik
Visual:
Close-up material dan pencahayaan kerja.
Narasi:
Detail material dan lampu dipilih untuk pemakaian harian yang praktis.
Overlay:
Detail kecil, dampak besar

16–20 detik
Visual:
Final reveal area setelah penataan.
Narasi:
Hasilnya lebih tertata, lebih ringan dipakai, dan lebih relevan untuk keluarga.
Overlay:
Lihat studi lengkap di website`,
    canvaCarouselSlides: '',
    canvaOverlayText: `Ruang rapi belum tentu nyaman
Masalahnya ada di sirkulasi
Zoning dibuat lebih jelas
Material mendukung aktivitas harian
Detail kecil menentukan pengalaman
Lihat studi lengkap di website`,
    igCaption: `Bukan semua area yang terlihat rapi itu otomatis nyaman dipakai.

Di ${title}, kami mulai dari membaca pola aktivitas harian: siapa bergerak ke mana, titik mana yang sering macet, dan bagian mana yang perlu prioritas.

${solution} Dampaknya, ${impact}.

Kalau Anda sedang merencanakan pembaruan area serupa, studi lengkapnya ada di website${source.url ? `: ${source.url}` : '.'}`,
    igHashtag: '#DesainInterior #InteriorDesign #StudiKasus #ArsitekturInterior #DesignStrategy',
    tiktokHook: 'Ruang rapi belum tentu enak dipakai.',
    tiktokScript: `Ruang ini terlihat sederhana, tapi tantangannya ada di alur pakai.
Dapur dan ruang makan harus tetap dekat, tanpa membuat sirkulasi terasa penuh.
Karena itu, zoning dibuat lebih jelas dan pencahayaan diperkuat.
Hasilnya, area belakang terasa lebih rapi, terang, dan mudah dipakai harian.
Studi lengkapnya ada di website.`,
    tiktokCaption: `Area rapi belum tentu enak dipakai.

Di ${title}, problem utamanya ada di alur dan pembagian zona. Setelah diatur ulang, aktivitas jadi lebih lancar dan hasilnya terasa lebih masuk akal untuk dipakai harian.

Lihat studi lengkapnya${source.url ? `: ${source.url}` : '.'}`,
    tiktokHashtag: '#DesainInterior #InteriorDesign #TikTokDesign #RuangMakan #Dapur',
    youtubeTitle: `Penataan ${title} agar Alur dan Fungsi Lebih Jelas`,
    youtubeDescription: `Di video singkat ini, Anda akan lihat bagaimana ${title} ditata ulang dari sisi alur, zoning, material, dan pencahayaan kerja.

Kami tunjukkan masalah awal, keputusan yang diambil, dan hasil akhirnya untuk pemakaian harian.

Lihat studi lengkap di website${source.url ? `: ${source.url}` : '.'}`,
    linkedInCaption: `Banyak proyek interior terlihat baik secara visual, tetapi belum tentu efektif saat dipakai sehari-hari.

Pada ${title}, kami memulai dari evaluasi sirkulasi, pola aktivitas, dan hubungan antar zona agar keputusan perancangan tidak berhenti di tampilan.

${solution} Hasilnya, ${impact}.

Saya tertarik mendengar pendekatan rekan-rekan saat menyeimbangkan performa fungsi dan kualitas spasial dalam proyek serupa${source.url ? `.\n\nStudi lengkap: ${source.url}` : '.'}`,
    linkedInBullets: `• Pemikiran spasial dimulai dari kebutuhan pengguna utama.\n• Zoning disusun agar fungsi inti tidak saling bertabrakan.\n• Sirkulasi dipertegas supaya alur harian lebih lancar.\n• Material dipilih untuk ketahanan pakai sekaligus karakter visual.\n• Pencahayaan diatur agar aktivitas lebih nyaman dan berdampak nyata.`,
    whatsappMessage: `Saya baru menulis studi kasus tentang ${title}.

Menariknya, proyek ini membahas bagaimana area terbatas bisa dibuat lebih rapi, terang, dan enak dipakai untuk aktivitas sehari-hari.

Kalau sedang membahas dapur, ruang makan, atau sirkulasi rumah, ini mungkin bisa jadi referensi.

Baca lengkapnya di sini:
${source.url || ''}`.trim(),
  };

  return map[field];
}

function postProcessField(field: RegenerableField, value: string) {
  let cleaned = value.trim().replace(/\n{3,}/g, '\n\n');
  if (field === 'youtubeTitle') {
    cleaned = cleaned
      .replace(/[#@][\w-]+/g, '')
      .replace(/["'`{}\[\]]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (cleaned.length > 70) cleaned = cleaned.slice(0, 70).trim();
  }
  if (field === 'youtubeDescription') {
    cleaned = cleaned
      .replace(/\\n/g, '\n')
      .replace(/^\s*```(?:json)?/i, '')
      .replace(/```\s*$/i, '')
      .replace(/\b(canvaCarouselSlides|Visual|Narasi|Overlay|Caption|Text)\s*:\s*/gi, '')
      .replace(/[{}[\]"]/g, '')
      .replace(/^\s*[\w-]+\s*:\s*\[?.*$/gim, '')
      .replace(/^\s*[,]+\s*$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    const paragraphs = cleaned
      .split(/\n{2,}/)
      .map((part) => part.trim())
      .filter((part) => part && !/[{}[\]]|canvaCarouselSlides/i.test(part))
      .slice(0, 3);
    cleaned = paragraphs.join('\n\n');
  }
  if (field === 'canvaCarouselSlides') {
    cleaned = cleaned.replace(/\s*(Slide\s*[1-7]\s*[—-])/g, '\n\n$1').trim();
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  }
  if (field === 'canvaOverlayText') {
    cleaned = cleaned
      .replace(/\\n/g, '\n')
      .replace(/^\s*["'`[{(]+/, '')
      .replace(/["'`\]})]+\s*$/, '')
      .replace(/\b(canvaOverlayText|overlay|text|caption|visual|narasi|copy)\s*:\s*/gi, '')
      .replace(/[{},]/g, '\n');

    cleaned = cleaned
      .split('\n')
      .map((line) =>
        line
          .trim()
          .replace(/^["'`-]+|["'`-]+$/g, '')
          .replace(/\b(canvaOverlayText|overlay|text|caption|visual|narasi|copy)\s*:\s*/gi, '')
          .replace(/^(?:\d+[\])\-.:]?\s*)/, '')
          .trim()
      )
      .map((line) => line.replace(/\s+/g, ' '))
      .filter((line) => line && !/^[\[\]{}:,]+$/.test(line))
      .map((line) => {
        const words = line.split(' ').filter(Boolean);
        return words.slice(0, 8).join(' ');
      })
      .filter(Boolean)
      .slice(0, 6)
      .join('\n');
  }
  if (field === 'tiktokHook') {
    cleaned = cleaned
      .replace(/#\S+/g, '')
      .replace(/["'`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    cleaned = cleaned.split(' ').filter(Boolean).slice(0, 12).join(' ');
  }
  if (field === 'tiktokScript') {
    cleaned = cleaned
      .replace(/\\n/g, '\n')
      .replace(/^\s*```(?:json)?/i, '')
      .replace(/```\s*$/i, '')
      .replace(/^\s*(Visual|Overlay|Caption|Text|Narasi)\s*:\s*/gim, '')
      .trim();

    cleaned = cleaned
      .split('\n')
      .map((line) => line.trim().replace(/\s+/g, ' '))
      .filter(Boolean)
      .slice(0, 5)
      .join('\n');
  }
  if (field === 'tiktokCaption') {
    cleaned = cleaned
      .replace(/\\n/g, '\n')
      .replace(/^\s*```(?:json)?/i, '')
      .replace(/```\s*$/i, '')
      .replace(/\b(?:canvaCarouselSlides|canvaReelsTimeline|canvaOverlayText|Visual|Narasi|Overlay|Caption|Text)\s*:\s*/gi, '')
      .replace(/^[\t ]*\"[^\\"\n]+\"\s*:\s*\"[^\\"\n]*\"\s*,?\s*$/gm, '')
      .replace(/[{}[\]"]/g, '')
      .replace(/^\s*[,]+\s*$/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const paragraphs = cleaned
      .split(/\n{2,}/)
      .map((part) => part.trim())
      .filter((part) => part && !/(canvaCarouselSlides|canvaReelsTimeline|canvaOverlayText|Visual:|Narasi:|Overlay:|Caption:|Text:|^[{[])/i.test(part))
      .slice(0, 3);

    cleaned = paragraphs.join('\n\n').replace(/\n{3,}/g, '\n\n').trim();
  }
  if (field === 'tiktokHashtag') {
    const tokens = cleaned
      .replace(/,/g, ' ')
      .replace(/\\n/g, ' ')
      .split(/\s+/)
      .map((token) => token.trim())
      .filter(Boolean)
      .map((token) => token.replace(/^[^#A-Za-z0-9]+|[^#A-Za-z0-9_]+$/g, ''))
      .filter((token) => token.startsWith('#'))
      .map((token) => `#${token.replace(/^#+/, '').replace(/[^A-Za-z0-9_]/g, '')}`)
      .filter((token) => token.length > 1)
      .slice(0, 6);

    cleaned = tokens.join(' ').trim();
  }
  if (field === 'whatsappMessage') {
    cleaned = cleaned
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const paragraphs = cleaned
      .split(/\n{2,}/)
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 4);

    cleaned = paragraphs.join('\n\n');
  }
  if (field === 'linkedInBullets') {
    cleaned = cleaned
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^(?:[-*•]\s*|\d+[\).:-]?\s*)/, '').trim())
      .filter(Boolean)
      .map((line) => `• ${line.replace(/\s+/g, ' ')}`)
      .slice(0, 5)
      .join('\n');
  }
  return cleaned;
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

    const prompt = `Anda content strategist arsitektur/interior berbahasa Indonesia.
Tulis dengan nada premium namun sederhana, natural, editorial, mudah ditempel ke textarea Canva/IG/TikTok/YouTube/LinkedIn/WhatsApp.

ATURAN OUTPUT WAJIB:
1) Keluarkan JSON object valid saja. Tanpa markdown, tanpa komentar, tanpa teks di luar JSON.
2) Key JSON harus persis sama dengan field yang diminta.
3) Jangan keluarkan key tambahan.
4) Value setiap key harus string polos (bukan object/array).
5) Jangan pakai gaya robotik.
6) Hindari kata berulang berlebihan: desain, ruang, nyaman, modern, estetika.

ATURAN GLOBAL KONTEN:
- Bahasa Indonesia natural.
- Paragraf pendek, mudah dibaca, tidak padat.
- Fokus pada masalah pengguna, keputusan perancangan, zoning, sirkulasi, material, pencahayaan, dan pemakaian harian.
- Hindari klaim berlebihan seperti "pasti viral".

ATURAN PER FIELD:
- canvaCarouselSlides: tepat 7 slide, format urut:
Slide 1 — Hook
Slide 2 — Konteks
Slide 3 — Masalah
Slide 4 — Keputusan Desain
Slide 5 — Detail Penting
Slide 6 — Hasil
Slide 7 — CTA
Setiap slide berisi headline singkat, 1–2 kalimat isi, lalu "Visual:" sebagai catatan praktis. Jangan gunakan label "Judul:" atau "Teks:". Pisahkan antar slide dengan satu baris kosong.

- canvaReelsTimeline: timeline praktis total sekitar 15–20 detik. Tiap segmen gunakan format:
[rentang detik]
Visual:
Narasi:
Overlay:
Narasi pendek agar tidak kepotong.

- canvaOverlayText: output hanya baris overlay pendek siap Canva/Reels.
  * HANYA baris overlay, tanpa paragraf.
  * Satu overlay per baris, maksimum 6 baris.
  * Tiap baris maksimum 6–8 kata.
  * Jangan tambahkan label apa pun: Overlay:, Text:, Caption:, Visual:, Narasi:, Copy:.
  * Jangan tulis JSON-like fragment di dalam value.
  * Jangan tulis karakter escaped "\\n" secara literal.
  * Jangan beri tanda kutip di setiap baris.
  * Gaya manusia, ringkas, tajam, mudah dibaca cepat.

- igCaption: hook tenang, 2–4 paragraf pendek, ada insight arsitektur/interior, soft CTA, gaya manusiawi.
- tiktokHook:
  * Satu kalimat hook singkat untuk 3 detik pertama.
  * Maksimum 12 kata.
  * Natural bahasa Indonesia, tidak clickbait.
- tiktokCaption:
  * Output hanya caption TikTok.
  * Bahasa Indonesia natural, singkat, conversational, tidak robotik.
  * 1–3 paragraf pendek.
  * Sebut konteks proyek secara singkat.
  * Sertakan link hanya jika source.url tersedia.
  * Dilarang fragment JSON.
  * Dilarang menyebut canvaCarouselSlides, canvaReelsTimeline, canvaOverlayText.
  * Dilarang label seperti Visual:, Narasi:, Overlay:, Caption:, Text:.
  * Dilarang hashtag berlebihan di dalam caption.
- tiktokHashtag:
  * Output hashtag saja.
  * 4–6 hashtag.
  * Satu baris.
  * Tanpa penjelasan.
  * Tanpa numbering.
- tiktokScript:
  * Script voice-over untuk TikTok/Reels.
  * Tulis 4–5 baris pendek, conversational, natural.
  * Wajib menyebut masalah, keputusan desain, dan hasil.
  * Dilarang hashtag.
  * Dilarang fragment JSON.
  * Dilarang label seperti Visual:, Overlay:, Narasi:, Caption:, Text:.
- Jika field yang diminta mencakup tiktokHook dan tiktokScript sekaligus, output WAJIB strict JSON saja dengan bentuk:
  {
    "tiktokHook": "...",
    "tiktokScript": "..."
  }
- youtubeTitle:
  * Judul SEO YouTube Shorts yang natural dan tidak clickbait.
  * Maksimum 70 karakter.
  * Wajib relevan dengan konteks proyek.
  * Dilarang hashtag.
- youtubeDescription:
  * Output hanya deskripsi YouTube Shorts.
  * Dilarang fragment JSON, dilarang label seperti Visual/Narasi/Overlay/Text/Caption.
  * Dilarang menyebut canvaCarouselSlides.
  * Dilarang karakter escaped "\\n" literal.
  * Tulis 2–3 paragraf pendek, jelaskan apa yang akan penonton lihat.
  * Wajib sebut konteks proyek dan akhiri CTA ke website.
- linkedInCaption: profesional dan reflektif, 2–4 paragraf pendek, bahas keputusan perancangan dan pemikiran spasial, akhiri pertanyaan/CTA diskusi.
- linkedInBullets:
  * Output hanya bullet points, tanpa paragraf.
  * Tulis 3–5 bullet points.
  * Setiap bullet singkat dan profesional.
  * Gunakan prefix bullet "•" di setiap baris.
  * Fokus pada pemikiran spasial, zoning, sirkulasi, material, pencahayaan, dan dampak ke pengguna.
  * Dilarang hashtag.
- whatsappMessage:
  * Tulis seperti orang nyata yang sedang berbagi referensi bermanfaat.
  * Harus terasa personal, natural, hangat, tenang, tidak seperti campaign/iklan/sales blast.
  * Sebutkan judul proyek secara natural.
  * Sebutkan konteks proyek secara singkat (masalah/kebutuhan/aktivitas).
  * Jelaskan kenapa link layak dibuka (nilai referensi praktisnya).
  * Format 3–4 paragraf pendek maksimum.
  * Dilarang pakai hashtag.
  * Dilarang klaim berlebihan.
  * Hindari frasa berikut: "Hai! Saya ingin berbagi...", "solusi terbaik", "jangan sampai ketinggalan", "klik sekarang", "desain impian".
  * Akhiri dengan format:
    Baca lengkapnya di sini:
    [URL]`;

    const aiResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${aiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        input: [
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: `${prompt}\n\n${JSON.stringify({
                  contentType: body.contentType,
                  slug: body.slug,
                  goal: safeGoal,
                  blankFields: uniqueFields,
                  source,
                  notes: body.notes || null,
                })}`,
              },
            ],
          },
        ],
        temperature: 0.6,
        max_output_tokens: 900,
      }),
    });

    if (!aiResponse.ok) {
      const requestId = aiResponse.headers.get('x-request-id') || aiResponse.headers.get('openai-request-id');
      const errorText = (await aiResponse.text()).slice(0, 400);
      console.error(`${LOG_PREFIX} openai_http_error status=${aiResponse.status} requestId=${requestId || 'n/a'} msg=${errorText}`);
      return NextResponse.json({ data: fallbackData, fallbackUsed: true, debugReason: 'openai_http_error' });
    }
    const result = await aiResponse.json();
    const outputText = result.output_text || result.output?.[0]?.content?.[0]?.text || '';
    if (!outputText.trim()) {
      console.error(`${LOG_PREFIX} openai_empty_response`);
      return NextResponse.json({ data: fallbackData, fallbackUsed: true, debugReason: 'openai_empty_response' });
    }
    let json: Partial<Record<RegenerableField, string>> = {};
    try {
      json = JSON.parse(normalizeJsonOutput(outputText)) as Partial<Record<RegenerableField, string>>;
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : 'invalid_json';
      console.error(`${LOG_PREFIX} openai_invalid_json msg=${errMsg}`);
      if (uniqueFields.length === 1) {
        const field = uniqueFields[0] as RegenerableField;
        const salvaged = postProcessField(field, outputText);
        if (field === 'youtubeDescription' && /(canvaCarouselSlides|Visual:|Narasi:|Overlay:|Caption:|Text:|[{[])/i.test(salvaged)) {
          return NextResponse.json({
            data: { [field]: fallbackData[field] || '' },
            fallbackUsed: true,
            debugReason: 'openai_plain_text_salvaged_youtube_fallback',
          });
        }
        if (
          field === 'tiktokCaption' &&
          /(canvaCarouselSlides|canvaReelsTimeline|canvaOverlayText|Visual:|Narasi:|Overlay:|[{[])/i.test(outputText)
        ) {
          return NextResponse.json({
            data: { [field]: fallbackData[field] || '' },
            fallbackUsed: true,
            debugReason: 'openai_plain_text_salvaged_tiktok_fallback',
          });
        }
        if (
          field === 'canvaOverlayText' &&
          (!salvaged.trim() || salvaged.split('\n').some((line) => line.split(' ').filter(Boolean).length > 8))
        ) {
          return NextResponse.json({
            data: { [field]: fallbackData[field] || '' },
            fallbackUsed: true,
            debugReason: 'openai_plain_text_salvaged_overlay_fallback',
          });
        }
        if (salvaged.trim()) {
          return NextResponse.json({
            data: { [field]: salvaged },
            fallbackUsed: false,
            debugReason: 'openai_plain_text_salvaged',
          });
        }
      }
      if (uniqueFields.length > 1) {
        try {
          const repairedJson = await repairInvalidJsonOutput({ aiKey, outputText, uniqueFields });
          if (repairedJson && typeof repairedJson === 'object') {
            json = repairedJson;
          } else {
            return NextResponse.json({ data: fallbackData, fallbackUsed: true, debugReason: 'openai_invalid_json' });
          }
        } catch (repairError) {
          const repairErrMsg = repairError instanceof Error ? repairError.message : 'repair_invalid_json';
          console.error(`${LOG_PREFIX} openai_repair_invalid_json msg=${repairErrMsg}`);
          return NextResponse.json({ data: fallbackData, fallbackUsed: true, debugReason: 'openai_invalid_json' });
        }
      } else {
        return NextResponse.json({ data: fallbackData, fallbackUsed: true, debugReason: 'openai_invalid_json' });
      }
    }

    const safeResult: Partial<Record<RegenerableField, string>> = {};
    const missingFields: RegenerableField[] = [];
    for (const field of uniqueFields as RegenerableField[]) {
      const value = json[field];
      if (typeof value === 'string' && value.trim()) {
        let processed = postProcessField(field, value);
        if (field === 'tiktokCaption' && source.url && !processed.includes(source.url)) {
          processed = `${processed}\n\nDetail lengkap:\n${source.url}`.replace(/\n{3,}/g, '\n\n').trim();
        }
        if (field === 'tiktokCaption' && /(canvaCarouselSlides|canvaReelsTimeline|canvaOverlayText|Visual:|Narasi:|Overlay:|Caption:|Text:|[{[])/i.test(processed)) {
          processed = fallbackData[field] || '';
        }
        if (field === 'youtubeDescription' && source.url && !processed.includes(source.url)) {
          processed = `${processed}\n\nLihat studi lengkapnya di website:\n${source.url}`.replace(/\n{3,}/g, '\n\n').trim();
        }
        if (field === 'whatsappMessage' && source.url && !processed.includes(source.url)) {
          processed = `${processed}\n\nBaca lengkapnya di sini:\n${source.url}`.replace(/\n{3,}/g, '\n\n').trim();
        }
        safeResult[field] = processed;
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
