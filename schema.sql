-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create Users Table
create table public.users (
  id uuid default uuid_generate_v4() primary key,
  username text unique not null,
  partner_name text not null,
  pin text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create Valentine Config Table
create table public.valentine_config (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.users(id) on delete cascade not null,
  is_active boolean default false,
  days_content jsonb default '{}'::jsonb,
  confessions jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Disable RLS for simple functionality (or enable with proper policies if preferred)
-- For this quick-start, we will disable to avoid permission issues, 
-- but in production, you should enable RLS and add policies.
alter table public.users disable row level security;
alter table public.valentine_config disable row level security;
