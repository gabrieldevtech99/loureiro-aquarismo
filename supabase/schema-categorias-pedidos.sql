-- ============================================================
-- Loureiro Aquarismo — Categorias + Pedidos
-- Rode este script no Supabase (SQL Editor) UMA ÚNICA VEZ.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- TABELA: categorias
-- ─────────────────────────────────────────────────────────────
create table if not exists public.categorias (
  id            uuid primary key default gen_random_uuid(),
  slug          text unique not null,
  nome          text not null,
  icone         text default '📦',
  imagem_url    text,
  ordem         int default 0,
  ativo         boolean default true,
  data_cadastro timestamptz default now()
);

-- Garante que todas as colunas existam mesmo se a tabela já tinha sido
-- criada antes com um schema mais antigo (evita "column does not exist")
alter table public.categorias add column if not exists icone         text default '📦';
alter table public.categorias add column if not exists imagem_url    text;
alter table public.categorias add column if not exists ordem         int default 0;
alter table public.categorias add column if not exists ativo         boolean default true;
alter table public.categorias add column if not exists data_cadastro timestamptz default now();

create index if not exists idx_categorias_slug  on public.categorias (slug);
create index if not exists idx_categorias_ativo on public.categorias (ativo);

alter table public.categorias enable row level security;

-- Leitura pública (todos podem ler categorias ativas)
drop policy if exists "categorias_select_publico" on public.categorias;
create policy "categorias_select_publico" on public.categorias
  for select using (true);

-- Escrita pública (painel admin usa anon key — mesma abordagem da tabela produtos)
drop policy if exists "categorias_insert_publico" on public.categorias;
create policy "categorias_insert_publico" on public.categorias
  for insert with check (true);

drop policy if exists "categorias_update_publico" on public.categorias;
create policy "categorias_update_publico" on public.categorias
  for update using (true) with check (true);

drop policy if exists "categorias_delete_publico" on public.categorias;
create policy "categorias_delete_publico" on public.categorias
  for delete using (true);

-- Semear com as categorias atuais (só insere se slug ainda não existir)
insert into public.categorias (slug, nome, icone, ordem) values
  ('agua-doce',                'Peixes de Água Doce',        '🐠', 10),
  ('marinho',                  'Peixes e Corais Marinhos',   '🪸', 20),
  ('aquarios',                 'Aquários & Kits',            '🏠', 30),
  ('equipamentos',             'Equipamentos',               '⚙️', 40),
  ('racoes',                   'Rações Premium',             '🍖', 50),
  ('manutencao',               'Produtos de Manutenção',     '💧', 60),
  ('suplementos-marinho',      'Suplementos Marinho',        '🧂', 70),
  ('plantados',                'Aquários Plantados',         '🌿', 80),
  ('plantas',                  'Plantas Aquáticas',          '🌱', 90),
  ('midias-biologicas',        'Mídias Biológicas',          '🧫', 100),
  ('aceleradores-biologicos',  'Aceleradores Biológicos',    '🧪', 110)
on conflict (slug) do nothing;


-- ─────────────────────────────────────────────────────────────
-- TABELA: pedidos
-- ─────────────────────────────────────────────────────────────
create table if not exists public.pedidos (
  id              uuid primary key default gen_random_uuid(),
  order_nsu       text unique not null,

  -- dados do cliente
  cliente_nome     text not null,
  cliente_telefone text not null,
  cliente_email    text,

  -- detalhes do pedido
  itens            jsonb not null default '[]'::jsonb,
  total            numeric(10,2) not null default 0,
  entrega          text default 'retirada',
  pagamento        text default 'pix',
  observacoes      text,

  -- status e rastreio
  status          text not null default 'pendente',   -- pendente | pago | cancelado | entregue
  infinitepay     jsonb,                              -- resposta do gateway (quando disponível)
  transaction_nsu text,
  slug_pagamento  text,

  data_criacao    timestamptz default now(),
  data_atualizacao timestamptz default now()
);

-- Garante colunas caso tabela já existisse num schema anterior
alter table public.pedidos add column if not exists order_nsu        text;
alter table public.pedidos add column if not exists cliente_nome     text;
alter table public.pedidos add column if not exists cliente_telefone text;
alter table public.pedidos add column if not exists cliente_email    text;
alter table public.pedidos add column if not exists itens            jsonb default '[]'::jsonb;
alter table public.pedidos add column if not exists total            numeric(10,2) default 0;
alter table public.pedidos add column if not exists entrega          text default 'retirada';
alter table public.pedidos add column if not exists pagamento        text default 'pix';
alter table public.pedidos add column if not exists observacoes      text;
alter table public.pedidos add column if not exists status           text default 'pendente';
alter table public.pedidos add column if not exists infinitepay      jsonb;
alter table public.pedidos add column if not exists transaction_nsu  text;
alter table public.pedidos add column if not exists slug_pagamento   text;
alter table public.pedidos add column if not exists data_criacao     timestamptz default now();
alter table public.pedidos add column if not exists data_atualizacao timestamptz default now();

create index if not exists idx_pedidos_status       on public.pedidos (status);
create index if not exists idx_pedidos_data         on public.pedidos (data_criacao desc);
create index if not exists idx_pedidos_order_nsu    on public.pedidos (order_nsu);

alter table public.pedidos enable row level security;

-- Inserção pública (checkout precisa criar pedido com anon key)
drop policy if exists "pedidos_insert_publico" on public.pedidos;
create policy "pedidos_insert_publico" on public.pedidos
  for insert with check (true);

-- Atualização pública (necessária para marcar como 'pago' quando o usuário volta do InfinitePay)
drop policy if exists "pedidos_update_publico" on public.pedidos;
create policy "pedidos_update_publico" on public.pedidos
  for update using (true) with check (true);

-- Leitura pública (admin usa anon key — mesma abordagem)
drop policy if exists "pedidos_select_publico" on public.pedidos;
create policy "pedidos_select_publico" on public.pedidos
  for select using (true);

-- Delete pública (limpeza no admin, se precisar)
drop policy if exists "pedidos_delete_publico" on public.pedidos;
create policy "pedidos_delete_publico" on public.pedidos
  for delete using (true);

-- Trigger para manter data_atualizacao sempre atualizada
create or replace function public.pedidos_set_updated_at()
returns trigger language plpgsql as $$
begin
  new.data_atualizacao := now();
  return new;
end $$;

drop trigger if exists pedidos_updated_at on public.pedidos;
create trigger pedidos_updated_at
  before update on public.pedidos
  for each row execute function public.pedidos_set_updated_at();
