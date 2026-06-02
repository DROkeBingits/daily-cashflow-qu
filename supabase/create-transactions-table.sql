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
