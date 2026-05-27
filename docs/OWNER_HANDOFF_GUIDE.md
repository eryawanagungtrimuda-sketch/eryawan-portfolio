# Owner Handoff Guide (Panduan Pemilik Website)

Dokumen ini ditujukan untuk pemilik website non-teknis agar operasional konten harian berjalan aman dan konsisten.

## 1) Website ini untuk apa?

Website ini adalah pusat profil profesional Eryawan untuk:
- menampilkan **Karya** (portfolio / project case studies),
- membagikan **Wawasan** (design insights / articles),
- mendorong calon klien masuk ke CTA utama: **Ajukan Kolaborasi** dan **Mulai Percakapan Proyek**.

## 2) Bagian publik utama

- **Beranda**: narasi utama brand + CTA.
- **Karya**: daftar proyek (arsip), bisa difilter berdasarkan **Area / Ruang**.
- **Studi Kasus (detail Karya)**: detail proyek, konteks masalah, keputusan desain, dampak, dan CTA.
- **Wawasan**: artikel insight desain.
- **Detail Wawasan**: artikel lengkap, bisa terhubung ke Karya terkait.
- **Kontak**: jalur konversi akhir untuk calon klien.

## 3) Konsep Admin/Editor (ringkas)

- Area admin dipakai untuk kelola konten, bukan untuk mengubah tampilan website.
- Secara umum ada editor untuk:
  - Karya/proyek,
  - Wawasan,
  - galeri gambar dan tag.
- Prinsip aman: ubah **isi konten** dulu, jangan ubah logika/fitur.

## 4) Karya management overview

Saat membuat/ubah Karya, pastikan komponen inti ini jelas:
- Judul proyek.
- Slug URL (usahakan stabil setelah publish).
- Ringkasan masalah/konteks.
- Kategori proyek.
- **Gaya Desain**.
- **Area / Ruang** (tag ruang).
- Cover image + urutan galeri.
- Status publish.

Tips praktis:
- Selalu pilih cover image paling representatif untuk thumbnail arsip Karya.
- Isi narasi dengan fokus “masalah → keputusan desain → dampak”.

## 5) Wawasan management overview

Untuk Wawasan, pastikan:
- Judul jelas dan spesifik.
- Excerpt/ringkasan membantu pembaca memahami isi artikel.
- Kategori/label sumber konsisten.
- Hubungkan ke Karya terkait jika relevan.

Tujuan Wawasan adalah menguatkan kredibilitas dan mengarahkan pembaca ke CTA.

## 6) Penggunaan tag Area / Ruang

- **Area / Ruang** dipakai untuk sistem filter dan konteks spasial konten.
- Gunakan tag yang paling relevan dengan isi proyek/foto (misal: living room, bedroom, kitchen, dsb).
- Hindari tag terlalu banyak jika tidak menambah konteks.
- Konsisten penamaan tag agar arsip rapi dan mudah dicari.

## 7) Catatan image, crop, dan tagging

- Gunakan gambar berkualitas baik, ringan, dan tetap relevan dengan narasi studi kasus.
- Periksa hasil crop/thumbnail agar objek penting tidak terpotong.
- Bila ada tagging di level gambar, gunakan hanya jika membantu konteks ruang.
- Cek urutan galeri: susun alur visual dari konteks → detail → hasil akhir.

## 8) Status Social Composer (penting)

- **Social Composer tersedia, tetapi saat ini dibekukan untuk pengembangan besar (frozen).**
- Gunakan secukupnya sebagai alat bantu draft/copy kerja.
- Jangan berharap ada perubahan fitur baru dalam waktu dekat tanpa proses development resmi.

## 9) Catatan monitoring analytics

- Vercel Web Analytics aktif untuk monitoring traffic dan interaksi dasar.
- Fokus pemantauan:
  - halaman yang paling sering dikunjungi,
  - performa CTA (**Ajukan Kolaborasi**, **Mulai Percakapan Proyek**),
  - tren konten Karya/Wawasan yang paling banyak menarik perhatian.
- Gunakan data untuk menentukan prioritas konten berikutnya.

## 10) Yang jangan disentuh tanpa bantuan developer

Jangan mengubah hal berikut tanpa pendampingan developer:
- Struktur database (schema).
- Aturan auth/RLS.
- Logika admin dan API route.
- Integrasi analytics/tracking script.
- Identitas visual utama (font, style system, layout global).

## 11) Rutin operasional yang direkomendasikan

### Mingguan (30–60 menit)
- Cek ada/tidak link rusak pada konten terbaru.
- Cek CTA WhatsApp dan jalur kontak utama.
- Cek performa sederhana di analytics.
- Review 1 Karya lama: apakah perlu update kecil (teks/foto/tag).

### Bulanan (1–2 jam)
- Publish minimal 1 konten baru (Karya atau Wawasan).
- Audit konsistensi tag **Area / Ruang**.
- Evaluasi 3 konten paling perform: apa pola yang berhasil.
- Rapikan backlog ide konten bulan berikutnya.

---

Jika ragu, prioritaskan prinsip ini:
**lebih baik update konten secara konsisten dan aman daripada melakukan perubahan teknis besar tanpa validasi.**
