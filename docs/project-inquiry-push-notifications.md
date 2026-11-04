# Notifikasi Desktop untuk Inquiry Project

## Cara kerja

Saat calon klien berhasil menyimpan brief dari halaman Mulai Diskusi Project, website mengirim pemberitahuan desktop ke browser yang sudah diaktifkan oleh admin. Klik notifikasi akan membuka Panel Inquiry di halaman /admin/inquiries.

Teks notifikasi sengaja tidak memuat nama, nomor WhatsApp, email, atau isi brief calon klien agar informasi pribadi tidak muncul di layar kunci.

Notifikasi memerlukan HTTPS, izin notifikasi browser, serta browser dan sistem operasi yang mendukung Web Push. Pengiriman saat tab website tidak terbuka didukung, tetapi perilaku ketika browser benar-benar ditutup atau sistem operasi membatasi aktivitas latar belakang bergantung pada browser dan pengaturan perangkat.

## Pengaturan awal

Pengaturan ini dilakukan satu kali sebelum tombol aktivasi dapat digunakan.

### 1. Buat tabel langganan notifikasi di Supabase

Buka Supabase Dashboard, masuk ke SQL Editor, lalu jalankan isi file migrasi:

supabase/migrations/20261104100000_create_project_inquiry_push_subscriptions.sql

Jalankan hanya file migrasi tersebut untuk menyiapkan tabel baru. Jangan menjalankan ulang seluruh schema hanya untuk mengaktifkan notifikasi.

### 2. Buat pasangan VAPID key

Di terminal pada komputer yang memiliki Node.js, jalankan:

npx --yes web-push@3.6.7 generate-vapid-keys

Perintah akan menampilkan Public Key dan Private Key. Simpan keduanya dengan aman. Jangan memasukkan Private Key ke kode, GitHub, atau variabel yang diawali NEXT_PUBLIC_.

### 3. Tambahkan variabel di Vercel

Buka Vercel, pilih project eryawan-portfolio, lalu Settings → Environment Variables. Tambahkan variabel berikut untuk environment Production:

- SUPABASE_SERVICE_ROLE_KEY: secret service-role key dari pengaturan API project Supabase. Variabel ini hanya boleh berada di server.
- WEB_PUSH_VAPID_PUBLIC_KEY: Public Key hasil langkah 2.
- WEB_PUSH_VAPID_PRIVATE_KEY: Private Key hasil langkah 2.
- WEB_PUSH_SUBJECT: mailto:eryawanagungtrimuda@gmail.com

Jangan kirim atau membagikan nilai SUPABASE_SERVICE_ROLE_KEY dan WEB_PUSH_VAPID_PRIVATE_KEY di chat. Pastikan kedua variabel tersebut tidak menggunakan awalan NEXT_PUBLIC_. Setelah variabel disimpan, lakukan redeploy Production agar pengaturan terbaca oleh server.

### 4. Aktifkan notifikasi pada komputer

1. Buka https://eryawanagung.my.id/admin/inquiries di Chrome atau Edge desktop.
2. Masuk ke akun admin.
3. Pada bagian Notifikasi Desktop, klik Aktifkan Notifikasi Desktop.
4. Saat browser meminta izin, pilih Allow / Izinkan.

Aktivasi perlu dilakukan pada setiap browser atau perangkat yang ingin menerima notifikasi. Jika izin pernah diblokir, ubah izin notifikasi untuk website ini melalui pengaturan browser, lalu muat ulang halaman.

### 5. Uji pengiriman

Kirim satu brief uji melalui halaman Mulai Diskusi Project. Pastikan notifikasi desktop muncul, lalu klik notifikasi dan pastikan Panel Inquiry terbuka. Setelah pengujian, tandai inquiry uji sebagai arsip agar tidak tercampur dengan calon klien sungguhan.

## Catatan keamanan dan keandalan

- Pendaftaran dan penghapusan langganan memerlukan sesi admin yang valid; kebijakan database membatasi tabel langganan ke admin.
- Service-role key dan VAPID private key hanya digunakan di server.
- Jika push gagal atau pengaturan belum lengkap, brief tetap tersimpan dan formulir tetap melaporkan keberhasilan penyimpanan.
- Langganan yang sudah tidak berlaku dibersihkan ketika layanan push mengembalikan status 404 atau 410.
