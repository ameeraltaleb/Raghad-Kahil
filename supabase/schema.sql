-- =====================================================================
-- Raghad Kahil – Supabase schema
-- Run this whole file once in: Supabase Dashboard → SQL Editor → New query
-- =====================================================================

-- ---------- 1. Admins (only users listed here can manage the site) ----------
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins
  for select using (user_id = auth.uid());

-- ---------- 2. Site settings (single JSON document) ----------
create table if not exists public.site_settings (
  id text primary key default 'main',
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;

drop policy if exists "settings public read" on public.site_settings;
create policy "settings public read" on public.site_settings
  for select using (true);

drop policy if exists "settings admin write" on public.site_settings;
create policy "settings admin write" on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

insert into public.site_settings (id, data) values ('main', '{}'::jsonb)
  on conflict (id) do nothing;

-- ---------- 3. Orders ----------
create table if not exists public.orders (
  id text primary key,
  created_at timestamptz not null default now(),
  status text not null default 'new' check (status in ('new','contacted','shipped','completed','cancelled')),
  quantity int not null default 1 check (quantity between 1 and 100),
  bundle_title text,
  price text,
  final_total numeric,
  currency text,
  customer_name text not null check (char_length(customer_name) between 2 and 120),
  phone text check (char_length(phone) <= 40),
  country text check (char_length(country) <= 120),
  city text check (char_length(city) <= 120),
  address text check (char_length(address) <= 500),
  notes text check (char_length(notes) <= 1000),
  payment_method text,
  has_free_gift boolean default false,
  lang text,
  whatsapp_message text check (char_length(whatsapp_message) <= 5000),
  admin_note text
);

alter table public.orders enable row level security;

drop policy if exists "orders public insert" on public.orders;
create policy "orders public insert" on public.orders
  for insert with check (status = 'new' and admin_note is null);

drop policy if exists "orders admin all" on public.orders;
create policy "orders admin all" on public.orders
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- 4. Reviews ----------
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  name text not null check (char_length(name) between 2 and 80),
  location text check (char_length(location) <= 80),
  rating int not null default 5 check (rating between 1 and 5),
  text text not null check (char_length(text) between 3 and 1500),
  recommended boolean default true,
  lang text
);

alter table public.reviews enable row level security;

drop policy if exists "reviews public read approved" on public.reviews;
create policy "reviews public read approved" on public.reviews
  for select using (status = 'approved' or public.is_admin());

drop policy if exists "reviews public insert pending" on public.reviews;
create policy "reviews public insert pending" on public.reviews
  for insert with check (status = 'pending');

drop policy if exists "reviews admin update" on public.reviews;
create policy "reviews admin update" on public.reviews
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "reviews admin delete" on public.reviews;
create policy "reviews admin delete" on public.reviews
  for delete using (public.is_admin());

drop policy if exists "reviews admin insert any" on public.reviews;
create policy "reviews admin insert any" on public.reviews
  for insert with check (public.is_admin());

-- ---------- 5. Media storage bucket (images / video) ----------
insert into storage.buckets (id, name, public)
  values ('site-media', 'site-media', true)
  on conflict (id) do nothing;

drop policy if exists "media public read" on storage.objects;
create policy "media public read" on storage.objects
  for select using (bucket_id = 'site-media');

drop policy if exists "media admin write" on storage.objects;
create policy "media admin write" on storage.objects
  for insert with check (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "media admin update" on storage.objects;
create policy "media admin update" on storage.objects
  for update using (bucket_id = 'site-media' and public.is_admin());

drop policy if exists "media admin delete" on storage.objects;
create policy "media admin delete" on storage.objects
  for delete using (bucket_id = 'site-media' and public.is_admin());

-- =====================================================================
-- AFTER creating your admin user (Authentication → Users → Add user),
-- run this line with your email to grant admin rights:
--
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'YOUR_EMAIL@example.com';
-- =====================================================================
