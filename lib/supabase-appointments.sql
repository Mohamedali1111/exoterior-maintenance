-- Run this in Supabase SQL Editor to create the appointments table.
-- Then set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  time_slot text not null,
  full_name text not null,
  phone text not null,
  governorate text not null,
  address_line text not null default '',
  sub_services jsonb not null default '[]',
  notes text,
  created_at timestamptz not null default now(),
  unique(date, time_slot)
);

-- API uses SUPABASE_SERVICE_ROLE_KEY, which bypasses RLS. No extra policy needed.
