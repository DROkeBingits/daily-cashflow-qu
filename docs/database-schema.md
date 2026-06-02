# Database Schema

## Database

Supabase PostgreSQL

---

## Table: transactions

```sql
create table transactions (
  id uuid primary key default gen_random_uuid(),

  date date not null,

  type text not null
  check (type in ('income', 'expense')),

  category text not null,

  amount numeric not null
  check (amount > 0),

  note text,

  created_at timestamp with time zone default now()
);
```

---

## Field Definitions

| Field      | Type      | Description        |
| ---------- | --------- | ------------------ |
| id         | UUID      | Primary Key        |
| date       | DATE      | Tanggal transaksi  |
| type       | TEXT      | income / expense   |
| category   | TEXT      | Kategori transaksi |
| amount     | NUMERIC   | Nominal transaksi  |
| note       | TEXT      | Catatan transaksi  |
| created_at | TIMESTAMP | Waktu dibuat       |

---

## Default Categories

Income:

* Gaji
* Bonus
* Penjualan
* Lainnya

Expense:

* Makan
* Transportasi
* Belanja
* Tagihan
* Lainnya

---

## Environment Variables

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```