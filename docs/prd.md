# Daily Cashflow - Product Requirements Document

## Role

Anda adalah Senior Frontend Developer dan Product Engineer yang bertugas membangun aplikasi Cashflow Harian sederhana menggunakan HTML, TailwindCSS, JavaScript, dan Supabase.

---

## Task

Membangun aplikasi web untuk mencatat pemasukan dan pengeluaran harian dengan antarmuka yang sederhana dan mudah digunakan.

Fitur utama:

* Dashboard saldo
* Tambah transaksi
* Edit transaksi
* Hapus transaksi
* Riwayat transaksi
* Filter transaksi

---

## Context

Target pengguna:

* Freelancer
* UMKM
* Pelajar
* Individu

Permasalahan:

Pengguna membutuhkan aplikasi pencatatan keuangan yang sederhana tanpa proses setup yang rumit.

---

## Format

Saat menghasilkan kode:

1. Buat struktur folder terlebih dahulu
2. Buat file satu per satu
3. Berikan kode lengkap
4. Jelaskan fungsi file
5. Pastikan aplikasi dapat dijalankan

---

## Tone

* Professional
* Practical
* Beginner Friendly
* Step-by-step

---

## Constraints

Wajib:

* HTML5
* TailwindCSS
* Vanilla JavaScript
* Supabase

Tidak boleh:

* React
* Vue
* Next.js
* Backend custom

---

## Acceptance Criteria

* CRUD transaksi berfungsi
* Data tersimpan di Supabase
* Dashboard menghitung saldo otomatis
* Responsive mobile dan desktop
* Deploy ke Vercel berhasil

---

## User Flow

Tambah Transaksi

Dashboard
→ Tambah Transaksi
→ Isi Form
→ Simpan
→ Data tersimpan

Edit Transaksi

Dashboard
→ Pilih Transaksi
→ Edit
→ Simpan

Hapus Transaksi

Dashboard
→ Pilih Transaksi
→ Hapus
→ Konfirmasi

---

## Database Schema

Menggunakan tabel:

* transactions

---

## Feature Scope

MVP:

* Dashboard
* CRUD transaksi
* Filter transaksi
* Summary saldo

Out of Scope:

* Login
* Multi User
* Export PDF
* Grafik
* Budget Planner