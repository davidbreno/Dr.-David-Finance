create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  type text not null check (type in ('entrada', 'saida')),
  amount numeric(14,2) not null default 0,
  description text not null,
  category text,
  date date not null,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.accounts_payable (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  amount numeric(14,2) not null default 0,
  status text not null default 'pendente' check (status in ('pendente', 'pago', 'em_atraso')),
  due_date date not null,
  notes text,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.transactions enable row level security;
alter table public.accounts_payable enable row level security;

create policy "Usuario le apenas suas transacoes"
  on public.transactions
  for select using (auth.uid() = user_id);

create policy "Usuario insere suas transacoes"
  on public.transactions
  for insert with check (auth.uid() = user_id);

create policy "Usuario atualiza suas transacoes"
  on public.transactions
  for update using (auth.uid() = user_id);

create policy "Usuario remove suas transacoes"
  on public.transactions
  for delete using (auth.uid() = user_id);

create policy "Usuario le apenas suas contas"
  on public.accounts_payable
  for select using (auth.uid() = user_id);

create policy "Usuario insere suas contas"
  on public.accounts_payable
  for insert with check (auth.uid() = user_id);

create policy "Usuario atualiza suas contas"
  on public.accounts_payable
  for update using (auth.uid() = user_id);

create policy "Usuario remove suas contas"
  on public.accounts_payable
  for delete using (auth.uid() = user_id);

create index if not exists idx_transactions_user_date
  on public.transactions (user_id, date desc);

create index if not exists idx_accounts_payable_user_due
  on public.accounts_payable (user_id, due_date desc);
