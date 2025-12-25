-- Supabase Schema for Vapestore Digital Catalog & Multi-Branch Inventory
-- Safe to run in Supabase SQL Editor (Postgres 15)

begin;

-- Extensions
create extension if not exists pgcrypto with schema public;

-- ===============
-- Core Dimensions
-- ===============

create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  whatsapp_phone text not null,
  address text,
  city text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.branches is 'Physical store branches with WhatsApp contact per branch.';

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  parent_id uuid references public.categories(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.categories is 'Product taxonomy (optional hierarchy via parent_id).';

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  brand text,
  category_id uuid references public.categories(id) on delete set null,
  base_image_url text,
  is_active boolean not null default true,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.products is 'Product master (no stock here, variants live in product_skus).';

-- Variant option definitions per product (e.g., Flavor, Nicotine)
create table if not exists public.product_option_types (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  position int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(product_id, name)
);

create table if not exists public.product_option_values (
  id uuid primary key default gen_random_uuid(),
  option_type_id uuid not null references public.product_option_types(id) on delete cascade,
  value text not null,
  position int not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(option_type_id, value)
);

-- ===============
-- Variant SKUs
-- ===============
-- We encode variant selections as JSONB attributes for speed + flexibility.
-- Example: {"Flavor": "Mango", "Nicotine": "6mg"}
create table if not exists public.product_skus (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku_code text unique,
  attributes jsonb not null default '{}'::jsonb,
  price_idr integer not null check (price_idr >= 0),
  is_active boolean not null default true,
  barcode text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Prevent duplicate variant combos per product
  unique(product_id, attributes),
  -- Ensure attributes is a JSON object
  constraint product_skus_attributes_is_object check (jsonb_typeof(attributes) = 'object')
);
comment on column public.product_skus.attributes is 'Key-value of option type name to option value (e.g., {"Flavor":"Mango","Nicotine":"6mg"}).';

create index if not exists idx_product_skus_product on public.product_skus(product_id);
create index if not exists idx_product_skus_attributes_gin on public.product_skus using gin (attributes jsonb_path_ops);

-- ===============
-- Inventory per Branch
-- ===============
create table if not exists public.branch_stock (
  branch_id uuid not null references public.branches(id) on delete cascade,
  sku_id uuid not null references public.product_skus(id) on delete cascade,
  quantity integer not null default 0 check (quantity >= 0),
  low_stock_threshold integer not null default 2 check (low_stock_threshold >= 0),
  updated_at timestamptz not null default now(),
  primary key (branch_id, sku_id)
);
create index if not exists idx_branch_stock_sku on public.branch_stock(sku_id);

-- ===============
-- Staff & Roles
-- ===============
-- Link to Supabase auth.users
create table if not exists public.staff_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null check (role in ('admin', 'vaporista')),
  branch_id uuid references public.branches(id) on delete set null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ===============
-- Triggers
-- ===============
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Update timestamp triggers
create trigger trg_branches_updated_at before update on public.branches
for each row execute function public.set_updated_at();

create trigger trg_categories_updated_at before update on public.categories
for each row execute function public.set_updated_at();

create trigger trg_products_updated_at before update on public.products
for each row execute function public.set_updated_at();

create trigger trg_option_types_updated_at before update on public.product_option_types
for each row execute function public.set_updated_at();

create trigger trg_option_values_updated_at before update on public.product_option_values
for each row execute function public.set_updated_at();

create trigger trg_skus_updated_at before update on public.product_skus
for each row execute function public.set_updated_at();

create trigger trg_branch_stock_updated_at before update on public.branch_stock
for each row execute function public.set_updated_at();

create trigger trg_staff_profiles_updated_at before update on public.staff_profiles
for each row execute function public.set_updated_at();

-- ===============
-- Read-Optimized Views
-- ===============
create or replace view public.v_catalog_skus as
select
  s.id as sku_id,
  s.sku_code,
  s.attributes,
  s.price_idr,
  s.is_active as sku_active,
  p.id as product_id,
  p.slug as product_slug,
  p.name as product_name,
  p.brand,
  p.category_id,
  p.base_image_url,
  p.is_active as product_active
from public.product_skus s
join public.products p on p.id = s.product_id;

create or replace view public.v_branch_sku_availability as
select
  bs.branch_id,
  bs.sku_id,
  (bs.quantity > 0) as in_stock,
  bs.quantity,
  bs.updated_at
from public.branch_stock bs;

-- ===============
-- Row Level Security
-- ===============
alter table public.branches enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_option_types enable row level security;
alter table public.product_option_values enable row level security;
alter table public.product_skus enable row level security;
alter table public.branch_stock enable row level security;
alter table public.staff_profiles enable row level security;

-- Public readonly access to active catalog
create policy if not exists "public_read_active_branches" on public.branches
for select using (is_active = true);

create policy if not exists "public_read_categories" on public.categories
for select using (true);

create policy if not exists "public_read_active_products" on public.products
for select using (is_active = true);

create policy if not exists "public_read_active_skus" on public.product_skus
for select using (is_active = true);

create policy if not exists "public_read_branch_stock" on public.branch_stock
for select using (true);

create policy if not exists "public_read_option_types" on public.product_option_types
for select using (true);

create policy if not exists "public_read_option_values" on public.product_option_values
for select using (true);

-- Staff profile: users see their own profile; admins can manage all
create policy if not exists "user_read_own_profile" on public.staff_profiles
for select using (auth.uid() = user_id);

create policy if not exists "admin_manage_staff_profiles" on public.staff_profiles
for all using (
  exists (
    select 1 from public.staff_profiles sp
    where sp.user_id = auth.uid() and sp.role = 'admin' and sp.is_active = true
  )
) with check (
  exists (
    select 1 from public.staff_profiles sp
    where sp.user_id = auth.uid() and sp.role = 'admin' and sp.is_active = true
  )
);

-- Stock: vaporista/admin of the branch can insert/update their branch rows
create policy if not exists "staff_read_branch_stock_for_branch" on public.branch_stock
for select using (
  exists (
    select 1 from public.staff_profiles sp
    where sp.user_id = auth.uid() and sp.is_active = true and sp.role in ('admin','vaporista')
      and (sp.role = 'admin' or sp.branch_id = branch_id)
  )
);

create policy if not exists "staff_insert_stock_for_branch" on public.branch_stock
for insert with check (
  exists (
    select 1 from public.staff_profiles sp
    where sp.user_id = auth.uid() and sp.is_active = true and sp.role in ('admin','vaporista')
      and (sp.role = 'admin' or sp.branch_id = branch_id)
  )
);

create policy if not exists "staff_update_stock_for_branch" on public.branch_stock
for update using (
  exists (
    select 1 from public.staff_profiles sp
    where sp.user_id = auth.uid() and sp.is_active = true and sp.role in ('admin','vaporista')
      and (sp.role = 'admin' or sp.branch_id = branch_id)
  )
) with check (
  exists (
    select 1 from public.staff_profiles sp
    where sp.user_id = auth.uid() and sp.is_active = true and sp.role in ('admin','vaporista')
      and (sp.role = 'admin' or sp.branch_id = branch_id)
  )
);

-- Admin-only write access to catalog structures
create policy if not exists "admin_manage_products" on public.products
for all using (
  exists (select 1 from public.staff_profiles sp where sp.user_id = auth.uid() and sp.role = 'admin' and sp.is_active)
) with check (
  exists (select 1 from public.staff_profiles sp where sp.user_id = auth.uid() and sp.role = 'admin' and sp.is_active)
);

create policy if not exists "admin_manage_skus" on public.product_skus
for all using (
  exists (select 1 from public.staff_profiles sp where sp.user_id = auth.uid() and sp.role = 'admin' and sp.is_active)
) with check (
  exists (select 1 from public.staff_profiles sp where sp.user_id = auth.uid() and sp.role = 'admin' and sp.is_active)
);

create policy if not exists "admin_manage_branches" on public.branches
for all using (
  exists (select 1 from public.staff_profiles sp where sp.user_id = auth.uid() and sp.role = 'admin' and sp.is_active)
) with check (
  exists (select 1 from public.staff_profiles sp where sp.user_id = auth.uid() and sp.role = 'admin' and sp.is_active)
);

create policy if not exists "admin_manage_categories" on public.categories
for all using (
  exists (select 1 from public.staff_profiles sp where sp.user_id = auth.uid() and sp.role = 'admin' and sp.is_active)
) with check (
  exists (select 1 from public.staff_profiles sp where sp.user_id = auth.uid() and sp.role = 'admin' and sp.is_active)
);

create policy if not exists "admin_manage_option_types" on public.product_option_types
for all using (
  exists (select 1 from public.staff_profiles sp where sp.user_id = auth.uid() and sp.role = 'admin' and sp.is_active)
) with check (
  exists (select 1 from public.staff_profiles sp where sp.user_id = auth.uid() and sp.role = 'admin' and sp.is_active)
);

create policy if not exists "admin_manage_option_values" on public.product_option_values
for all using (
  exists (select 1 from public.staff_profiles sp where sp.user_id = auth.uid() and sp.role = 'admin' and sp.is_active)
) with check (
  exists (select 1 from public.staff_profiles sp where sp.user_id = auth.uid() and sp.role = 'admin' and sp.is_active)
);

-- ===============
-- Privileges (RLS still enforced)
-- ===============
-- Allow anon to select for public catalog browsing
grant usage on schema public to anon, authenticated;
grant select on public.branches, public.categories, public.products, public.product_option_types, public.product_option_values, public.product_skus, public.branch_stock to anon;

-- Authenticated users (staff) can select/insert/update where RLS permits
grant select, insert, update on public.branches, public.categories, public.products, public.product_option_types, public.product_option_values, public.product_skus, public.branch_stock, public.staff_profiles to authenticated;

commit;