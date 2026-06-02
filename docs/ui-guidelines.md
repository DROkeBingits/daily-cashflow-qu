# UI Guidelines

## Design Principle

Daily Cashflow harus terasa seperti aplikasi SaaS modern tahun 2026.

Prinsip utama:

* Simple
* Modern
* Fast
* Mobile First
* Clean Financial UI
* Accessible
* Minimal Cognitive Load

Visual Style:

* Soft UI
* Modern SaaS
* Subtle Glass Effect
* Large Border Radius
* Smooth Animations
* Spacious Layout

---

# Layout

## Mobile Layout

```text
Header

Balance Card

Income & Expense Cards

Quick Add Transaction Button

Transaction Form

Filter Section

Transaction List

Bottom Safe Area
```

---

## Desktop Layout

```text
Top Navigation

Dashboard Summary

Income Card
Expense Card
Balance Card

Transaction Form

Transaction List
```

---

# Color System (2026)

## Light Mode

Background

```css
#F8FAFC
```

Surface

```css
#FFFFFF
```

Card

```css
#FFFFFF
```

Border

```css
#E2E8F0
```

Primary

```css
#4F46E5
```

Primary Hover

```css
#4338CA
```

Success

```css
#10B981
```

Danger

```css
#EF4444
```

Warning

```css
#F59E0B
```

Text Primary

```css
#0F172A
```

Text Secondary

```css
#64748B
```

---

## Dark Mode

Background

```css
#020617
```

Surface

```css
#0F172A
```

Card

```css
#111827
```

Border

```css
#1E293B
```

Primary

```css
#6366F1
```

Success

```css
#34D399
```

Danger

```css
#F87171
```

Warning

```css
#FBBF24
```

Text Primary

```css
#F8FAFC
```

Text Secondary

```css
#94A3B8
```

---

# Typography

Font Family

```css
Inter, sans-serif
```

Fallback

```css
system-ui, sans-serif
```

---

## Typography Scale

Heading 1

```css
text-3xl font-bold
```

Heading 2

```css
text-2xl font-semibold
```

Heading 3

```css
text-xl font-semibold
```

Body

```css
text-sm
```

Small Label

```css
text-xs
```

---

# Border Radius

Small

```css
rounded-xl
```

Medium

```css
rounded-2xl
```

Large

```css
rounded-3xl
```

Default Card Radius

```css
rounded-2xl
```

---

# Shadow System

Card

```css
shadow-sm
```

Hover Card

```css
shadow-md
```

Floating Action

```css
shadow-lg
```

Jangan menggunakan shadow yang terlalu berat.

---

# Dark Mode

Wajib tersedia.

Requirements:

* Toggle Theme
* Simpan preferensi user di localStorage
* Default mengikuti system preference

Theme States:

```javascript
light
dark
system
```

---

# Responsive Rules

Mobile First

Breakpoints

```css
sm
md
lg
xl
2xl
```

Target minimum width:

```css
320px
```

---

# Components

## Header

Menampilkan:

* Logo
* Nama Aplikasi
* Theme Toggle

---

## Dashboard Summary Card

Menampilkan:

* Label
* Nominal
* Trend Indicator

Contoh:

```text
Total Income
↑ +12%
```

---

## Balance Card

Komponen utama dashboard.

Menampilkan:

* Current Balance
* Income
* Expense

Harus menjadi fokus pertama saat aplikasi dibuka.

---

## Quick Add Button

Floating Action Button

Posisi:

```css
bottom-6 right-6
```

Fungsi:

* Tambah transaksi cepat

---

## Transaction Form

Field:

* Date
* Type
* Category
* Amount
* Note

Validation realtime.

---

## Transaction List

Menampilkan:

* Date
* Category
* Amount
* Transaction Type
* Action

Action:

* Edit
* Delete

---

## Filter Bar

Menampilkan:

* Date Filter
* Month Filter
* Search Input

---

# Toast Notification

Gunakan toast modern.

Posisi:

```css
top-right
```

Jenis:

Success

```text
Transaksi berhasil disimpan
```

Error

```text
Gagal menyimpan transaksi
```

Delete

```text
Transaksi berhasil dihapus
```

Duration:

```javascript
3000ms
```

---

# Modal Dialog

Digunakan untuk:

* Konfirmasi Hapus
* Edit Transaksi

Harus memiliki:

* Backdrop Blur
* Close Button
* ESC Support

---

# Loading States

Gunakan Skeleton Loader.

Jangan gunakan spinner sebagai loading utama.

Contoh:

```text
▭▭▭▭▭▭
▭▭▭▭▭▭
▭▭▭▭▭▭
```

---

# Empty State

Tampilkan icon.

Text:

```text
Belum ada transaksi
```

Subtext:

```text
Tambahkan transaksi pertama Anda
```

---

# Error State

Text:

```text
Terjadi kesalahan saat memuat data
```

Action:

```text
Coba Lagi
```

---

# Animation Guidelines

Gunakan transisi ringan.

Durasi:

```css
150ms - 300ms
```

Animasi:

* Fade In
* Scale In
* Slide Up

Hindari animasi berlebihan.

---

# Accessibility

Wajib:

* Keyboard Navigation
* Focus State
* Contrast Ratio WCAG AA
* Touch Target Minimum 44px
* ARIA Label pada tombol icon

---

# UI Rules

* Gunakan TailwindCSS Utility Classes
* Hindari inline style
* Konsisten spacing
* Mobile First
* Dark Mode First Class Citizen
* Semua feedback menggunakan Toast
* Semua loading menggunakan Skeleton
* Semua destructive action menggunakan Confirmation Modal
