# Studio Bella's SaaS

Sistema completo de agendamento para salões de beleza com arquitetura Serverless (Supabase).

## Configuração do Supabase

1. Crie um projeto em [supabase.com](https://supabase.com).
2. Vá em **SQL Editor** e rode o seguinte script para criar as tabelas:

```sql
-- Configuração da Loja
create table store_config (
  id int primary key default 1,
  data jsonb
);

insert into store_config (id, data) values (1, '{
  "name": "Studio Bella",
  "planActive": true,
  "colors": {"primary": "#D946EF", "background": "#ffffff", "card": "#f9fafb", "text": "#111827", "secondary": "#db2777", "price": "#eab308", "buttonText": "#ffffff"},
  "contact": {},
  "hours": {"workDays": [1,2,3,4,5,6], "open": "09:00", "close": "19:00"}
}'::jsonb);

-- Serviços
create table services (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  duration int not null,
  price numeric not null,
  description text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Profissionais
create table professionals (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  specialty text,
  photo_url text,
  description text,
  services text[], -- Array de IDs dos serviços
  work_days int[],
  work_hours_start text,
  work_hours_end text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Agendamentos
create table appointments (
  id uuid default gen_random_uuid() primary key,
  client_name text,
  client_phone text,
  client_id text,
  professional_id uuid references professionals(id),
  service_id uuid references services(id),
  date text, -- YYYY-MM-DD (Local)
  time text, -- HH:mm (Local)
  timestamp_utc timestamptz, -- Para validação
  status text default 'confirmed',
  created_at timestamptz default now()
);

-- Storage Buckets
insert into storage.buckets (id, name, public) values ('images', 'images', true);
insert into storage.buckets (id, name, public) values ('profiles', 'profiles', true);
insert into storage.buckets (id, name, public) values ('logos', 'logos', true);

-- Políticas de Segurança (RLS) - Simplificado para Demo (Permite tudo)
alter table services enable row level security;
create policy "Public Access" on services for all using (true);

alter table professionals enable row level security;
create policy "Public Access" on professionals for all using (true);

alter table appointments enable row level security;
create policy "Public Access" on appointments for all using (true);

alter table store_config enable row level security;
create policy "Public Access" on store_config for all using (true);

create policy "Storage Access" on storage.objects for all using (true);
```

3. Vá em **Project Settings > API** e copie:
   - Project URL
   - `anon` public key

4. Crie um arquivo `.env` na raiz do projeto:
```env
VITE_SUPABASE_URL=sua_url_aqui
VITE_SUPABASE_ANON_KEY=sua_key_aqui
```

## Como Rodar

1. Instale as dependências:
```bash
npm install
```

2. Rode o servidor local:
```bash
npm run dev
```

## Deploy

Este projeto está pronto para Vercel.
1. Suba para o GitHub.
2. Importe na Vercel.
3. Adicione as variáveis de ambiente (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) no painel da Vercel.
