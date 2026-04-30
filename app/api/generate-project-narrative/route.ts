import { NextResponse } from 'next/server';

type GenerateNarrativeBody = {
  imageUrls?: string[];
  title?: string;
  category?: string;
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

  if (imageUrls.length === 0) {
    return NextResponse.json({ error: 'Upload minimal 1 gambar project terlebih dahulu.' }, { status: 400 });
  }

  const prompt = `
Anda adalah strategic interior/architecture design writer untuk portfolio profesional Eryawan Studio.

Tugas:
Analisis gambar project secara visual, lalu hasilkan narasi bahasa Indonesia untuk field CMS berikut:
- problem
- solution
- impact

Konteks project:
Title: ${body.title || '-'}
Category: ${body.category || '-'}

Prinsip analisis:
- Baca kualitas ruang berdasarkan observasi visual saja.
- Perhatikan zoning, sirkulasi, material, pencahayaan, atmosfer, fungsi, keputusan desain, dan dampak terhadap pengguna ruang.
- Jangan membuat klaim palsu yang tidak terlihat dari gambar.
- Jika ada hal yang tidak bisa dipastikan, gunakan bahasa hati-hati seperti "terlihat", "mengarah pada", atau "mendukung".
- Tone harus professional, strategic, tenang, dan cocok untuk HRD, owner studio, serta calon klien.
- Jangan lebay, jangan terlalu puitis, jangan terlalu panjang.

Format output WAJIB JSON valid saja tanpa markdown:
{
  "problem": "1 paragraf singkat tentang masalah/kebutuhan ruang yang terlihat atau dapat disimpulkan secara hati-hati.",
  "solution": "1 paragraf singkat tentang keputusan desain/solusi strategis: zoning, flow, material, cahaya, fungsi.",
  "impact": "1 paragraf singkat tentang dampak terhadap efisiensi, kejelasan ruang, pengalaman pengguna, atau kualitas aktivitas."
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
        temperature: 0.4,
        max_output_tokens: 900,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[generate-project-narrative] OpenAI API error', errorText);
      return NextResponse.json({ error: 'AI gagal membaca gambar. Periksa OPENAI_API_KEY atau coba lagi.' }, { status: 502 });
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
