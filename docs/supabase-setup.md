# Supabase Setup — Eryawan Studio Portfolio CMS

Panduan ini menyiapkan backend untuk admin panel portfolio Eryawan Studio.

## 1. Buat Project Supabase

1. Buka Supabase Dashboard.
2. Buat project baru.
3. Simpan nilai berikut dari Project Settings > API:
   - Project URL
   - anon public key

## 2. Tambahkan Environment Variables di Vercel

Masuk ke Vercel Project > Settings > Environment Variables, lalu tambahkan:

```env
NEXT_PUBLIC_SUPABASE_URL=isi_project_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=isi_anon_public_key_supabase
NEXT_PUBLIC_ADMIN_EMAIL=eryawanagungtrimuda@gmail.com
NEXT_PUBLIC_SITE_URL=https://eryawan-portfolio.vercel.app
```

Jangan tambahkan Supabase service role key ke frontend atau Vercel public env.

## 3. Jalankan SQL Schema

1. Buka Supabase SQL Editor.
2. Copy isi file `supabase/schema.sql`.
3. Jalankan SQL tersebut.

Schema akan membuat:
- `profiles`
- `projects`
- `project_images`
- `admin_invites`
- RLS policies
- Storage bucket `project-images`

## 4. Buat User Admin

1. Buka Supabase > Authentication > Users.
2. Buat user dengan email:

```txt
eryawanagungtrimuda@gmail.com
```

3. Set password yang aman.

## 5. Grant Admin Profile

Setelah user dibuat, buka SQL Editor dan jalankan:

```sql
insert into public.profiles (id, email, full_name, role)
select id, email, 'Eryawan Agung Trimuda', 'admin'
from auth.users
where email = 'eryawanagungtrimuda@gmail.com'
on conflict (id) do update set email = excluded.email, role = 'admin';
```

## 6. Deploy Ulang Vercel

Setelah env variables ditambahkan:

1. Buka Vercel > Deployments.
2. Klik redeploy deployment terbaru, atau push commit baru ke `main`.

## 7. Cara Pakai Admin Panel

Admin routes:

- `/admin/login`
- `/admin/dashboard`
- `/admin/projects`
- `/admin/projects/new`
- `/admin/projects/[id]/edit`

Workflow:

1. Login di `/admin/login`.
2. Masuk ke `/admin/projects/new`.
3. Isi data project.
4. Simpan sebagai draft.
5. Setelah project tersimpan, buka halaman edit untuk upload gambar.
6. Set cover image.
7. Ubah status menjadi `published` agar muncul di public website.
8. Set `featured` jika ingin project diprioritaskan di homepage.

## 8. Public Website Integration

Halaman public:

- `/karya` menampilkan semua published projects.
- `/karya/[slug]` menampilkan detail case study lengkap.
- Homepage portfolio akan mengambil data dari `/api/projects` dan tetap punya fallback jika Supabase belum dikonfigurasi.

## 9. Security Notes

- RLS aktif di semua table.
- Public hanya bisa membaca project dengan status `published`.
- Admin CRUD hanya bisa dilakukan jika user login dan email cocok dengan `eryawanagungtrimuda@gmail.com`.
- Upload gambar dibatasi ke admin melalui policy Storage.
- Service role key tidak digunakan di frontend.
