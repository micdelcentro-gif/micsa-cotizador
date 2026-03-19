-- ============================================================
--  MICSA DOCS — Supabase Schema
--  Ejecutar en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- 1. PERFILES (extiende auth.users)
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  nombre      text not null,
  rol         text not null default 'supervisor'
                check (rol in ('admin','gerente','supervisor','contabilidad','rh')),
  activo      boolean default true,
  created_at  timestamptz default now()
);

-- Auto-crear perfil al registrar usuario
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, nombre, rol)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre', new.email), 'supervisor');
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. CLIENTES (catálogo reutilizable)
create table if not exists public.clientes (
  id          uuid default gen_random_uuid() primary key,
  nombre      text not null,
  planta      text,
  direccion   text,
  contacto    text,
  correo      text,
  telefono    text,
  created_by  uuid references public.profiles(id),
  created_at  timestamptz default now()
);

-- 3. DOCUMENTOS
create table if not exists public.documentos (
  id              uuid default gen_random_uuid() primary key,
  tipo            text not null,
  folio           text,
  cliente_nombre  text,
  cliente_id      uuid references public.clientes(id),
  datos           jsonb not null default '{}',
  estado          text default 'borrador'
                    check (estado in ('borrador','enviado','aprobado','cancelado')),
  created_by      uuid references public.profiles(id),
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Auto-update updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;
drop trigger if exists set_documentos_updated_at on public.documentos;
create trigger set_documentos_updated_at
  before update on public.documentos
  for each row execute procedure public.set_updated_at();

-- 4. FOTOS
create table if not exists public.fotos (
  id              uuid default gen_random_uuid() primary key,
  documento_id    uuid references public.documentos(id) on delete cascade,
  storage_path    text not null,
  public_url      text,
  nombre          text,
  orden           int default 0,
  created_at      timestamptz default now()
);

-- ============================================================
--  RLS (Row Level Security)
-- ============================================================
alter table public.profiles  enable row level security;
alter table public.clientes  enable row level security;
alter table public.documentos enable row level security;
alter table public.fotos     enable row level security;

-- Profiles
create policy "profiles_select_all"   on public.profiles for select using (auth.uid() is not null);
create policy "profiles_update_own"   on public.profiles for update using (auth.uid() = id);

-- Clientes — cualquier usuario autenticado puede CRUD
create policy "clientes_select" on public.clientes for select using (auth.uid() is not null);
create policy "clientes_insert" on public.clientes for insert with check (auth.uid() is not null);
create policy "clientes_update" on public.clientes for update using (auth.uid() is not null);
create policy "clientes_delete" on public.clientes for delete using (auth.uid() is not null);

-- Documentos
create policy "documentos_select" on public.documentos for select using (auth.uid() is not null);
create policy "documentos_insert" on public.documentos for insert with check (auth.uid() is not null);
create policy "documentos_update" on public.documentos for update using (auth.uid() is not null);
create policy "documentos_delete" on public.documentos for delete using (
  auth.uid() = created_by
);

-- Fotos
create policy "fotos_select" on public.fotos for select using (auth.uid() is not null);
create policy "fotos_insert" on public.fotos for insert with check (auth.uid() is not null);
create policy "fotos_delete" on public.fotos for delete using (auth.uid() is not null);

-- ============================================================
--  STORAGE BUCKET
--  Ejecutar en Supabase Dashboard > Storage > New bucket
--  Nombre: fotos-documentos | Public: true
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('fotos-documentos', 'fotos-documentos', true);
-- create policy "fotos_storage_select" on storage.objects for select using (bucket_id = 'fotos-documentos');
-- create policy "fotos_storage_insert" on storage.objects for insert with check (bucket_id = 'fotos-documentos' and auth.uid() is not null);
-- create policy "fotos_storage_delete" on storage.objects for delete using (bucket_id = 'fotos-documentos' and auth.uid() is not null);
