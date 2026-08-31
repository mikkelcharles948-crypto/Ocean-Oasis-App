-- The audit trigger set actor_id and actor_role but never actor_name (the
-- column the app's UI actually renders), and its `action` text was a bare
-- "update service_requests" with no indication of what changed — both
-- confirmed live: every trigger-generated row has actor_name = null.
-- Rebuilt to look up the acting profile's name and, for the two columns
-- that matter most to a reader (service_requests.status/assigned_staff_id,
-- rooms.status), record the actual before/after in metadata so the app can
-- render a real sentence instead of a raw table/operation name.
create or replace function public.write_audit_entry()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_first text;
  actor_last text;
  actor_display_name text;
  changed jsonb := '{}'::jsonb;
begin
  select first_name, last_name into actor_first, actor_last from public.profiles where id = auth.uid();
  actor_display_name := case when actor_first is not null then trim(actor_first || ' ' || coalesce(actor_last, '')) else null end;

  if TG_TABLE_NAME = 'service_requests' and TG_OP = 'UPDATE' then
    if old.status is distinct from new.status then
      changed := changed || jsonb_build_object('status_from', old.status, 'status_to', new.status, 'category', new.category, 'room_number', new.room_number);
    end if;
    if old.assigned_staff_id is distinct from new.assigned_staff_id and new.assigned_staff_id is not null then
      changed := changed || jsonb_build_object('assigned_staff_id', new.assigned_staff_id, 'category', new.category, 'room_number', new.room_number);
    end if;
  elsif TG_TABLE_NAME = 'service_requests' and TG_OP = 'INSERT' then
    changed := jsonb_build_object('category', new.category, 'room_number', new.room_number);
  elsif TG_TABLE_NAME = 'rooms' and TG_OP = 'UPDATE' and old.status is distinct from new.status then
    changed := jsonb_build_object('room_number', new.number, 'status_from', old.status, 'status_to', new.status);
  elsif TG_TABLE_NAME = 'activity_bookings' and TG_OP = 'INSERT' then
    changed := jsonb_build_object('activity_id', new.activity_id, 'guests', new.guests);
  end if;

  insert into public.audit_log (actor_id, actor_name, actor_role, action, metadata)
  values (
    auth.uid(),
    actor_display_name,
    public.current_app_role(),
    lower(TG_OP) || ' ' || TG_TABLE_NAME,
    jsonb_build_object('entity_id', coalesce((to_jsonb(new) ->> 'id'), (to_jsonb(old) ->> 'id'))) || changed
  );
  return coalesce(new, old);
end;
$$;

-- content_items had a status-changing UI (ManagementContentScreen) but no
-- way to ever create a row — the table was permanently empty. Adds one.
create or replace function public.create_content_item(
  p_type text,
  p_title text,
  p_description text
)
returns public.content_items
language plpgsql
security definer
set search_path = public
as $$
declare
  new_row public.content_items;
  new_id text;
begin
  if not public.is_staff() then
    raise exception 'Staff access required';
  end if;
  new_id := 'content_' || substr(gen_random_uuid()::text, 1, 8);
  insert into public.content_items (id, type, title, description, status)
  values (new_id, p_type, p_title, p_description, 'DRAFT')
  returning * into new_row;
  return new_row;
end;
$$;
