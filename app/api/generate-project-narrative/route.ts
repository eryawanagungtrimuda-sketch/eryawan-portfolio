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

function safeJsonParse(value: string): NarrativeResponse | null {
  try {
    const parsed = JSON.parse(value) as Partial<NarrativeResponse>;
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

  return prioritizedUrls.slice(0, 4);
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
Susun case study interior/arsitektur untuk Eryawan Studio.

Gaya wajib: tenang, matang, strategis, tidak bombastis, langsung ke inti. Jangan terdengar seperti AI generik.
Alur berpikir: konteks → konflik → keputusan desain → pendekatan → dampak → insight.
Fokus: fungsi, zoning, sirkulasi, material, lighting, aktivitas pengguna, efisiensi, dan clarity keputusan klien.
Jangan mengarang jika input/gambar kurang jelas; gunakan observasi aman seperti "terlihat" atau "mendukung".

Konteks:
Title: ${context.title || '-'}
Category: ${context.category || '-'}
Client problem: ${context.client_problem_raw || '-'}
Design reference: ${context.design_reference || '-'}
Area scope: ${context.area_scope || '-'}
Project size: ${context.project_size || '-'}
Images sent: ${imageUrls.length}

Output JSON valid saja:
{
  "konteks": "maks 350 karakter",
  "konflik": "maks 350 karakter",
  "keputusan_desain": "maks 450 karakter",
  "pendekatan": "maks 450 karakter",
  "dampak": "maks 350 karakter",
  "insight_kunci": "maks 260 karakter"
}
`;

  const content = [
    { type: 'input_text', text: prompt },
    ...imageUrls.map((imageUrl) => ({
      type: 'input_image',
      image_url: imageUrl,
      detail: 'low',
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
        model: 'gpt-4o-mini',
        input: [
          {
            role: 'user',
            content,
          },
        ],
        temperature: 0.2,
        max_output_tokens: 600,
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
