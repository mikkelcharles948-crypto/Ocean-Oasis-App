create extension if not exists pgcrypto;

create type public.app_role as enum (
  'SUPER_ADMIN', 'GENERAL_MANAGER', 'MANAGEMENT', 'FRONT_DESK', 'CONCIERGE',
  'HOUSEKEEPING', 'MAINTENANCE', 'FOOD_AND_BEVERAGE', 'ACTIVITIES_MANAGER', 'MARKETING'
);
create type public.reservation_status as enum ('confirmed', 'checked_in', 'checked_out', 'cancelled');
create type public.request_status as enum ('Received', 'Assigned', 'In Progress', 'Completed', 'Cancelled');
create type public.content_status as enum ('DRAFT', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text not null default '',
  last_name text not null default '',
  phone text,
  role public.app_role not null default 'FRONT_DESK',
  department text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.rooms (
  id text primary key,
  number text not null unique,
  type text not null,
  floor integer,
  bed_config text,
  max_occupancy integer not null default 2 check (max_occupancy > 0),
  amenities jsonb not null default '[]'::jsonb,
  status text not null default 'VACANT_CLEAN',
  created_at timestamptz not null default now()
);

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique references auth.users(id) on delete set null,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  loyalty_tier text,
  language text default 'English',
  interests jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.reservations (
  id text primary key,
  reservation_number text not null unique,
  guest_id uuid not null references public.guests(id) on delete cascade,
  room_id text references public.rooms(id) on delete set null,
  check_in date not null,
  check_out date not null check (check_out > check_in),
  nights integer not null check (nights > 0),
  adults integer not null default 1 check (adults > 0),
  children integer not null default 0 check (children >= 0),
  status public.reservation_status not null default 'confirmed',
  arrival_time text,
  airport_transfer boolean not null default false,
  special_requests text,
  created_at timestamptz not null default now()
);

create table public.activities (
  id text primary key,
  name text not null,
  category text not null,
  short_description text,
  description text,
  activity_date date,
  activity_time text,
  duration text,
  price_value numeric(10,2) not null default 0 check (price_value >= 0),
  price text,
  capacity integer not null default 1 check (capacity > 0),
  availability text not null default 'Available',
  location text,
  meeting_point text,
  what_to_bring jsonb not null default '[]'::jsonb,
  cancellation_policy text,
  image text,
  status public.content_status not null default 'PUBLISHED',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activity_bookings (
  id text primary key,
  activity_id text not null references public.activities(id) on delete cascade,
  guest_id uuid not null references public.guests(id) on delete cascade,
  guests integer not null check (guests > 0),
  amount numeric(10,2) not null default 0 check (amount >= 0),
  status text not null default 'CONFIRMED',
  created_at timestamptz not null default now()
);

create table public.events (
  id text primary key,
  title text not null,
  category text,
  event_date date,
  event_time text,
  location text,
  description text,
  icon text,
  capacity integer check (capacity is null or capacity > 0),
  status public.content_status not null default 'DRAFT',
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.promotions (
  id text primary key,
  title text not null,
  description text,
  validity text,
  terms text,
  image text,
  status public.content_status not null default 'DRAFT',
  target_audience text,
  impressions integer not null default 0 check (impressions >= 0),
  clicks integer not null default 0 check (clicks >= 0),
  bookings integer not null default 0 check (bookings >= 0),
  redemptions integer not null default 0 check (redemptions >= 0),
  revenue numeric(12,2) not null default 0 check (revenue >= 0),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.service_requests (
  id text primary key,
  guest_id uuid not null references public.guests(id) on delete cascade,
  room_number text,
  category text not null,
  description text,
  preferred_time text,
  department text,
  priority text not null default 'NORMAL',
  status public.request_status not null default 'Received',
  assigned_staff_id uuid references public.profiles(id) on delete set null,
  notes jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.maintenance_issues (
  id text primary key,
  room_number text,
  category text not null,
  severity text not null default 'MEDIUM',
  description text,
  status text not null default 'OPEN',
  assigned_staff_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create table public.feedback (
  id text primary key,
  guest_id uuid not null references public.guests(id) on delete cascade,
  overall integer not null check (overall between 1 and 5),
  ratings jsonb not null default '{}'::jsonb,
  comments text,
  resolved boolean not null default false,
  resolution_note text,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id text primary key,
  recipient_user_id uuid references auth.users(id) on delete cascade,
  recipient_role public.app_role,
  category text not null,
  title text not null,
  body text,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.content_items (
  id text primary key,
  type text not null,
  title text not null,
  description text,
  status public.content_status not null default 'DRAFT',
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  actor_name text,
  actor_role public.app_role,
  action text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index reservations_guest_id_idx on public.reservations(guest_id);
create index activity_bookings_activity_id_idx on public.activity_bookings(activity_id);
create index activity_bookings_guest_id_idx on public.activity_bookings(guest_id);
create index service_requests_guest_id_idx on public.service_requests(guest_id);
create index service_requests_status_idx on public.service_requests(status);
create index notifications_recipient_idx on public.notifications(recipient_user_id, read);

create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_app_role() is not null;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.guests enable row level security;
alter table public.reservations enable row level security;
alter table public.rooms enable row level security;
alter table public.activities enable row level security;
alter table public.activity_bookings enable row level security;
alter table public.events enable row level security;
alter table public.promotions enable row level security;
alter table public.service_requests enable row level security;
alter table public.maintenance_issues enable row level security;
alter table public.feedback enable row level security;
alter table public.notifications enable row level security;
alter table public.content_items enable row level security;
alter table public.audit_log enable row level security;

create policy profiles_self_or_staff on public.profiles for select using (id = auth.uid() or public.is_staff());
create policy profiles_self_update on public.profiles for update using (id = auth.uid());
create policy guests_self_or_staff on public.guests for select using (auth_user_id = auth.uid() or public.is_staff());
create policy guests_self_update on public.guests for update using (auth_user_id = auth.uid());
create policy reservations_self_or_staff on public.reservations for select using (guest_id in (select id from public.guests where auth_user_id = auth.uid()) or public.is_staff());
create policy rooms_authenticated_read on public.rooms for select to authenticated using (true);
create policy activities_authenticated_read on public.activities for select to authenticated using (status = 'PUBLISHED' or public.is_staff());
create policy activities_staff_write on public.activities for all using (public.is_staff()) with check (public.is_staff());
create policy activity_bookings_self_or_staff on public.activity_bookings for select using (guest_id in (select id from public.guests where auth_user_id = auth.uid()) or public.is_staff());
create policy activity_bookings_guest_insert on public.activity_bookings for insert with check (guest_id in (select id from public.guests where auth_user_id = auth.uid()));
create policy events_authenticated_read on public.events for select to authenticated using (status = 'PUBLISHED' or public.is_staff());
create policy events_staff_write on public.events for all using (public.is_staff()) with check (public.is_staff());
create policy promotions_authenticated_read on public.promotions for select to authenticated using (status = 'PUBLISHED' or public.is_staff());
create policy promotions_staff_write on public.promotions for all using (public.is_staff()) with check (public.is_staff());
create policy requests_self_or_staff on public.service_requests for select using (guest_id in (select id from public.guests where auth_user_id = auth.uid()) or public.is_staff());
create policy requests_guest_insert on public.service_requests for insert with check (guest_id in (select id from public.guests where auth_user_id = auth.uid()));
create policy requests_staff_update on public.service_requests for update using (public.is_staff()) with check (public.is_staff());
create policy maintenance_staff_only on public.maintenance_issues for all using (public.is_staff()) with check (public.is_staff());
create policy feedback_self_or_staff on public.feedback for select using (guest_id in (select id from public.guests where auth_user_id = auth.uid()) or public.is_staff());
create policy feedback_guest_insert on public.feedback for insert with check (guest_id in (select id from public.guests where auth_user_id = auth.uid()));
create policy feedback_staff_update on public.feedback for update using (public.is_staff()) with check (public.is_staff());
create policy notifications_recipient_or_staff on public.notifications for select using (recipient_user_id = auth.uid() or public.is_staff());
create policy notifications_recipient_update on public.notifications for update using (recipient_user_id = auth.uid());
create policy content_staff_only on public.content_items for all using (public.is_staff()) with check (public.is_staff());
create policy audit_staff_read on public.audit_log for select using (public.is_staff());
create policy audit_staff_insert on public.audit_log for insert with check (public.is_staff());

alter publication supabase_realtime add table public.service_requests;
alter publication supabase_realtime add table public.activity_bookings;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.rooms;
alter publication supabase_realtime add table public.maintenance_issues;
