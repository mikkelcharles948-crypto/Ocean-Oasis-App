-- Destinations and dining venues live only in the app's bundled mockData.js
-- (never had a DB table of their own), so unlike activities/events/
-- promotions there's no existing column staff could ever update. This
-- table is a real, minimal place for those photos to live going forward —
-- guests read it (falling back to the bundled default if a slot has no
-- override yet), staff/management write it. slot_key is a stable id like
-- "destination:d_1" or "dining:v_1", matching the ids already in mockData.js.
create table public.photo_overrides (
  slot_key text primary key,
  category text not null,
  label text not null,
  image_url text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

alter table public.photo_overrides enable row level security;

create policy photo_overrides_read on public.photo_overrides
for select to authenticated using (true);

create policy photo_overrides_staff_write on public.photo_overrides
for all using (public.is_staff()) with check (public.is_staff());

create trigger photo_overrides_touch_updated_at
before update on public.photo_overrides
for each row execute function public.touch_updated_at();
