-- Seed Data for Vapestore Testing
-- Run after 01_schema.sql

begin;

-- ===============
-- Categories
-- ===============
insert into public.categories (slug, name, parent_id) values
  ('liquid', 'Liquid', null),
  ('device', 'Device', null),
  ('pod', 'Pod', null),
  ('salt-nic', 'Salt Nic', 'liquid'),
  ('freebase', 'Freebase', 'liquid')
on conflict (slug) do nothing;

-- ===============
-- Branches
-- ===============
insert into public.branches (slug, name, whatsapp_phone, address, city, is_active) values
  ('jakarta-pusat', 'Vapestore Jakarta Pusat', '6281234567890', 'Jl. Sudirman No. 123', 'Jakarta', true),
  ('bandung-dago', 'Vapestore Bandung Dago', '6281234567891', 'Jl. Dago No. 45', 'Bandung', true)
on conflict (slug) do nothing;

-- ===============
-- Products
-- ===============
-- Get category IDs
do $$
declare
  cat_saltnic uuid;
  cat_freebase uuid;
  cat_device uuid;
  cat_pod uuid;
  
  prod_pod_salt uuid;
  prod_liquid_mango uuid;
  prod_liquid_berry uuid;
  prod_device_mod uuid;
  prod_pod_replacement uuid;
  
  branch_jkt uuid;
  branch_bdg uuid;
  
  opt_flavor uuid;
  opt_nic uuid;
  opt_color uuid;
  
  val_mango uuid;
  val_strawberry uuid;
  val_blueberry uuid;
  val_3mg uuid;
  val_6mg uuid;
  val_9mg uuid;
  val_black uuid;
  val_silver uuid;
  
  sku_id uuid;
