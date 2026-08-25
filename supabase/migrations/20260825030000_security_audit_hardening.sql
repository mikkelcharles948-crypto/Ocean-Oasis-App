-- Fixes from the platform security audit (2026-08-24/25). Each item is
-- additive/narrowing only — no existing legitimate write path is removed.

-- H-1: the broadcast-insert policy let ANY authenticated guest write a
-- notification with an arbitrary category (including 'Emergency') to any
-- staff role. Restrict to the exact categories the app's own client code
-- ever sends via notifyStaffRole(), and require a real signed-in caller.
drop policy if exists notifications_broadcast_insert on public.notifications;
create policy notifications_broadcast_insert_safe on public.notifications
for insert to authenticated
with check (
  auth.uid() is not null
  and recipient_user_id is null
  and recipient_role is not null
  and category in ('Requests', 'Activities', 'Feedback')
);

-- L-3: guests could rewrite the title/body of their own notifications, not
-- just mark them read. Narrow the grant to the one column that's meant to
-- be guest-writable, mirroring the pattern already used on profiles/guests.
revoke update on public.notifications from authenticated;
grant update (read) on public.notifications to authenticated;

-- M-1: find_guest_email_for_reservation is callable by anon with no
-- throttling, enabling brute-force enumeration of reservation numbers.
-- Add a simple per-minute attempt cap tracked in a small log table.
create table if not exists public.reservation_lookup_attempts (
  id bigint generated always as identity primary key,
  attempted_at timestamptz not null default now()
);
create index if not exists reservation_lookup_attempts_time_idx on public.reservation_lookup_attempts(attempted_at);

create or replace function public.find_guest_email_for_reservation(p_reservation_number text, p_last_name text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  recent_attempts integer;
  found_email text;
begin
  delete from public.reservation_lookup_attempts where attempted_at < now() - interval '1 minute';

  select count(*) into recent_attempts from public.reservation_lookup_attempts;
  if recent_attempts > 30 then
    raise exception using errcode = '42901', message = 'Too many attempts. Please try again in a minute.';
  end if;

  insert into public.reservation_lookup_attempts default values;

  select g.email into found_email
  from public.reservations r
  join public.guests g on g.id = r.guest_id
  where r.reservation_number = p_reservation_number
    and lower(g.last_name) = lower(p_last_name)
    and g.email is not null
  limit 1;

  return found_email;
end;
$$;

revoke all on function public.find_guest_email_for_reservation(text, text) from public;
grant execute on function public.find_guest_email_for_reservation(text, text) to anon, authenticated;

-- L-1: several operational columns accepted any text with no server-side
-- validation, relying entirely on client-side enum discipline.
alter table public.rooms add constraint rooms_status_check
  check (status in ('VACANT_CLEAN', 'VACANT_DIRTY', 'OCCUPIED_CLEAN', 'OCCUPIED_SERVICE_REQUIRED', 'INSPECTION_REQUIRED', 'OUT_OF_ORDER'))
  not valid;
alter table public.rooms validate constraint rooms_status_check;

alter table public.maintenance_issues add constraint maintenance_issues_status_check
  check (status in ('OPEN', 'IN_PROGRESS', 'RESOLVED'))
  not valid;
alter table public.maintenance_issues validate constraint maintenance_issues_status_check;

alter table public.maintenance_issues add constraint maintenance_issues_severity_check
  check (severity in ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
  not valid;
alter table public.maintenance_issues validate constraint maintenance_issues_severity_check;

alter table public.service_requests add constraint service_requests_priority_check
  check (priority in ('NORMAL', 'HIGH', 'URGENT'))
  not valid;
alter table public.service_requests validate constraint service_requests_priority_check;

-- L-2: feedback's "resolved" flag (whether a low rating alerts management)
-- was computed client-side and trusted at insert time. Recompute it
-- server-side from the same threshold the app already uses, so a tampered
-- client can no longer suppress a low-rating alert.
create or replace function public.compute_feedback_resolved()
returns trigger
language plpgsql
as $$
begin
  new.resolved := new.overall > 3;
  return new;
end;
$$;

drop trigger if exists feedback_compute_resolved on public.feedback;
create trigger feedback_compute_resolved
before insert on public.feedback
for each row execute function public.compute_feedback_resolved();

-- I-1: broadcast_emergency_alert had no cooldown — a compromised or
-- careless staff account could spam broadcasts to every guest and staff
-- member with no limit.
create table if not exists public.emergency_broadcast_log (
  id bigint generated always as identity primary key,
  actor_id uuid not null,
  sent_at timestamptz not null default now()
);

create or replace function public.broadcast_emergency_alert(p_title text, p_body text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_count integer := 0;
  guest_row record;
  last_sent timestamptz;
begin
  if not public.is_staff() then
    raise exception using errcode = '42501', message = 'Only staff can send emergency broadcasts';
  end if;

  select max(sent_at) into last_sent from public.emergency_broadcast_log where actor_id = auth.uid();
  if last_sent is not null and last_sent > now() - interval '5 minutes' then
    raise exception using errcode = '42901', message = 'Please wait a few minutes before sending another broadcast.';
  end if;

  for guest_row in
    select distinct g.auth_user_id
    from public.guests g
    join public.reservations r on r.guest_id = g.id
    where g.auth_user_id is not null
      and r.status in ('confirmed', 'checked_in')
  loop
    insert into public.notifications (id, recipient_user_id, category, title, body)
    values (
      'em_' || substr(md5(random()::text || guest_row.auth_user_id::text), 1, 20),
      guest_row.auth_user_id,
      'Emergency',
      p_title,
      p_body
    );
    inserted_count := inserted_count + 1;
  end loop;

  insert into public.notifications (id, recipient_role, category, title, body)
  select 'em_staff_' || substr(md5(random()::text || role::text), 1, 16), role, 'Emergency', p_title, p_body
  from unnest(enum_range(null::public.app_role)) as role;

  insert into public.emergency_broadcast_log (actor_id) values (auth.uid());

  return inserted_count;
end;
$$;

revoke all on function public.broadcast_emergency_alert(text, text) from public;
grant execute on function public.broadcast_emergency_alert(text, text) to authenticated;
