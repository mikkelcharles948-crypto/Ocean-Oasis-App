alter table public.activities add column if not exists image_url text;
alter table public.events add column if not exists image_url text;
alter table public.promotions add column if not exists image_url text;
