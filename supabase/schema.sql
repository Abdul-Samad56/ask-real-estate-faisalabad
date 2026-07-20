-- ASK REAL ESTATE — Supabase SQL (SQL Editor میں چلائیں)

-- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  email text,
  avatar_url text,
  provider text,
  role text not null default 'user' check (role in ('user', 'admin', 'dealer')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- owner property submissions
create table if not exists public.owner_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  purpose text not null,
  type text not null,
  area text,
  city text default 'فیصل آباد',
  price numeric,
  size text,
  beds int default 0,
  baths int default 0,
  floors int default 0,
  title text,
  address text,
  description text,
  owner_name text,
  owner_phone text,
  owner_email text,
  image_urls text[] default '{}',
  status text not null default 'pending'
    check (status in ('pending', 'reviewed', 'converted', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.owner_submissions enable row level security;

-- profiles RLS
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

create policy "profiles_select_admin" on public.profiles
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'dealer')
    )
  );

-- submissions RLS
create policy "submissions_insert_own" on public.owner_submissions
  for insert with check (auth.uid() = user_id);

create policy "submissions_select_own" on public.owner_submissions
  for select using (auth.uid() = user_id);

create policy "submissions_select_admin" on public.owner_submissions
  for select using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'dealer')
    )
  );

create policy "submissions_delete_admin" on public.owner_submissions
  for delete using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'dealer')
    )
  );

create policy "submissions_delete_own" on public.owner_submissions
  for delete using (auth.uid() = user_id);

create policy "submissions_update_admin" on public.owner_submissions
  for update using (
    exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role in ('admin', 'dealer')
    )
  );

-- نیا user → profile
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  admin_emails text[] := array['abdulsamadkhattak5@gmail.com'];
  user_role text := 'user';
begin
  if new.email = any(admin_emails) then
    user_role := 'admin';
  end if;

  insert into public.profiles (id, full_name, email, avatar_url, provider, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', ''),
    coalesce(new.raw_app_meta_data->>'provider', 'email'),
    user_role
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Storage bucket (Dashboard → Storage میں بھی بنا سکتے ہیں)
insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

create policy "property_images_public_read" on storage.objects
  for select using (bucket_id = 'property-images');

create policy "property_images_auth_upload" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "property_images_auth_update" on storage.objects
  for update to authenticated
  using (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "property_images_auth_delete" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'property-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
