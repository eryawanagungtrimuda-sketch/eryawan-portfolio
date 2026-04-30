import { NextResponse } from 'next/server';

type GenerateNarrativeBody = {
  imageUrls?: string[];
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

function safeJsonParse(value: string): NarrativeResponse | null {
  try {
    const parsed = JSON.parse(value) as Partial<NarrativeResponse>;
    if (!parsed.problem || !parsed.solution || !parsed.impact) return null;

    return {
      problem: String(parsed.problem),
      solution: String(parsed.solution),
      impact: String(parsed.impact),
    };
  } catch {
    return null;
  }
}

function hasStructuredInput(body: GenerateNarrativeBody) {
  return Boolean(
    body.client_problem_raw?.trim() ||
      body.design_reference?.trim() ||
      body.area_scope?.trim() ||
      body.project_size?.trim(),
  );
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

  const imageUrls = Array.isArray(body.imageUrls)
    ? body.imageUrls.filter((url) => typeof url === 'string' && url.startsWith('http')).slice(0, 8)
    : [];

  const structuredInputAvailable = hasStructuredInput(body);

  if (imageUrls.length === 0 && !structuredInputAvailable) {
    return NextResponse.json(
      { error: 'Isi minimal satu structured input atau upload minimal 1 gambar project terlebih dahulu.' },
      { status: 400 },
    );
  }

  const prompt = `
Anda adalah strategic interior/architecture design writer untuk portfolio profesional Eryawan Studio.

Tugas:
Gabungkan structured input dari form dan observasi visual gambar project (jika ada), lalu hasilkan narasi bahasa Indonesia untuk field CMS berikut:
- problem
- solution
- impact

Konteks project:
Title: ${body.title || '-'}
Category: ${body.category || '-'}

Structured input dari admin:
Client problem raw: ${body.client_problem_raw || '-'}
Design reference insight: ${body.design_reference || '-'}
Area scope: ${body.area_scope || '-'}
Project size: ${body.project_size || '-'}
Jumlah gambar gallery: ${imageUrls.length}

Cara berpikir:
1. Client problem bukan untuk dicopy mentah. Rumuskan ulang menjadi masalah desain yang lebih jelas.
2. Jika area scope atau project size tersedia, sertakan konteks ruang dan luas secara natural bila relevan.
3. Solution harus menjelaskan keputusan desain: zoning, flow/sirkulasi, material, lighting, atmosfer, dan fungsi.
4. Gunakan design reference sebagai insight arah gaya/karakter, tetapi jangan membuat klaim yang tidak didukung input atau gambar.
5. Impact harus menjelaskan dampak ke aktivitas pengguna, efisiensi ruang, dan clarity keputusan klien.
6. Jika structured input kosong, fallback ke analisis visual dari gambar saja.
7. Jika gambar tidak tersedia, gunakan structured input secara hati-hati dan jangan berpura-pura melihat gambar.

Prinsip observasi visual jika gambar tersedia:
- Baca kualitas ruang berdasarkan observasi visual saja.
- Perhatikan zoning, sirkulasi, material, pencahayaan, atmosfer, fungsi, keputusan desain, dan dampak terhadap pengguna ruang.
- Jangan membuat klaim palsu yang tidak terlihat dari gambar.
- Jika ada hal yang tidak bisa dipastikan, gunakan bahasa hati-hati seperti "terlihat", "mengarah pada", atau "mendukung".

Tone:
- Profesional.
- Singkat.
- Tidak bertele-tele.
- Tidak lebay dan tidak terlalu puitis.
- Seperti arsitek/interior designer menjelaskan studi kasus kepada HRD, owner studio, atau calon klien.

Format output WAJIB JSON valid saja tanpa markdown:
{
  "problem": "1 paragraf singkat. Bukan copy dari input. Rumuskan masalah desain dengan konteks ruang dan luas bila relevan.",
  "solution": "1 paragraf singkat. Jelaskan keputusan desain: zoning, flow, material, lighting, reference style, dan area yang didesain.",
  "impact": "1 paragraf singkat. Jelaskan dampak ke aktivitas pengguna, efisiensi ruang, dan clarity keputusan klien."
}
`;

  const content = [
    { type: 'input_text', text: prompt },
    ...imageUrls.map((imageUrl) => ({
      type: 'input_image',
      image_url: imageUrl,
      detail: 'auto',
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
        model: 'gpt-4.1-mini',
        input: [
          {
            role: 'user',
            content,
          },
        ],
        temperature: 0.35,
        max_output_tokens: 900,
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