begin
  -- Get category IDs
  select id into cat_saltnic from public.categories where slug = 'salt-nic';
  select id into cat_freebase from public.categories where slug = 'freebase';
  select id into cat_device from public.categories where slug = 'device';
  select id into cat_pod from public.categories where slug = 'pod';
  
  -- Get branch IDs
  select id into branch_jkt from public.branches where slug = 'jakarta-pusat';
  select id into branch_bdg from public.branches where slug = 'bandung-dago';
  
  -- Product 1: Pod Salt (simple, no variants)
  insert into public.products (slug, name, description, brand, category_id, is_active)
  values (
    'pod-salt-original',
    'Pod Salt Original',
    'Premium pod system dengan built-in coil',
    'Pod Brand',
    cat_pod,
    true
  )
  returning id into prod_pod_salt;
  
  insert into public.product_skus (product_id, sku_code, attributes, price_idr, is_active)
  values (prod_pod_salt, 'PODSALT-001', '{}'::jsonb, 150000, true)
  returning id into sku_id;
  
  insert into public.branch_stock (branch_id, sku_id, quantity, low_stock_threshold) values
    (branch_jkt, sku_id, 20, 5),
    (branch_bdg, sku_id, 15, 5);
  
  -- Product 2: Liquid Mango Sensation (with Flavor + Nicotine variants)
  insert into public.products (slug, name, description, brand, category_id, is_active)
  values (
    'liquid-mango-sensation',
    'Mango Sensation Liquid',
    'Liquid premium rasa buah tropis',
    'Tropical Vape Co',
    cat_saltnic,
    true
  )
  returning id into prod_liquid_mango;
  
  -- Option Type: Flavor
  insert into public.product_option_types (product_id, name, position)
  values (prod_liquid_mango, 'Flavor', 1)
  returning id into opt_flavor;
  
  insert into public.product_option_values (option_type_id, value, position) values
    (opt_flavor, 'Mango', 1) returning id into val_mango;
  insert into public.product_option_values (option_type_id, value, position) values
    (opt_flavor, 'Strawberry Mango', 2) returning id into val_strawberry;
  
  -- Option Type: Nicotine
  insert into public.product_option_types (product_id, name, position)
  values (prod_liquid_mango, 'Nicotine', 2)
  returning id into opt_nic;
  
  insert into public.product_option_values (option_type_id, value, position) values
    (opt_nic, '3mg', 1) returning id into val_3mg;
  insert into public.product_option_values (option_type_id, value, position) values
    (opt_nic, '6mg', 2) returning id into val_6mg;
  insert into public.product_option_values (option_type_id, value, position) values
    (opt_nic, '9mg', 3) returning id into val_9mg;
  
  -- Create SKUs (all combinations)
  insert into public.product_skus (product_id, sku_code, attributes, price_idr, is_active)
  values (prod_liquid_mango, 'MANGO-M-3', '{"Flavor":"Mango","Nicotine":"3mg"}'::jsonb, 80000, true)
  returning id into sku_id;
  insert into public.branch_stock (branch_id, sku_id, quantity, low_stock_threshold) values
    (branch_jkt, sku_id, 30, 5), (branch_bdg, sku_id, 0, 5);
  
  insert into public.product_skus (product_id, sku_code, attributes, price_idr, is_active)
  values (prod_liquid_mango, 'MANGO-M-6', '{"Flavor":"Mango","Nicotine":"6mg"}'::jsonb, 80000, true)
  returning id into sku_id;
  insert into public.branch_stock (branch_id, sku_id, quantity, low_stock_threshold) values
    (branch_jkt, sku_id, 25, 5), (branch_bdg, sku_id, 10, 5);
  
  insert into public.product_skus (product_id, sku_code, attributes, price_idr, is_active)
  values (prod_liquid_mango, 'MANGO-M-9', '{"Flavor":"Mango","Nicotine":"9mg"}'::jsonb, 80000, true)
  returning id into sku_id;
  insert into public.branch_stock (branch_id, sku_id, quantity, low_stock_threshold) values
    (branch_jkt, sku_id, 18, 5), (branch_bdg, sku_id, 22, 5);
  
  insert into public.product_skus (product_id, sku_code, attributes, price_idr, is_active)
  values (prod_liquid_mango, 'MANGO-SM-3', '{"Flavor":"Strawberry Mango","Nicotine":"3mg"}'::jsonb, 85000, true)
  returning id into sku_id;
  insert into public.branch_stock (branch_id, sku_id, quantity, low_stock_threshold) values
    (branch_jkt, sku_id, 12, 5), (branch_bdg, sku_id, 8, 5);
  
  insert into public.product_skus (product_id, sku_code, attributes, price_idr, is_active)
  values (prod_liquid_mango, 'MANGO-SM-6', '{"Flavor":"Strawberry Mango","Nicotine":"6mg"}'::jsonb, 85000, true)
  returning id into sku_id;
  insert into public.branch_stock (branch_id, sku_id, quantity, low_stock_threshold) values
    (branch_jkt, sku_id, 20, 5), (branch_bdg, sku_id, 15, 5);
  
  -- Product 3: Berry Blast Freebase
  insert into public.products (slug, name, description, brand, category_id, is_active)
  values (
    'liquid-berry-blast',
    'Berry Blast Freebase',
    'Perpaduan berry dengan sensasi dingin',
    'Freebase King',
    cat_freebase,
    true
  )
  returning id into prod_liquid_berry;
  
  insert into public.product_option_types (product_id, name, position)
  values (prod_liquid_berry, 'Nicotine', 1)
  returning id into opt_nic;
  
  insert into public.product_option_values (option_type_id, value, position) values
    (opt_nic, '3mg', 1), (opt_nic, '6mg', 2);
  
  insert into public.product_skus (product_id, sku_code, attributes, price_idr, is_active)
  values (prod_liquid_berry, 'BERRY-3', '{"Nicotine":"3mg"}'::jsonb, 75000, true)
  returning id into sku_id;
  insert into public.branch_stock (branch_id, sku_id, quantity, low_stock_threshold) values
    (branch_jkt, sku_id, 40, 5), (branch_bdg, sku_id, 35, 5);
  
  insert into public.product_skus (product_id, sku_code, attributes, price_idr, is_active)
  values (prod_liquid_berry, 'BERRY-6', '{"Nicotine":"6mg"}'::jsonb, 75000, true)
  returning id into sku_id;
  insert into public.branch_stock (branch_id, sku_id, quantity, low_stock_threshold) values
    (branch_jkt, sku_id, 30, 5), (branch_bdg, sku_id, 5, 5);
  
  -- Product 4: Mod Device
  insert into public.products (slug, name, description, brand, category_id, is_active)
  values (
    'device-pro-mod-x',
    'Pro Mod X Device',
    'High-end mod dengan wattage hingga 200W',
    'ModTech',
    cat_device,
    true
  )
  returning id into prod_device_mod;
  
  insert into public.product_option_types (product_id, name, position)
  values (prod_device_mod, 'Color', 1)
  returning id into opt_color;
  
  insert into public.product_option_values (option_type_id, value, position) values
    (opt_color, 'Black', 1) returning id into val_black;
  insert into public.product_option_values (option_type_id, value, position) values
    (opt_color, 'Silver', 2) returning id into val_silver;
  
  insert into public.product_skus (product_id, sku_code, attributes, price_idr, is_active)
  values (prod_device_mod, 'MODX-BLK', '{"Color":"Black"}'::jsonb, 650000, true)
  returning id into sku_id;
  insert into public.branch_stock (branch_id, sku_id, quantity, low_stock_threshold) values
    (branch_jkt, sku_id, 5, 2), (branch_bdg, sku_id, 3, 2);
  
  insert into public.product_skus (product_id, sku_code, attributes, price_idr, is_active)
  values (prod_device_mod, 'MODX-SLV', '{"Color":"Silver"}'::jsonb, 650000, true)
  returning id into sku_id;
  insert into public.branch_stock (branch_id, sku_id, quantity, low_stock_threshold) values
    (branch_jkt, sku_id, 4, 2), (branch_bdg, sku_id, 0, 2);
  
  -- Product 5: Replacement Pod
  insert into public.products (slug, name, description, brand, category_id, is_active)
  values (
    'pod-replacement-coil',
    'Universal Replacement Coil',
    'Coil replacement untuk berbagai jenis pod',
    'Pod Brand',
    cat_pod,
    true
  )
  returning id into prod_pod_replacement;
  
  insert into public.product_skus (product_id, sku_code, attributes, price_idr, is_active)
  values (prod_pod_replacement, 'POD-COIL-01', '{}'::jsonb, 45000, true)
  returning id into sku_id;
  insert into public.branch_stock (branch_id, sku_id, quantity, low_stock_threshold) values
    (branch_jkt, sku_id, 100, 10), (branch_bdg, sku_id, 80, 10);
  
end $$;

commit;
