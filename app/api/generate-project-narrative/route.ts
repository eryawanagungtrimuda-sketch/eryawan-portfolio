import { NextResponse } from 'next/server';
import { dedupeAreaTags } from '@/lib/area-tags';

type GenerateNarrativeBody = {
  imageUrls?: string[];
  coverImage?: string;
  title?: string;
  category?: string;
  client_problem_raw?: string;
  design_reference?: string;
  area_scope?: string;
  area_tags?: string[];
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

  const areaTags = Array.isArray(body.area_tags)
    ? dedupeAreaTags(
        body.area_tags
          .filter((tag): tag is string => typeof tag === 'string')
          .map((tag) => trimTo(tag, 60))
          .slice(0, 10),
      )
    : [];
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
6. Jangan menulis catatan tentang informasi yang tidak tersedia, misalnya "brief tidak merinci konflik" atau "gambar tidak cukup menjelaskan". Jika konflik spesifik tidak terdokumentasi, rumuskan pertimbangan desain yang benar-benar didukung fakta proyek dan gambar sebagai trade-off penataan yang wajar—bukan keluhan klien atau masalah dramatis yang dikarang. Contohnya, bila beberapa fungsi memang berada dalam luasan terbatas, jelaskan kebutuhan menyeimbangkan fungsi dan keterbacaan zona hanya jika cakupan dan gambar mendukungnya. Jika tidak ada trade-off yang dapat dipertanggungjawabkan, tulis pertimbangan desain netral tanpa menyebut kekurangan informasi.
7. Area/Ruang Tags adalah daftar area terstruktur yang dipilih editor dan harus diperlakukan sebagai area yang termasuk dalam proyek. Area Scope adalah deskripsi teks pendamping yang mungkin belum menyebut semua area. Gunakan keduanya secara komplementer untuk menjelaskan cakupan secara natural. Jangan menambahkan area yang tidak didukung tag, brief, atau gambar. Jika ada pertentangan langsung antar-sumber, jangan menebak penyelesaiannya.
8. Narasi ditujukan untuk pengunjung portofolio, bukan editor. Jangan pernah menyebut tag, metadata, Area Scope, input yang tidak konsisten, atau masalah pengisian data. Jangan menceritakan perbedaan sumber internal; cukup tulis fakta proyek yang dapat dinyatakan dengan aman.

Tugas keenam bagian—setiap bagian harus memberi informasi baru dan memiliki peran yang tegas:
- konteks: rangkum jenis proyek, cakupan area yang termasuk, luas jika tersedia, dan tujuan desain yang benar-benar didukung input. Gunakan tag area terpilih sebagai daftar cakupan; satukan dengan Area Scope dalam kalimat natural. Jangan menyimpulkan karakter pribadi klien dari gaya desain. Jika brief secara eksplisit menyebut karakter atau ekspresi yang diinginkan, ubah menjadi arah ekspresi desain yang relevan, bukan penilaian psikologis tentang penghuni.
- konflik: sebutkan satu trade-off penataan yang masuk akal dan didukung fakta proyek atau gambar. Jangan menganggap luas yang kecil otomatis berarti ruang bermasalah, tetapi pertimbangkan hubungan antara luas dan jumlah fungsi jika keduanya dinyatakan. Jangan menyebut bahwa brief tidak merinci konflik, jangan mengeluhkan kekurangan data, dan jangan mengarang keluhan klien. Tulis tantangannya sebagai persoalan desain yang perlu diseimbangkan, bukan sebagai kegagalan atau masalah dramatis.
- keputusan_desain: pilih 1–3 keputusan paling bermakna dan jelaskan alasan desainnya. Ini satu-satunya bagian yang menjabarkan secara langsung apa yang dipilih dan mengapa.
- pendekatan: jelaskan prinsip pengorganisasian ruang atau hubungan antarelemen secara menyeluruh. Jangan membuat daftar ulang keputusan atau mengulang objek utama dari bagian sebelumnya kecuali diperlukan untuk menjelaskan hubungan yang berbeda.
- dampak: jelaskan hasil visual/komposisional yang dapat diamati dari rancangan pada gambar, seperti keterbacaan zona, hubungan antararea, atau keseimbangan komposisi. Jangan mengklaim hasil terbangun, peningkatan kenyamanan nyata, kepuasan klien, atau dampak terukur tanpa bukti.
- insight_kunci: tarik satu prinsip interior yang spesifik, positif, dan dapat diterapkan pada proyek lain. Rumuskan sebagai pelajaran desain yang berguna bagi pembaca—misalnya tentang organisasi fungsi, proporsi, komposisi, pencahayaan, material, atau hubungan visual—sesuai bukti proyek. Jangan menjadikan insight sebagai komentar tentang kepribadian klien, cara AI menafsirkan brief, keterbatasan informasi, atau instruksi sistem. Hindari frasa meta seperti "tanpa perlu menyimpulkan", "brief tidak merinci", atau "berdasarkan informasi yang tersedia".

Pemeriksaan sebelum keluaran:
- Setiap bagian harus punya gagasan utama yang berbeda. Jangan mengulang ide yang sama dengan sinonim seperti "tanpa sekat penuh", "penanda peralihan", dan "mudah dibaca" di banyak bagian.
- Satu keputusan spesifik boleh dirujuk lagi hanya jika bagian berikutnya menambahkan konsekuensi yang berbeda dan penting; jika tidak, jangan ulangi.
- Jangan menulis kalimat yang membahas tag, metadata, kelengkapan input, perbedaan data internal, atau keterbatasan brief kepada pengunjung portofolio.
- Jangan menampilkan komentar tentang proses berpikir AI atau aturan prompt pada bagian mana pun.
- Jika suatu fakta tidak didukung, hilangkan klaim tersebut; jangan menggantinya dengan penjelasan bahwa data tidak tersedia.

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
Cakupan area (deskripsi teks): ${context.area_scope || 'Tidak diberikan'}
Tag area terstruktur: ${areaTags.length ? areaTags.join(', ') : 'Tidak diberikan'}
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
