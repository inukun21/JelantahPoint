# Panduan Setup Supabase (Sinkronisasi Data)

Untuk membuat data sinkron di semua perangkat, ikuti langkah-langkah berikut:

## 1. Buat Proyek Supabase
1. Pergi ke [supabase.com](https://supabase.com/) dan buat akun (gratis).
2. Buat proyek baru (*New Project*).
3. Setelah proyek siap, pergi ke **Project Settings** > **API**.
4. Salin **Project URL** dan **anon public** API key.
5. Buat file baru bernama `.env.local` di folder root proyek ini, dan tempelkan isinya:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=paste_url_disini
   NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_key_disini
   ```

## 2. Inisialisasi Database
Pergi ke menu **SQL Editor** di Dashboard Supabase, dan jalankan perintah SQL berikut untuk membuat tabel yang diperlukan:

```sql
-- Tabel Users
CREATE TABLE users (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  points INTEGER DEFAULT 0,
  role TEXT CHECK (role IN ('User', 'Admin')),
  password TEXT,
  image TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Products
CREATE TABLE products (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  description TEXT,
  points INTEGER DEFAULT 0,
  image TEXT,
  category TEXT,
  stock INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Drop Points
CREATE TABLE drop_points (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  name TEXT NOT NULL,
  address TEXT,
  distance TEXT,
  status TEXT,
  hours TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  phone TEXT,
  area TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabel Deposit Requests
CREATE TABLE deposit_requests (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id BIGINT REFERENCES users(id),
  user_name TEXT,
  user_email TEXT,
  amount DOUBLE PRECISION,
  points INTEGER,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'rejected')),
  date TEXT,
  location TEXT,
  method TEXT,
  address TEXT,
  contact TEXT,
  image TEXT,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tambahkan data awal untuk admin jika diperlukan
-- INSERT INTO users (name, email, points, role, password) 
-- VALUES ('Admin', 'admin@example.com', 0, 'Admin', 'password123');
```

## 3. Matikan RLS (Untuk Sementara)
Untuk memudahkan pengembangan awal, matikan **Row Level Security (RLS)** pada setiap tabel melalui menu **Database** > **Tables**, lalu nonaktifkan RLS pada masing-masing tabel agar aplikasi bisa menulis/membaca data tanpa otentikasi yang rumit dulu.

---
Setelah langkah di atas selesai, saya akan mengupdate kode `DataContext.tsx` untuk mulai mengirim data ke Supabase.
