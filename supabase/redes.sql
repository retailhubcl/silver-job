-- Cola de publicaciones de redes sociales (Silver Job). Ejecutar una vez en el SQL Editor de Supabase.
create table if not exists public.publicaciones (
  id uuid primary key default gen_random_uuid(),
  red text not null check (red in ('linkedin', 'instagram')),
  tema text not null default '',
  texto text not null,
  titular text not null default '',
  bajada text not null default '',
  estado text not null default 'borrador' check (estado in ('borrador', 'programado', 'publicando', 'publicado', 'error')),
  programada_para timestamptz,
  publicada_en timestamptz,
  id_externo text,
  error text,
  creada_en timestamptz not null default now()
);

create index if not exists publicaciones_cola on public.publicaciones (estado, programada_para);

-- Solo el servidor (clave service_role) accede a la tabla; sin políticas, anon y authenticated no ven nada.
alter table public.publicaciones enable row level security;
