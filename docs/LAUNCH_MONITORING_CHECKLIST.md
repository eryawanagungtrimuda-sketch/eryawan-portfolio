# Launch Monitoring Checklist

Gunakan checklist ini setelah website live di production.

## 1) Cek Analytics & Performance
- Buka dashboard Vercel proyek.
- Masuk ke tab **Analytics** dan pastikan pageviews mulai masuk.
- Masuk ke tab **Speed Insights** dan pastikan data Core Web Vitals muncul.

## 2) Cek CTA Utama
- Buka homepage (`/`).
- Klik tombol **Mulai Percakapan Proyek**.
- Klik tombol **Lihat Karya**.
- Scroll ke bagian akhir homepage dan klik **Ajukan Kolaborasi**.

## 3) Cek Halaman Karya Detail
- Buka satu detail karya (`/karya/[slug]`).
- Klik tombol **Diskusikan Proyek Serupa via WhatsApp**.

## 4) Cek Halaman Wawasan Detail
- Buka satu detail wawasan (`/wawasan/[slug]`).
- Klik tombol **Mulai Percakapan Proyek via WhatsApp**.
- Jika ada blok sumber proyek, klik **Lihat Studi Kasus Proyek**.

## 5) Cek Halaman Kontak
- Buka halaman kontak (`/kontak`).
- Klik tombol email `mailto`.
- Klik tombol **Ajukan Kolaborasi**.

## 6) Cek Halaman Teknis SEO
- Buka `/404` (atau URL random yang tidak ada) dan pastikan tampil normal.
- Buka `/robots.txt` dan pastikan bisa diakses.
- Buka `/sitemap.xml` dan pastikan bisa diakses.

## 7) Cek Mobile & Desktop
- Ulangi pengujian utama dari perangkat mobile.
- Ulangi pengujian utama dari desktop/laptop.
- Pastikan tombol tetap mudah diklik/tap dan teks tetap terbaca.


## Cara memastikan Analytics aktif
- Buka dashboard Vercel untuk proyek ini.
- Buka tab **Analytics**.
- Kunjungi homepage (`/`) di domain production.
- Klik satu CTA yang sudah ditracking.
- Tunggu data event/pageview muncul di dashboard.
- Cek **Speed Insights** setelah traffic production tersedia.

## Catatan Penting Privasi
- Tracking hanya untuk event klik CTA.
- Data analytics bisa tidak muncul instan, tunggu beberapa saat setelah pengujian.
- Speed Insights membutuhkan kunjungan pengguna nyata agar datanya bermakna.
- Tidak mengirim isi form, isi pesan, email, nomor telepon, atau data pribadi pengunjung.
