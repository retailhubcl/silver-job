-- Silver Job: lista de espera y pagos en Supabase.
-- Seguridad: RLS activado SIN políticas => ni la clave publicable (anon) ni usuarios
-- autenticados pueden leer ni escribir. Solo el servidor, con la clave secreta
-- (SUPABASE_SECRET_KEY, que se salta RLS), accede a estas tablas.

create table if not exists public.lista_espera (
  id uuid primary key default gen_random_uuid(),
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  tipo text not null check (tipo in ('pyme', 'ejecutivo')),
  nombre text not null check (char_length(nombre) between 1 and 120),
  correo text not null check (char_length(correo) between 3 and 254 and correo = lower(correo)),
  empresa text check (char_length(empresa) <= 160),
  area text not null check (char_length(area) <= 40),
  horas text check (char_length(horas) <= 40),
  linkedin text check (char_length(linkedin) <= 200),
  anios text check (char_length(anios) <= 40),
  consentimiento boolean not null check (consentimiento),
  consentimiento_version text not null,
  unique (tipo, correo)
);

create table if not exists public.pagos (
  payment_id bigint primary key,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  referencia text,
  estado text not null,
  detalle text,
  monto numeric(14, 0) not null,
  monto_esperado numeric(14, 0),
  monto_coincide boolean,
  moneda text,
  tipo text,
  correo text,
  empresa text,
  metadata jsonb not null default '{}'::jsonb
);

alter table public.lista_espera enable row level security;
alter table public.pagos enable row level security;
alter table public.lista_espera force row level security;
alter table public.pagos force row level security;

revoke all on public.lista_espera from anon, authenticated;
revoke all on public.pagos from anon, authenticated;

create or replace function public.tocar_actualizado_en() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.actualizado_en = now();
  return new;
end $$;

create trigger lista_espera_actualizado before update on public.lista_espera
  for each row execute function public.tocar_actualizado_en();
create trigger pagos_actualizado before update on public.pagos
  for each row execute function public.tocar_actualizado_en();

-- Retención: borra inscritos de la lista de espera con más de N meses (por defecto 12).
-- Programar con pg_cron o ejecutar a mano cada trimestre. Los pagos no se purgan aquí
-- porque hay obligaciones tributarias de conservación (consultar al contador).
create or replace function public.purgar_lista_espera(meses integer default 12) returns integer
language plpgsql security definer set search_path = '' as $$
declare borrados integer;
begin
  delete from public.lista_espera where creado_en < now() - make_interval(months => meses);
  get diagnostics borrados = row_count;
  return borrados;
end $$;
revoke all on function public.purgar_lista_espera(integer) from public, anon, authenticated;
