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
- QRIS yang diunggah disimpan pada bucket publik agar gambar dapat tampil pada invoice klien. Unggah hanya QRIS resmi yang memang boleh dibagikan kepada pembayar.
- Invoice lama menyimpan salinan identitas dan path QRIS saat invoice disetujui, sehingga perubahan pengaturan tidak mengubah invoice yang sudah disetujui.

## Checklist penerapan

1. Tinjau dan merge PR terlebih dahulu.
2. Jalankan migrasi \`supabase/migrations/20261114130000_create_invoice_payment_workflow.sql\` pada database Supabase yang dituju.
3. Pastikan migrasi berhasil sebelum menguji halaman invoice.
4. Isi identitas penagih dan unggah QRIS resmi melalui Panel Inquiry.
5. Uji alur dengan inquiry uji dan nominal kecil; jangan mengirim invoice nyata sebelum detail dan tampilan PDF diperiksa.
6. Jangan menjalankan pengiriman nyata saat pengujian awal.
