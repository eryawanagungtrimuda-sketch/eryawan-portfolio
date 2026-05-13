# Audit Editor Proyek: Upload, Delete, Sort, dan Cover Image

## Ruang lingkup
Audit ini meninjau implementasi saat ini pada `components/project-form.tsx` dan utilitas storage terkait, dengan fokus:

1. Upload image
2. Delete image
3. Pengurutan image
4. Pemilihan cover

## Temuan utama

### 1) Sistem Upload Image

**Yang sudah baik**
- Validasi tipe file sudah dibatasi ke JPG/PNG/WEBP dan ukuran maksimal 2MB per file.
- UI mendukung multi-upload dan retry untuk file yang gagal.
- Terdapat preflight check untuk bucket storage dan validasi sesi admin sebelum upload.
- Nama file storage dibuat unik (`timestamp + randomUUID`) sehingga tabrakan nama file sangat kecil.

**Risiko/masalah UX & teknis**
- Belum ada deduplikasi konten file; user bisa upload gambar yang sama berkali-kali selama nama file berbeda.
- Proses upload dilakukan serial (loop per file dengan `await`), sehingga batch besar terasa lambat.
- Feedback progress masih global (`Uploading...`), belum ada progress per file.
- Batas 2MB tidak dikomunikasikan dekat tombol upload sebelum user memilih file.
- Kegagalan insert DB setelah upload storage bisa meninggalkan orphan file di bucket (sudah ada pesan error, tapi belum ada rollback otomatis remove file yang baru diupload).

**Saran perbaikan**
- Tambahkan deduplikasi ringan di client: cek kombinasi `name + size + lastModified`, plus opsi hash (SHA-256) bila ingin akurat.
- Ubah alur upload ke paralel terbatas (mis. concurrency 3) agar cepat tapi tetap stabil.
- Tambahkan progress bar per file dan status sukses/gagal pada tiap item.
- Tampilkan hint eksplisit di UI: "Format: JPG/PNG/WEBP, maks 2MB/file" dekat tombol upload.
- Saat insert DB gagal, lakukan kompensasi: hapus file yang baru saja berhasil di-upload agar tidak orphan.

### 2) Sistem Delete Image

**Yang sudah baik**
- Ada konfirmasi sebelum hapus.
- Hapus DB dilakukan dulu, lalu coba hapus file di storage.
- Jika gambar yang dihapus adalah cover, sistem memilih cover baru otomatis (gambar pertama tersisa) dan update ke tabel `projects`.

**Risiko/masalah UX & teknis**
- Tombol hapus memiliki label tidak konsisten (`Delete` pada cover vs `Remove` pada non-cover) sehingga affordance tidak konsisten.
- Tidak ada loading state per-card saat delete; user bisa klik berulang.
- Alur DB-first lalu storage-delete dapat menyebabkan inkonsistensi: jika storage delete gagal, record DB sudah hilang.
- Potensi salah hapus meningkat karena CTA hapus berdekatan dengan CTA cover tanpa pemisahan visual prioritas yang kuat.

**Saran perbaikan**
- Samakan label jadi satu istilah (contoh: "Hapus") dan gunakan ikon + warna destruktif konsisten.
- Tambahkan state `deletingImageId` untuk disable tombol di kartu terkait serta spinner kecil.
- Gunakan soft-delete atau server action/endpoint transaksional semu:
  1) Tandai pending delete,
  2) Hapus storage,
  3) Finalisasi delete DB.
- Tambah dialog konfirmasi yang menampilkan preview kecil + nama/alt text agar user yakin item yang dipilih benar.

### 3) Pengurutan Gambar

**Temuan**
- Data ditampilkan berdasarkan `sort_order`.
- Saat upload baru, `sort_order` diisi berurutan dari panjang list saat ini.
- Belum ada UI untuk reorder (drag-and-drop atau tombol naik/turun), sehingga admin tidak bisa menyusun urutan manual setelah upload.

**Dampak UX**
- Urutan akhir sangat bergantung pada urutan upload, bukan niat presentasi visual.
- Sulit melakukan kurasi storytelling foto proyek tanpa upload ulang/hapus-upload.

**Saran perbaikan**
- Tambahkan reorder dengan drag-and-drop (mis. dnd-kit) di grid gallery.
- Persist urutan baru ke `sort_order` dengan batch update.
- Sediakan fallback aksesibel: tombol "Naik"/"Turun" per item untuk keyboard-only user.
- Setelah reorder, tampilkan toast "Urutan tersimpan" dan autosave/debounce update.

### 4) Pemilihan Cover

**Yang sudah baik**
- Setiap gambar non-cover punya aksi "Jadikan Cover".
- Cover bisa dihapus (`Clear Cover`).
- Ada auto-fix: jika cover tidak ditemukan di gallery, sistem mencoba memilih gambar pertama sebagai cover.
- Saat upload gambar pertama dan belum ada cover, cover otomatis di-set.

**Risiko/masalah UX & teknis**
- Konsep cover tersebar di beberapa state/pesan (set cover, clear cover, auto-fix), berpotensi membingungkan tanpa penjelasan flow yang ringkas.
- Perubahan cover langsung menyentuh DB saat project sudah ada, tetapi juga ada pesan "Simpan project"; ini dapat menimbulkan persepsi inkonsisten (sudah tersimpan atau belum).
- Belum ada mode "pilih cover" yang lebih eksplisit (mis. radio-style single selection) yang mudah dipahami user non-teknis.

**Saran perbaikan**
- Ubah interaksi cover menjadi pola single-select yang jelas (radio/checkmark satu aktif).
- Konsolidasikan copywriting status: bedakan "tersimpan lokal" vs "tersimpan ke server" secara eksplisit.
- Tambahkan badge permanen + pin action yang konsisten di setiap kartu.
- Sediakan aksi cepat "Gunakan cover saat ini" dan "Ganti cover" tanpa upload ulang.

## Rekomendasi prioritas implementasi (UI/UX roadmap)

### Prioritas Tinggi (Quick wins)
1. Konsistensi tombol hapus (label, warna, state loading per item).
2. Hint format/ukuran file di area upload + error message yang lebih actionable.
3. Reorder minimal dengan tombol Naik/Turun (tanpa DnD dulu).
4. Klarifikasi pesan cover agar user tahu status persistensi.

### Prioritas Menengah
1. Drag-and-drop reorder + autosave urutan.
2. Progress upload per file.
3. Kompensasi orphan file saat insert DB gagal.

### Prioritas Lanjut
1. Deduplikasi berbasis hash.
2. Endpoint backend yang lebih atomik untuk operasi delete dan upload.
3. Audit log perubahan gallery (siapa hapus apa/kapan) untuk lingkungan tim.

## Kesimpulan
Secara fungsional, editor proyek sudah cukup matang untuk alur dasar upload, delete, dan cover. Gap terbesarnya ada pada **kontrol urutan gambar** serta **kejelasan feedback UI** di operasi yang bersifat kritikal (upload sebagian gagal, delete, dan set cover). Dengan perbaikan terarah di atas, pengalaman admin akan jauh lebih cepat, aman, dan minim kebingungan.
