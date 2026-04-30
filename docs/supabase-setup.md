# Supabase Setup — Eryawan Studio Portfolio

Panduan ini memastikan database, auth, dan storage siap dipakai oleh CMS portfolio.

## 1. Environment Variables

Tambahkan variable berikut di Vercel Project Settings → Environment Variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_ADMIN_EMAIL=eryawanagungtrimuda@gmail.com
NEXT_PUBLIC_SITE_URL=https://domain-anda.com
OPENAI_API_KEY=
```

Jangan gunakan Supabase service role key di frontend atau public environment variable.

## 2. Database Schema

Buka Supabase Dashboard → SQL Editor, lalu jalankan isi file:

```text
supabase/schema.sql
```

File tersebut membuat dan memperbarui:

- `public.projects`
- `public.project_images`
- foreign key `project_images.project_id → projects.id`
- grants untuk `anon` dan `authenticated`
- RLS policies untuk read public dan CRUD admin
- storage bucket metadata/policies untuk `project-images`

## 3. Storage Bucket: project-images

Bucket ini wajib ada agar upload gallery berjalan.

Langkah manual yang direkomendasikan:

1. Buka Supabase Dashboard.
2. Masuk ke **Storage**.
3. Klik **New bucket**.
4. Isi name:

```text
project-images
```

5. Aktifkan **Public bucket: ON**.
6. Klik **Create bucket**.

CMS menggunakan bucket ini untuk semua gambar project dengan path:

```text
{project_slug}/gallery/{safe_filename}
```

Contoh:

```text
klinik-kecantikan-cafe-trunojoyo/gallery/cafe-1-1-1700000000000.jpeg
```

## 4. Storage Policies

Jalankan SQL berikut bila upload masih ditolak oleh Supabase Storage:

```sql
insert into storage.buckets (id, name, public)
values ('project-images', 'project-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public read project images" on storage.objects;
create policy "Public read project images"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'project-images');

drop policy if exists "Authenticated upload project images" on storage.objects;
create policy "Authenticated upload project images"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'project-images');

drop policy if exists "Authenticated update project images" on storage.objects;
create policy "Authenticated update project images"
on storage.objects
for update
to authenticated
using (bucket_id = 'project-images')
with check (bucket_id = 'project-images');

drop policy if exists "Authenticated delete project images" on storage.objects;
create policy "Authenticated delete project images"
on storage.objects
for delete
to authenticated
using (bucket_id = 'project-images');
```

## 5. Buat User Admin

1. Buka Supabase → Authentication → Users.
2. Buat user dengan email:

```text
eryawanagungtrimuda@gmail.com
```

3. Set password yang aman.

Admin panel melakukan validasi email di aplikasi, sehingga hanya email ini yang diterima sebagai admin.

## 6. Deploy Ulang Vercel

Setelah env variables, schema, dan storage bucket siap:

1. Buka Vercel → Deployments.
2. Klik redeploy deployment terbaru, atau push commit baru ke branch `main`.

## 7. Troubleshooting

### Error: Bucket not found

Artinya bucket `project-images` belum ada atau belum terbaca oleh Supabase Storage.

Perbaikan:

1. Buat bucket manual lewat Storage Dashboard.
2. Pastikan namanya tepat: `project-images`.
3. Pastikan **Public bucket** aktif.
4. Jalankan ulang Storage Policies di atas.
5. Refresh halaman admin dan coba upload ulang.

### Error: relationship projects/project_images tidak ditemukan

Jalankan ulang bagian `project_images` di `supabase/schema.sql`, lalu tunggu schema cache Supabase refresh beberapa saat.

### Upload sebagian berhasil, sebagian gagal

CMS akan tetap menyimpan gambar yang berhasil, menampilkan pesan file yang gagal, dan menyediakan tombol **Coba Upload Lagi** untuk file yang belum berhasil.

## 8. Security Notes

- RLS aktif di table `projects` dan `project_images`.
- Public hanya memiliki akses read.
- Insert/update/delete hanya untuk authenticated user.
- Admin panel membatasi akses UI ke email `eryawanagungtrimuda@gmail.com`.
- Jangan expose service role key.
