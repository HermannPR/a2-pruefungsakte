create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  skills jsonb not null default '{}'::jsonb,
  completed_units text[] not null default '{}',
  streak integer not null default 0 check (streak >= 0),
  total_sessions integer not null default 0 check (total_sessions >= 0),
  last_study_date timestamptz,
  activity jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

create table public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  scores jsonb not null,
  passed boolean not null,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.user_progress enable row level security;
alter table public.exam_attempts enable row level security;

create policy "Users read own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

create policy "Users update own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Users read own progress"
on public.user_progress for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users insert own progress"
on public.user_progress for insert to authenticated
with check ((select auth.uid()) = user_id);

create policy "Users update own progress"
on public.user_progress for update to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users read own exam attempts"
on public.exam_attempts for select to authenticated
using ((select auth.uid()) = user_id);

create policy "Users insert own exam attempts"
on public.exam_attempts for insert to authenticated
with check ((select auth.uid()) = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)));

  insert into public.user_progress (user_id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create index exam_attempts_user_created_idx
on public.exam_attempts (user_id, created_at desc);
