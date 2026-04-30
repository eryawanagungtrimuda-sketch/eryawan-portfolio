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
  problem: string;
  solution: string;
  impact: string;
};

const inputLimits = {
  client_problem_raw: 500,
  design_reference: 500,
  area_scope: 300,
  project_size: 100,
};

const outputLimits = {
  problem: 450,
  solution: 600,
  impact: 450,
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
    if (!parsed.problem || !parsed.solution || !parsed.impact) return null;

    return {
      problem: trimOutput(String(parsed.problem), outputLimits.problem),
      solution: trimOutput(String(parsed.solution), outputLimits.solution),
      impact: trimOutput(String(parsed.impact), outputLimits.impact),
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
Tulis narasi studi kasus interior/arsitektur untuk Eryawan Studio.

Gaya wajib: tenang, matang, strategis, tidak bombastis, langsung ke inti. Jangan terdengar seperti AI generik.
Alur berpikir: problem → design decision → impact.
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
  "problem": "maks 450 karakter; objektif, bukan copy input mentah",
  "solution": "maks 600 karakter; fokus keputusan desain dan alasan fungsional",
  "impact": "maks 450 karakter; dampak nyata bagi pengguna/klien"
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
        max_output_tokens: 450,
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
      return NextResponse.json({ error: 'AI menghasilkan format yang tidak valid. Coba lagi.' }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('[generate-project-narrative] Unexpected error', error);
    return NextResponse.json({ error: 'Terjadi kesalahan saat membuat narasi AI.' }, { status: 500 });
  }
}
