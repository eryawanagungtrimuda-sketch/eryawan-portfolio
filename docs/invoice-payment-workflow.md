# Invoice & Pengingat Termin Pembayaran

## Alur kerja admin

Fitur tersedia di halaman detail setiap inquiry melalui Panel Inquiry.

1. Isi nama penagih, kontak, dan alamat opsional pada bagian pengaturan invoice.
2. Unggah gambar QRIS Shopee resmi. Format yang diterima PNG, JPG, atau WebP dengan ukuran maksimal 2 MB.
3. Simpan total biaya yang telah disepakati dengan klien. Nilai budget dari formulir inquiry tidak otomatis dianggap sebagai harga final.
4. Buat invoice terpisah untuk termin DP 50%, progres 30%, atau final 20%.
5. Tinjau tanggal invoice dan jatuh tempo. Sistem mengusulkan jatuh tempo tiga hari kalender setelah tanggal invoice, tetapi admin harus menyesuaikannya dengan kesepakatan klien.
6. Ajukan invoice untuk persetujuan. Invoice baru dapat disetujui setelah identitas penagih, kontak, dan QRIS tersedia.
7. Setelah disetujui, gunakan tombol Simpan PDF / Cetak untuk membuka dialog cetak browser dan pilih Simpan sebagai PDF.
8. Siapkan WhatsApp atau email, lampirkan PDF secara manual, kirim melalui aplikasi pilihan, lalu catat status pengiriman di Panel Inquiry.
9. Setelah pembayaran benar-benar diterima dan diverifikasi, catat nominal serta tanggal pembayaran. Status lunas dihitung dari riwayat pembayaran.
10. Jika diperlukan, buat draf pengingat secara manual, edit isinya, ajukan persetujuan, setujui, lalu kirim melalui WhatsApp atau email. Jadwal H-1, jatuh tempo, dan terlambat adalah pilihan draf manual, bukan pengiriman terjadwal otomatis.

## Nomor invoice dan pajak

- Format nomor: EA-INV-TAHUN-NOMOR, misalnya EA-INV-2026-0001.
- Nomor dibuat otomatis dan urut per tahun.
- Setiap termin memiliki invoice tersendiri.
- Catatan invoice saat ini: “Pajak tidak ditambahkan pada invoice ini.” Catatan tersebut tidak menyatakan bahwa penagih otomatis bebas dari kewajiban pajak.

## Batasan fase awal

- Belum ada integrasi penyedia email atau WhatsApp untuk mengirim pesan otomatis.
- Tombol WhatsApp/email hanya membuka aplikasi dengan isi pesan yang telah disiapkan. Admin harus melampirkan PDF invoice secara manual jika diperlukan.
- Tidak ada pengiriman invoice atau pengingat otomatis.
- Tidak ada pengingat yang berjalan berdasarkan jadwal otomatis; admin memilih dan membuat draf saat diperlukan.
- QRIS disimpan pada bucket publik `invoice-assets` agar gambar tampil pada invoice yang dibagikan kepada klien. Bucket dibuat publik hanya jika belum ada; bila bucket bernama sama sudah ada tetapi privat, migrasi berhenti dan tidak mengubah visibilitas bucket tersebut. Tinjau bucket secara manual sebelum menjalankan ulang migrasi. Unggah hanya QRIS resmi yang memang boleh dibagikan kepada pembayar.
- Data invoice, pembayaran, pengingat, dan audit log dilindungi dari penghapusan berantai melalui relasi data. Invoice yang sudah memiliki riwayat harus dibatalkan, bukan dihapus.
- Migrasi memakai fungsi timestamp khusus invoice agar tidak mengganti fungsi umum yang digunakan tabel lain.
- Invoice lama menyimpan salinan identitas dan path QRIS saat invoice disetujui, sehingga perubahan pengaturan tidak mengubah invoice yang sudah disetujui.
- Pembuatan invoice, pencatatan pembayaran, pembuatan pengingat, dan perubahan status dijalankan melalui RPC database yang memeriksa JWT admin serta mengunci baris invoice/biaya yang relevan.
- Role API tidak dapat menulis langsung ke tabel invoice, pembayaran, pengingat, atau audit log; operasi tulis workflow harus melalui RPC tervalidasi.
- Nominal invoice harus sesuai termin 50% / 30% / sisa 20%. Migrasi berhenti jika mendeteksi data lama yang tidak konsisten agar dapat direkonsiliasi secara manual.
- Perubahan total biaya ditolak ketika masih ada invoice aktif untuk inquiry tersebut.
- Audit invoice, pembayaran, dan perubahan pengingat ditulis oleh trigger database dalam transaksi yang sama. Jika pencatatan audit gagal, perubahan terkait ikut dibatalkan.


## Checklist penerapan

1. Tinjau PR dan pastikan pemeriksaan otomatis lulus sebelum merge.
2. Jalankan kedua migrasi berurutan terlebih dahulu pada database staging/branch terpisah, bukan Production. Pastikan target database benar sebelum menjalankan perintah apa pun.
3. Jika migrasi berhenti karena data lama tidak konsisten atau bucket `invoice-assets` sudah ada tetapi privat, jangan menghapus pemeriksaan atau memaksa perubahan. Tinjau dan rekonsiliasi penyebabnya secara manual.
4. Uji pembuatan invoice, tiga termin, persetujuan/pengiriman, pembayaran parsial/lunas, pengingat, audit log, dan akses non-admin pada staging.
5. Buat cadangan Production terbaru dan lakukan uji restore ke database terpisah sebelum meminta persetujuan penerapan Production.
6. Setelah staging lulus, backup/restore tervalidasi, dan persetujuan eksplisit diberikan, jalankan migrasi pertama lalu kedua pada database Production yang sudah diverifikasi.
7. Isi identitas penagih dan unggah QRIS resmi melalui Panel Inquiry setelah migrasi berhasil.
8. Jangan mengirim invoice atau pengingat nyata saat pengujian awal.
