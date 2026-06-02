alter table public.transactions enable row level security;

drop policy if exists "Allow anon read transactions" on public.transactions;
drop policy if exists "Allow anon create transactions" on public.transactions;
drop policy if exists "Allow anon update transactions" on public.transactions;
drop policy if exists "Allow anon delete transactions" on public.transactions;

create policy "Allow anon read transactions"
on public.transactions
for select
to anon
using (true);

create policy "Allow anon create transactions"
on public.transactions
for insert
to anon
with check (true);

create policy "Allow anon update transactions"
on public.transactions
for update
to anon
using (true)
with check (true);

create policy "Allow anon delete transactions"
on public.transactions
for delete
to anon
using (true);
