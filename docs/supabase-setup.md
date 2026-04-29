# Supabase Setup — Eryawan Studio Portfolio CMS

Panduan ini menyiapkan backend sederhana untuk admin panel portfolio Eryawan Studio.

## 1. Environment Variables di Vercel

Pastikan Vercel Project > Settings > Environment Variables memiliki:

```env
NEXT_PUBLIC_SUPABASE_URL=isi_project_url_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=isi_anon_public_key_supabase
NEXT_PUBLIC_ADMIN_EMAIL=eryawanagungtrimuda@gmail.com
NEXT_PUBLIC_SITE_URL=https://eryawan-portfolio.vercel.app
```

Jangan gunakan Supabase service role key di frontend atau public environment variable.

## 2. Jalankan SQL Schema

1. Buka Supabase Dashboard.
2. Masuk ke SQL Editor.
3. Copy isi file `supabase/schema.sql`.
4. Jalankan SQL tersebut.

Schema sekarang membuat table sederhana:

```txt
projects
- id uuid primary key
- title text
- slug text unique
- category text
- cover_image text
- problem text
- solution text
- impact text
- created_at timestamp
```

RLS aktif dengan policy:

- public bisa read project
- authenticated user bisa insert/update/delete project

## 3. Buat User Admin

1. Buka Supabase > Authentication > Users.
2. Buat user dengan email:

```txt
eryawanagungtrimuda@gmail.com
```

3. Set password yang aman.

Admin panel melakukan validasi email di aplikasi, sehingga hanya email ini yang diterima sebagai admin.

## 4. Deploy Ulang Vercel

Setelah env variables dan schema Supabase siap:

1. Buka Vercel > Deployments.
2. Klik redeploy deployment terbaru, atau push commit baru ke branch `main`.

## 5. Cara Pakai Admin Panel

Admin routes:

- `/admin/login`
- `/admin/dashboard`
- `/admin/projects`
- `/admin/projects/new`
- `/admin/projects/[id]/edit`

Workflow:

1. Login di `/admin/login` menggunakan email admin.
2. Masuk ke `/admin/projects/new`.
3. Isi data project:
   - title
   - slug
   - category
   - cover image URL
   - problem
   - solution
   - impact
4. Simpan project.
5. Project otomatis muncul di `/karya` dan dapat diklik ke `/karya/[slug]`.
6. Homepage portfolio juga mengambil data dari `/api/projects` dan punya fallback jika belum ada project.

## 6. Public Website Integration

Halaman public:

- `/karya` menampilkan semua projects dari Supabase.
- `/karya/[slug]` menampilkan detail project.
- Homepage portfolio hydrate data dari `/api/projects` tanpa merusak desain existing.

## 7. Security Notes

- RLS aktif di table `projects`.
- Public hanya memiliki akses read.
- Insert/update/delete hanya untuk authenticated user.
- Admin panel membatasi akses UI ke email `eryawanagungtrimuda@gmail.com`.
- Jangan expose service role key.
