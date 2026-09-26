-- ============================================================
-- 温州县域公交信息平台 · Supabase Schema
-- Project: iaocxpqpbyztiqpcomiv
-- 用途: 数据库结构快照 / 灾难恢复 / 新环境部署
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- 1. 表结构
-- ============================================================

create table if not exists public.bus_routes (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  area       text        not null,
  desc       text,
  pov        text,
  route      text,
  created_at timestamptz default now()
);

create table if not exists public.station_list (
  id         uuid        primary key default gen_random_uuid(),
  name       text        not null,
  routes     jsonb       not null,
  created_at timestamptz default now()
);

create table if not exists public.profiles (
  id         uuid        primary key,
  email      text,
  role       text        default 'user',
  created_at timestamptz default now(),
  nickname   text,
  avatar_url text
);

create table if not exists public.feedback (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null,
  title      text        not null,
  content    text        not null,
  status     text        not null default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.feedback_comment (
  id          uuid        primary key default gen_random_uuid(),
  feedback_id uuid        not null,
  admin_id    uuid        not null,
  comment     text        not null,
  created_at  timestamptz default now()
);

-- ============================================================
-- 2. 函数
-- ============================================================

create or replace function public.is_admin()
returns boolean language sql security definer stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, nickname, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nickname', split_part(new.email, '@', 1)),
    'user'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create or replace function public.prevent_role_escalation()
returns trigger language plpgsql security definer
set search_path = public
as $$
begin
  if new.id is distinct from old.id then
    raise exception 'id 字段不可修改';
  end if;
  if new.role is distinct from old.role then
    if current_user not in ('postgres', 'supabase_admin', 'service_role') then
      raise exception '角色字段不可由前端修改';
    end if;
  end if;
  return new;
end;
$$;

-- ============================================================
-- 3. 触发器
-- ============================================================

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

drop trigger if exists trg_prevent_role_escalation on public.profiles;
create trigger trg_prevent_role_escalation
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

-- ============================================================
-- 4. RLS
-- ============================================================

alter table public.bus_routes       enable row level security;
alter table public.station_list     enable row level security;
alter table public.profiles         enable row level security;
alter table public.feedback         enable row level security;
alter table public.feedback_comment enable row level security;

-- bus_routes
drop policy if exists public_select_bus_routes on public.bus_routes;
create policy public_select_bus_routes on public.bus_routes
  for select to anon, authenticated using (true);

drop policy if exists admin_manage_bus_routes on public.bus_routes;
create policy admin_manage_bus_routes on public.bus_routes
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- station_list
drop policy if exists public_select_station_list on public.station_list;
create policy public_select_station_list on public.station_list
  for select to anon, authenticated using (true);

drop policy if exists admin_manage_station_list on public.station_list;
create policy admin_manage_station_list on public.station_list
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- profiles
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert to authenticated with check (auth.uid() = id);

drop policy if exists profiles_select_self on public.profiles;
create policy profiles_select_self on public.profiles
  for select to authenticated
  using ((auth.uid() = id) or public.is_admin());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- feedback
drop policy if exists user_select_own_feedback on public.feedback;
create policy user_select_own_feedback on public.feedback
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists user_insert_own_feedback on public.feedback;
create policy user_insert_own_feedback on public.feedback
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists admin_all_feedback on public.feedback;
create policy admin_all_feedback on public.feedback
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- feedback_comment
drop policy if exists user_select_feedback_comment on public.feedback_comment;
create policy user_select_feedback_comment on public.feedback_comment
  for select to authenticated
  using (exists (
    select 1 from public.feedback f
    where f.id = feedback_comment.feedback_id and f.user_id = auth.uid()
  ));

drop policy if exists admin_manage_comment on public.feedback_comment;
create policy admin_manage_comment on public.feedback_comment
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- 5. Storage（bucket 需在 Dashboard 手动创建）
--    bucket: avatars-public / public / 2MB / jpg,png,webp
-- ============================================================

drop policy if exists users_upload_own_avatar on storage.objects;
create policy users_upload_own_avatar on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'avatars-public'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists users_update_own_avatar on storage.objects;
create policy users_update_own_avatar on storage.objects
  for update to authenticated
  using (
    bucket_id = 'avatars-public'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists users_delete_own_avatar on storage.objects;
create policy users_delete_own_avatar on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'avatars-public'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- 6. 数据修复（历史遗留回填）
-- ============================================================

insert into public.profiles (id, email, role)
select u.id, u.email, 'user'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;

-- ============================================================
-- 7. 手动执行：设置管理员
-- ============================================================
-- update public.profiles set role = 'admin' where email = 'you@example.com';