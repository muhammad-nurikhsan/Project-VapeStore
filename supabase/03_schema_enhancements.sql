-- Supabase Schema Enhancements for Vapestore
-- Add discount, featured flag, and views for new arrivals/best deals

begin;

-- ===============
-- Add columns to products table
-- ===============
alter table public.products 
  add column if not exists discount_percent integer default 0 check (discount_percent >= 0 and discount_percent <= 100),
  add column if not exists is_featured boolean not null default false;

comment on column public.products.discount_percent is 'Discount percentage (0-100); applies to all SKUs of this product.';
comment on column public.products.is_featured is 'Flag for featured/promoted products on homepage.';

-- ===============
-- Views for catalog queries
-- ===============

-- v_new_arrivals: products ordered by created_at desc
create or replace view public.v_new_arrivals as
select
  p.id,
  p.slug,
  p.name,
  p.brand,
  p.base_image_url,
  p.category_id,
  p.discount_percent,
  p.is_featured,
  p.created_at,
  c.name as category_name,
  c.slug as category_slug
from public.products p
left join public.categories c on c.id = p.category_id
where p.is_active = true
order by p.created_at desc
limit 8;

-- v_best_deals: products with highest discount + good price
create or replace view public.v_best_deals as
select
  p.id,
  p.slug,
  p.name,
  p.brand,
  p.base_image_url,
  p.category_id,
  p.discount_percent,
  p.is_featured,
  p.created_at,
  c.name as category_name,
  c.slug as category_slug,
  (select min(price_idr) from public.product_skus s where s.product_id = p.id and s.is_active = true) as min_price
from public.products p
left join public.categories c on c.id = p.category_id
where p.is_active = true and p.discount_percent > 0
order by p.discount_percent desc, min_price asc
limit 8;

-- v_popular_categories: categories with product count
create or replace view public.v_popular_categories as
select
  c.id,
  c.slug,
  c.name,
  c.parent_id,
  count(p.id) as product_count
from public.categories c
left join public.products p on p.category_id = c.id and p.is_active = true
where c.parent_id is null
group by c.id, c.slug, c.name, c.parent_id
order by product_count desc;

-- v_all_brands: distinct active brands
create or replace view public.v_all_brands as
select distinct
  trim(p.brand) as brand
from public.products p
where p.is_active = true and p.brand is not null and trim(p.brand) != ''
order by brand;

-- v_featured_products: featured products for homepage banner
create or replace view public.v_featured_products as
select
  p.id,
  p.slug,
  p.name,
  p.brand,
  p.base_image_url,
  p.category_id,
  p.discount_percent,
  p.created_at,
  c.name as category_name,
  c.slug as category_slug
from public.products p
left join public.categories c on c.id = p.category_id
where p.is_active = true and p.is_featured = true
order by p.created_at desc
limit 3;

commit;
