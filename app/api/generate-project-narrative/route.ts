import { NextResponse } from 'next/server';

type GenerateNarrativeBody = {
  imageUrls?: string[];
  coverImage?: string;
  title?: string;
  category?: string;
  client_problem_raw?: string;
  design_reference?: string;
  area_scope?: string;
  project_size?: string;
};

type NarrativeResponse = {
  konteks: string;
  konflik: string;
  keputusan_desain: string;
  pendekatan: string;
  dampak: string;
  insight_kunci: string;
};

const inputLimits = {
  client_problem_raw: 500,
  design_reference: 500,
  area_scope: 300,
  project_size: 100,
};

const outputLimits = {
  konteks: 350,
  konflik: 350,
  keputusan_desain: 450,
  pendekatan: 450,
  dampak: 350,
  insight_kunci: 260,
};

function trimTo(value: unknown, maxLength: number) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, maxLength);
}

function trimOutput(value: string, maxLength: number) {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trim()}…`;
}

function normalizeJsonOutput(value: string) {
  let normalized = value.trim();

  if (normalized.startsWith('```json')) {
    normalized = normalized.slice(7).trim();
  }

  if (normalized.startsWith('```')) {
    normalized = normalized.slice(3).trim();
  }

  if (normalized.endsWith('```')) {
    normalized = normalized.slice(0, -3).trim();
  }

  const firstBrace = normalized.indexOf('{');
  const lastBrace = normalized.lastIndexOf('}');

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    normalized = normalized.slice(firstBrace, lastBrace + 1);
  }

  return normalized;
}

function safeJsonParse(value: string): NarrativeResponse | null {
  try {
    const normalizedValue = normalizeJsonOutput(value);
    const parsed = JSON.parse(normalizedValue) as Partial<NarrativeResponse>;
    if (!parsed.konteks || !parsed.konflik || !parsed.keputusan_desain || !parsed.pendekatan || !parsed.dampak || !parsed.insight_kunci) return null;

    return {
      konteks: trimOutput(String(parsed.konteks), outputLimits.konteks),
      konflik: trimOutput(String(parsed.konflik), outputLimits.konflik),
      keputusan_desain: trimOutput(String(parsed.keputusan_desain), outputLimits.keputusan_desain),
      pendekatan: trimOutput(String(parsed.pendekatan), outputLimits.pendekatan),
      dampak: trimOutput(String(parsed.dampak), outputLimits.dampak),
      insight_kunci: trimOutput(String(parsed.insight_kunci), outputLimits.insight_kunci),
    };
  } catch {
    return null;
  }
}

function uniqueHttpUrls(urls: string[]) {
  return Array.from(new Set(urls.filter((url) => typeof url === 'string' && url.startsWith('http'))));
}

function getOptimizedImageUrls(body: GenerateNarrativeBody) {
  const coverImage = typeof body.coverImage === 'string' && body.coverImage.startsWith('http') ? body.coverImage : '';
  const galleryUrls = Array.isArray(body.imageUrls) ? uniqueHttpUrls(body.imageUrls) : [];
  const prioritizedUrls = coverImage ? [coverImage, ...galleryUrls.filter((url) => url !== coverImage)] : galleryUrls;

  return prioritizedUrls.slice(0, 3);
}

