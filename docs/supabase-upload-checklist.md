# Supabase Upload Checklist (Non-Programmer Friendly)

Panduan ini untuk memastikan upload gambar project berjalan normal di halaman admin.

## 1) Cek Environment Variable di Vercel

1. Buka **Vercel Dashboard** → pilih project ini.
2. Masuk ke **Settings** → **Environment Variables**.
3. Pastikan variabel berikut **ada** untuk environment yang dipakai (Production/Preview/Development):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_PROJECT_IMAGES_BUCKET` dengan nilai: `project-images`
4. Setelah menambah/mengubah variabel, lakukan **Redeploy** agar aplikasi membaca nilai terbaru.

> Jangan bagikan isi value (rahasia) ke publik.

## 2) Jalankan `supabase/schema.sql` di Supabase SQL Editor

1. Buka **Supabase Dashboard** → project yang dipakai website.
2. Masuk ke menu **SQL Editor**.
3. Buka file `supabase/schema.sql` dari repo ini, lalu copy seluruh isi file.
4. Paste ke SQL Editor dan klik **Run**.
5. Tunggu sampai status sukses (tanpa error).

## 3) Pastikan Tabel Database Sudah Ada

1. Di Supabase, buka menu **Table Editor**.
2. Pastikan tabel ini terlihat:
   - `projects`
   - `project_images`
3. Klik masing-masing tabel dan pastikan data bisa dibaca.

## 4) Pastikan Bucket Storage Sudah Ada dan Public

1. Di Supabase, buka menu **Storage**.
2. Pastikan ada bucket bernama **`project-images`**.
3. Klik bucket tersebut, lalu pastikan mode aksesnya **Public**.

Jika bucket tidak ada, upload akan gagal dengan error **bucket not found**.

## 5) Pastikan Storage Policies Aktif

1. Di Supabase, buka **Authentication** / **Policies** (tergantung UI versi dashboard).
2. Pastikan policy untuk:
   - tabel `projects`
   - tabel `project_images`
   - `storage.objects` untuk bucket `project-images`
   sudah aktif.
3. Cara paling aman: jalankan ulang `supabase/schema.sql` supaya policy dibuat ulang.

## 6) Test Upload dari Halaman Admin

Lakukan test manual dari salah satu halaman:
- `/admin/projects/new`
- `/admin/projects/[id]/edit`

Langkah test:
1. Login admin terlebih dahulu.
2. Isi field wajib project (minimal title agar slug terbentuk).
3. Klik **Upload Gallery**.
4. Pilih file gambar valid (JPG/PNG/WEBP, maksimal 2MB per file).
5. Pastikan gambar muncul di daftar gallery.
6. Coba set salah satu gambar sebagai cover.
7. Simpan perubahan project.

## 7) Daftar Error Umum dan Artinya

- **bucket not found**
  - Artinya bucket `project-images` belum ada (atau nama bucket berbeda).

- **permission denied**
  - Artinya user tidak punya izin ke storage/database. Biasanya policy belum aktif atau login admin bermasalah.

- **row-level security (RLS)**
  - Artinya aturan RLS menolak operasi. Jalankan ulang `supabase/schema.sql` dan cek policy.

- **session admin tidak ditemukan**
  - Artinya sesi login admin hilang/expired. Login ulang, lalu coba upload lagi.

- **file size lebih dari 2MB**
  - Artinya ukuran file melewati batas. Kompres gambar lalu upload ulang.

- **format selain JPG/PNG/WEBP**
  - Artinya tipe file tidak didukung. Ubah format gambar ke JPG, PNG, atau WEBP.

---

Jika upload masih gagal setelah checklist ini, kumpulkan:
1) pesan error yang muncul di UI, 2) screenshot pengaturan bucket, 3) screenshot policy aktif,
agar proses investigasi teknis lebih cepat.
