-- Seed enhancements for new columns (discount, featured)

begin;

-- Update some products with discount and featured flag
update public.products
set discount_percent = 10, is_featured = true
where slug = 'pod-salt-original';

update public.products
set discount_percent = 15, is_featured = true
where slug = 'liquid-mango-sensation';

update public.products
set discount_percent = 20
where slug in ('liquid-strawberry-ice', 'device-basic-vape-kit');

update public.products
set is_featured = true
where slug = 'liquid-grape-freeze';

commit;
