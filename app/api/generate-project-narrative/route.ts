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

Gaya narasi Eryawan Studio:
- Tenang, matang, tidak berlebihan.
- Tidak banyak kata, langsung ke inti.
- Sistematis: problem → decision → impact.
- Berbasis manfaat, fungsi, sirkulasi, zoning, aktivitas pengguna, dan keputusan ruang.
- Tidak memakai bahasa marketing bombastis.
- Tidak terdengar seperti AI generik.
- Narasi harus terasa seperti desainer berpengalaman yang berpikir teratur, disiplin, strategis, dan terarah.

Cara berpikir:
1. Client problem bukan untuk dicopy mentah. Rumuskan ulang menjadi masalah desain yang jelas, ringkas, dan objektif.
2. Jika area scope atau project size tersedia, sertakan konteks area dan luas secara natural bila relevan.
3. Solution harus fokus pada keputusan desain, bukan deskripsi gaya visual semata.
4. Jelaskan zoning, flow/sirkulasi, material, lighting, fungsi, dan insight reference hanya jika didukung input atau gambar.
5. Impact harus fokus pada dampak nyata bagi klien dan pengguna ruang: aktivitas lebih mudah, efisiensi meningkat, fungsi lebih jelas, dan keputusan klien lebih terarah.
6. Jika structured input kosong, fallback ke analisis visual dari gambar saja.
7. Jika gambar tidak tersedia, gunakan structured input secara hati-hati dan jangan berpura-pura melihat gambar.

Fallback keamanan observasi:
- Jika gambar atau input kurang jelas, jangan mengarang berlebihan.
- Gunakan bahasa aman berbasis observasi visual dan konteks yang tersedia.
- Hindari klaim yang tidak bisa dilihat atau disimpulkan secara wajar.
- Gunakan frasa hati-hati seperti "terlihat", "mengarah pada", atau "mendukung" jika informasi tidak pasti.

Kontrol output:
- Problem: ringkas, objektif, fokus pada gangguan fungsi atau kebutuhan ruang.
- Solution: fokus pada keputusan desain yang terarah dan alasan fungsionalnya.
- Impact: fokus pada aktivitas, efisiensi, kejelasan ruang, dan kemudahan pengambilan keputusan klien.
- Kalimat tidak terlalu panjang.
- Hindari repetisi kata seperti "keputusan", "ruang", dan "aktivitas" terlalu berlebihan.
- Jangan memakai kata bombastis seperti "luar biasa", "revolusioner", "sempurna", "mewah maksimal", atau klaim marketing sejenis.

Format output WAJIB JSON valid saja tanpa markdown:
{
  "problem": "1 paragraf singkat. Bukan copy dari input. Rumuskan masalah desain secara objektif dengan konteks area dan luas bila relevan.",
  "solution": "1 paragraf singkat. Jelaskan keputusan desain utama: zoning, flow, material, lighting, reference style, dan area yang didesain hanya bila relevan.",
  "impact": "1 paragraf singkat. Jelaskan dampak nyata bagi pengguna dan klien: aktivitas, efisiensi, kejelasan fungsi, dan clarity keputusan."
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
        temperature: 0.25,
        max_output_tokens: 700,
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
