import type { ComposerDraft, ContentType, DetailPayload } from './types';
import { contentTypeLabel, shortText } from './helpers';

export function buildSocialDrafts(data: DetailPayload, contentType: ContentType): ComposerDraft {
  const tags = data.tags?.length ? data.tags.map((tag) => `#${tag.replace(/\s+/g, '')}`).join(' ') : '#DesainInterior #StudiKasus';
  const core = `${data.title}${data.year ? ` (${data.year})` : ''}`;
  const summary = data.summary || data.context || 'Proyek ini berangkat dari kebutuhan ruang yang spesifik dan terukur.';
  const context = data.context || data.summary || 'Konteks proyek difokuskan pada kebutuhan pengguna dan fungsi harian ruang.';
  const conflict = data.conflict || 'Tantangan utamanya adalah menyatukan fungsi, kenyamanan, dan karakter visual.';
  const decision = data.designDecision || data.solution || 'Keputusan desain diarahkan pada alur ruang yang efisien dan mudah dipakai.';
  const impact = data.impact || data.insight || 'Hasilnya terasa lebih nyaman dipakai, lebih rapi, dan relevan untuk aktivitas utama.';
  const insight = data.insight || 'Ruang yang berhasil adalah ruang yang terasa sederhana dipakai, bukan sekadar terlihat bagus.';
  const visualUrl = data.ogImage || data.visual;

  const igCaption = `Ruang yang enak dipakai selalu dimulai dari strategi yang tepat, bukan dari tampilan dulu.\n\nDi ${core}, fokus utamanya ada di alur aktivitas, prioritas fungsi, dan keputusan detail yang relevan untuk pemakaian harian.\n\n${shortText(decision, 160)} Hasilnya, ${shortText(impact, 140)}.\n\nLihat studi lengkap di website: ${data.canonicalUrl}`;

  const igStoryboard = `Reels storyboard\n1) Pembuka masalah: ${conflict}\n2) Batasan ruang: ${context}\n3) Masalah ke solusi: ${decision}\n4) Sudut pandang pengguna: ${impact}\n5) Penutup + CTA website`;

  const igCarousel = `Carousel slide outline\nSlide 1: Hook + judul proyek\nSlide 2: Latar belakang singkat\nSlide 3: Pembuka masalah\nSlide 4: Batasan ruang\nSlide 5: Masalah ke solusi\nSlide 6: Sudut pandang pengguna + hasil\nSlide 7: CTA ke website`;

  const linkedInCaption = `Dalam proyek ${core}, kami memulai dari kebutuhan pengguna dan batasan ruang nyata.\n\n${context}\n\nKeputusan desain difokuskan agar fungsi ruang lebih efektif sekaligus tetap memiliki karakter visual yang kuat.\n\nDampak utama: ${impact}`;
  const youtubeTitle = `${core} | Transformasi Ruang yang Lebih Fungsional #Shorts`;
  const youtubeDescription = `Proyek ${core} dimulai dari konteks nyata: ${shortText(context, 120)}\n\nSolusi utamanya: ${shortText(decision, 120)}\nDampak: ${shortText(impact, 120)}\n\nLihat studi lengkap di website:\n${data.canonicalUrl}`;
  const youtubeHashtags = `${tags} #Shorts #YouTubeShorts`;
  const youtubeUploadGuide = `Upload ke YouTube Shorts menggunakan file MP4 yang sama dari export Canva.\n1) Pastikan rasio 9:16 (1080 x 1920).\n2) Judul tetap singkat, jelas, dan mengandung kata kunci utama.\n3) Tempel deskripsi + hashtag untuk konteks dan jangkauan.\n4) Cek cover frame terbaik sebelum publish.`;

  const linkedInBullets = `• Keputusan desain dimulai dari kebutuhan pengguna utama dan ritme aktivitas harian.\n• Zoning disusun agar fungsi inti berjalan beriringan tanpa saling mengganggu.\n• Sirkulasi dipertegas untuk mengurangi friksi dan menjaga alur tetap efisien.\n• Material dan pencahayaan dipilih untuk performa pakai yang konsisten.\n• Dampaknya terasa langsung: ruang lebih tertata, ringan dipakai, dan relevan.`;

  const whatsappMessage = `Baru selesai menulis ${contentTypeLabel(contentType)} tentang ${core}.\n\nYang dibahas bukan hanya hasil akhirnya, tapi juga cara membaca kebutuhan pengguna dan kenapa keputusan zoning, alur ruang, serta materialnya diambil seperti itu.\n\nKalau sedang cari referensi praktis untuk strategi ruang yang lebih terarah dan nyaman dipakai, ini bisa membantu.\n\nBaca lengkap di sini:\n${data.canonicalUrl}`;
  const canvaReelsTimeline = `0-3 detik
Visual:
Hero shot area utama dengan gerakan kamera pelan.
Narasi:
Ruang ini terlihat rapi, tapi ritme pakainya perlu dibaca ulang.
Overlay:
Rapi belum tentu selesai

3-6 detik
Visual:
Sorot titik aktivitas utama saat ruang digunakan.
Narasi:
Tantangan muncul ketika fungsi istirahat, kerja, dan simpan belum selaras.
Overlay:
Fungsi belum berjalan seimbang

6-9 detik
Visual:
Tampilkan perubahan layout dan prioritas area.
Narasi:
Kami rapikan keputusan area supaya alur harian terasa lebih jelas.
Overlay:
Alur harian dibuat terarah

9-12 detik
Visual:
Close-up material, cahaya, dan storage.
Narasi:
Detail dipilih agar ruang tetap ringan dipakai dari pagi sampai malam.
Overlay:
Detail kecil, dampak nyata

12-15 detik
Visual:
Final reveal dari sudut terbaik.
Narasi:
Hasil akhirnya lebih tertata dan siap dipakai setiap hari.
Overlay:
Lihat studi lengkap di website`;

  const canvaCarouselSlides = `Slide 1 — Hook
Rapi belum tentu selesai
Ruang yang terlihat bersih belum tentu enak dipakai setiap hari.

Slide 2 — Konteks
Berangkat dari ritme harian
${shortText(summary, 140)}

Slide 3 — Masalah
Titik friksi mulai terasa
${shortText(conflict, 140)}

Slide 4 — Keputusan Desain
Prioritas area dirapikan
${shortText(decision, 140)}

Slide 5 — Detail Penting
Detail menentukan kualitas pakai
Material, cahaya, dan penyimpanan dipilih untuk ritme aktivitas nyata.

Slide 6 — Hasil
Ruang terasa lebih terarah
${shortText(impact, 140)}

Slide 7 — CTA
Lanjut lihat proses lengkap
Baca studi lengkapnya di website: ${data.canonicalUrl}`;

  const canvaOverlayText = `Rapi belum tentu siap dipakai
Ritme harian perlu dibaca ulang
Area prioritas dibuat lebih jelas
Cahaya dan material dibuat selaras
Ruang kini terasa lebih terarah
Lihat studi lengkap di website`;

  const bedroomHint = /bedroom|kamar tidur/i.test(`${data.title} ${summary} ${context} ${conflict} ${decision} ${impact} ${insight}`);
  const threadsPost = bedroomHint
    ? `Pas lihat ${core}, banyak orang fokus ke visual akhirnya. Padahal yang paling terasa itu justru ritme pakainya dari pagi sampai malam.

Di proyek ini, titik friksinya ada di kontrol cahaya, area belajar, dan kebutuhan istirahat yang sering saling tabrakan dalam satu ruang.

Karena itu keputusan utamanya bukan soal gaya dulu, tapi urutan aktivitas, storage yang masuk akal, lalu pemilihan warna dan material supaya atmosfernya tetap tenang dipakai harian.

Kalau di kamar kamu, bagian mana yang paling susah dijaga seimbang: fokus kerja, kualitas istirahat, atau kerapian simpan?`
    : `${core} kelihatan rapi di foto, tapi prosesnya justru dimulai dari hal yang lebih dasar: gimana ruang ini benar-benar dipakai setiap hari.

Masalah awalnya cukup jelas: ${shortText(conflict, 160)} Kami pakai itu sebagai titik berangkat, bukan sekadar tempelan narasi.

Keputusan desainnya lalu diarahkan ke ${shortText(decision, 170)} Dampaknya terasa di penggunaan harian: ${shortText(impact, 170)}.

Menurut kamu, detail kecil apa yang paling sering menentukan apakah ruang terasa “jadi” saat dipakai?`;

  const threadsReplyIdeas = bedroomHint
    ? `• Aku suka bagian saat friksi harian dijadikan dasar keputusan, bukan ditutup sama styling.
• Kontrol cahaya di jam berbeda biasanya paling cepat ngubah kualitas pakai ruang.
• Penempatan storage yang tepat sering lebih berdampak daripada nambah furnitur baru.
• Urutan aktivitas pengguna diurai dulu, jadi keputusan layout-nya terasa lebih masuk akal.
• Menarik kalau dibandingkan: mana detail yang paling terasa efeknya setelah ruang dipakai seminggu?`
    : `• Friksi utamanya kebaca jelas, jadi arah keputusan proyeknya terasa konsisten.
• Ringkasan konteksnya membantu lihat kenapa prioritas aktivitasnya disusun seperti itu.
• Keputusan kuncinya relevan karena langsung nyambung ke dampak penggunaan harian.
• Insight akhirnya bukan normatif, tapi bisa dipakai jadi acuan proyek serupa.
• Menurutku menarik kalau dibandingkan lagi setelah fase pemakaian berjalan beberapa minggu.`;

  const threadsCta = `Baca studi lengkapnya di website: ${data.canonicalUrl}`;

  const canvaVisualGuide = `Opening hero image:
- Gunakan OG/hero image sebagai scene pembuka untuk membangun konteks visual.

Detail material image:
- Ambil crop detail material, tekstur, atau sambungan yang merepresentasikan kualitas desain.

Activity/user image:
- Pilih foto dengan interaksi pengguna atau aktivitas utama agar manfaat ruang terasa nyata.

Closing image:
- Gunakan frame hasil akhir paling kuat, lalu tambahkan URL website sebagai CTA.

Referensi visual utama:
${visualUrl}`;

  const canvaExportGuide = `Reels:
- Ukuran: 1080 x 1920 px
- Format: MP4
- Durasi: 15 detik

Carousel:
- Ukuran: 1080 x 1350 px
- Format: PNG/JPG
- Jumlah: 7 slide

Best practice:
- Jaga teks agar tidak terlalu bawah (safe area).
- Gunakan overlay gelap untuk menjaga keterbacaan.
- Gunakan teks putih dengan aksen emas agar konsisten dengan brand.`;
  const canvaShareGuide = `- Setelah desain selesai, klik Share di Canva.
- Gunakan Instagram untuk posting Reels atau Carousel.
- Gunakan TikTok untuk upload video vertikal.
- Gunakan Download jika ingin upload manual ke YouTube Shorts atau LinkedIn.
- Gunakan Schedule jika akun Canva mendukung penjadwalan.
- Pastikan video tetap 1080 x 1920 untuk Reels, TikTok, dan Shorts.
- Pastikan carousel tetap 1080 x 1350 untuk Instagram Feed.`;

  return {
    igCaption,
    igHashtag: tags,
    igStoryboard,
    igCarousel,
    igCta: `Kunjungi website untuk studi lengkap: ${data.canonicalUrl}`,
    tiktokHook: 'Rapi itu mudah dilihat, nyaman dipakai itu tantangannya.',
    tiktokScript: `Di proyek ${core}, tantangan utamanya ada di alur pakai yang sering saling bertabrakan.\nKami rapikan zonanya supaya perpindahan aktivitas terasa lebih natural.\nMaterial dan pencahayaan juga disesuaikan agar ritme harian lebih nyaman.\nHasilnya bukan cuma terlihat rapi, tapi memang enak dipakai.\nKalau mau lihat detail prosesnya, studi lengkapnya ada di website.`,
    tiktokCaption: `${core} — strategi ruang yang fokus pada fungsi dan pengalaman pengguna.\nDetail lengkap: ${data.canonicalUrl}`,
    tiktokHashtag: tags,
    tiktokCta: `Lanjut baca di website: ${data.canonicalUrl}`,
    youtubeTitle,
    youtubeDescription,
    youtubeHashtags,
    youtubeUploadGuide,
    linkedInCaption,
    linkedInBullets,
    linkedInCta: `Baca studi ${contentTypeLabel(contentType)} lengkap: ${data.canonicalUrl}`,
    whatsappMessage,
    whatsappLink: data.canonicalUrl,
    canvaReelsTimeline,
    canvaCarouselSlides,
    canvaOverlayText,
    canvaVisualGuide,
    canvaExportGuide,
    canvaShareGuide,
    threadsPost,
    threadsReplyIdeas,
    threadsCta,
    ogImage: data.ogImage,
  };
}