export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY belum tersedia. Tambahkan environment variable OPENAI_API_KEY di Vercel.' },
      { status: 500 },
    );
  }

  let body: GenerateNarrativeBody;

  try {
    body = (await request.json()) as GenerateNarrativeBody;
  } catch {
    return NextResponse.json({ error: 'Request body tidak valid.' }, { status: 400 });
  }

  const context = {
    title: trimTo(body.title, 120),
    category: trimTo(body.category, 120),
    client_problem_raw: trimTo(body.client_problem_raw, inputLimits.client_problem_raw),
    design_reference: trimTo(body.design_reference, inputLimits.design_reference),
    area_scope: trimTo(body.area_scope, inputLimits.area_scope),
    project_size: trimTo(body.project_size, inputLimits.project_size),
  };

  const imageUrls = getOptimizedImageUrls(body);
  const hasContext = Boolean(
    context.client_problem_raw || context.design_reference || context.area_scope || context.project_size,
  );

  if (imageUrls.length === 0 && !hasContext) {
    return NextResponse.json({ error: 'Tambahkan gambar atau konteks project terlebih dahulu.' }, { status: 400 });
  }

  const prompt = `
Peran: Anda adalah editor studi kasus untuk portfolio Eryawan Studio sekaligus partner berpikir seorang desainer interior senior. Tugas Anda bukan sekadar memperindah kalimat, tetapi mengungkap logika di balik keputusan desain yang benar-benar didukung data.

Bahasa dan suara:
- Bahasa Indonesia yang natural, tenang, tajam, profesional, dan terasa ditulis manusia.
- Tunjukkan kecermatan mengamati ruang, kreativitas, dan pertimbangan desain melalui alasan yang konkret; jangan memuji desainer secara langsung.
- Hindari jargon berlebihan, kalimat promosi, kata sifat kosong, dan frasa template seperti "meningkatkan pengalaman pengguna", "memenuhi kebutuhan secara optimal", atau "keseimbangan estetika dan fungsi" kecuali dijelaskan secara spesifik.
- Ringkas, tetapi setiap bagian harus memberi informasi baru.

Aturan fakta yang wajib:
1. Gunakan data proyek dan gambar sebagai sumber utama. Jangan mengarang brief klien, kebutuhan, batasan ruang, material, ukuran, proses kerja, hasil pembangunan, feedback pengguna, atau dampak terukur.
2. Bedakan fakta input, hal yang benar-benar terlihat pada gambar, dan interpretasi desain. Klaim tentang permintaan klien hanya boleh ditulis jika didukung brief yang diberikan; jangan menyimpulkan kepribadian atau karakter pribadi klien dari gaya desain.
3. Jika gambar atau konteks tidak cukup untuk memastikan suatu hal, hilangkan klaim tersebut atau jelaskan sebagai tujuan/pertimbangan rancangan, bukan hasil yang sudah terbukti.
4. Jangan memaksakan topik material, zoning, sirkulasi, lighting, atau efisiensi jika tidak relevan dengan proyek.
5. Jangan mengulang gagasan, alasan, atau manfaat yang sama di beberapa bagian.
6. Jika konflik desain yang spesifik tidak dapat dipastikan dari brief atau gambar, nyatakan keterbatasan itu secara singkat; jangan menciptakan konflik agar narasi terasa dramatis.

Tugas keenam bagian—setiap bagian harus memiliki peran berbeda:
- konteks: tetapkan fakta dasar proyek, jenis ruang, cakupan, dan tujuan yang benar-benar tersedia. Jangan menyalin seluruh brief atau membuat klaim tentang klien yang tidak ada di input.
- konflik: jelaskan trade-off desain yang nyata dan didukung input/gambar. Jika tidak ada konflik spesifik yang bisa dipastikan, akui secara singkat alih-alih mengarang masalah.
- keputusan_desain: pilih 1–3 keputusan paling bermakna; jelaskan apa yang dipilih dan alasan desainnya. Ini bagian utama untuk menjawab "apa yang diputuskan dan mengapa".
- pendekatan: jelaskan bagaimana keputusan-keputusan itu saling bekerja dalam susunan ruang, zoning, hubungan visual, atau urutan penggunaan. Jangan mengulang keputusan satu per satu.
- dampak: jelaskan konsekuensi yang dapat dibaca dari rancangan atau manfaat yang dituju. Fokus pada apa yang berubah/menjadi terbaca dalam komposisi ruang; jangan mengulang cara penataan pada bagian pendekatan atau pelajaran umum pada insight.
- insight_kunci: simpulkan satu prinsip desain yang bisa diterapkan pada proyek lain. Ambil pelajaran dari proyek ini tanpa mengulang deskripsi meja, sofa, material, zoning, atau dampak yang baru saja dijelaskan.

Batas karakter:
- konteks: maks 350 karakter
- konflik: maks 350 karakter
- keputusan_desain: maks 450 karakter
- pendekatan: maks 450 karakter
- dampak: maks 350 karakter
- insight_kunci: maks 260 karakter

Data proyek:
Judul: ${context.title || '-'}
Kategori: ${context.category || '-'}
Masalah/brief klien: ${context.client_problem_raw || 'Tidak diberikan'}
Referensi desain: ${context.design_reference || 'Tidak diberikan'}
Cakupan area: ${context.area_scope || 'Tidak diberikan'}
Ukuran proyek: ${context.project_size || 'Tidak diberikan'}
Jumlah gambar yang dianalisis: ${imageUrls.length}

Tulis setiap bagian sebagai paragraf mandiri. Keluaran harus berupa JSON dengan keenam properti yang diminta; tanpa markdown atau teks di luar JSON.
`;

  const content = [
    { type: 'input_text', text: prompt },
    ...imageUrls.map((imageUrl, index) => ({
      type: 'input_image',
      image_url: imageUrl,
      // Give the cover image more visual detail while keeping gallery inputs economical.
      detail: index === 0 ? 'high' : 'low',
    })),
  ];

  try {
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-6.1-terra',
        reasoning: { effort: 'low' },
        input: [
          {
            role: 'user',
            content,
          },
        ],
        text: {
          format: {
            type: 'json_schema',
            name: 'project_narrative',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                konteks: { type: 'string' },
                konflik: { type: 'string' },
                keputusan_desain: { type: 'string' },
                pendekatan: { type: 'string' },
                dampak: { type: 'string' },
                insight_kunci: { type: 'string' },
              },
              required: [
                'konteks',
                'konflik',
                'keputusan_desain',
                'pendekatan',
                'dampak',
                'insight_kunci',
              ],
              additionalProperties: false,
            },
          },
        },
        max_output_tokens: 1200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generate-project-narrative] OpenAI API error', errorText);
      return NextResponse.json({ error: 'AI gagal membuat narasi. Periksa OPENAI_API_KEY atau coba lagi.' }, { status: 502 });
    }

    const result = await response.json();
    const outputText = result.output_text || result.output?.[0]?.content?.[0]?.text || '';
    const parsed = safeJsonParse(outputText);

    if (!parsed) {
      console.error('[generate-project-narrative] Invalid AI JSON output', outputText);
      return NextResponse.json({
        konteks: 'Konteks project belum cukup jelas dari input yang ada.',
        konflik: 'Konflik utama belum bisa diidentifikasi secara presisi.',
        keputusan_desain: 'Keputusan desain perlu disusun ulang dari brief dan observasi visual.',
        pendekatan: 'Pendekatan implementasi belum dapat disimpulkan secara aman.',
        dampak: 'Dampak implementasi belum dapat diproyeksikan secara meyakinkan.',
        insight_kunci: 'Lengkapi brief untuk menghasilkan insight yang lebih tajam.',
      });
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('[generate-project-narrative] Unexpected error', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat membuat narasi AI.' }, { status: 500 });
  }
}
