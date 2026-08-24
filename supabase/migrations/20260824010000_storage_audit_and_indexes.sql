create index if not exists service_requests_assignee_idx on public.service_requests(assigned_staff_id, status);
create index if not exists activity_bookings_created_at_idx on public.activity_bookings(created_at desc);
create index if not exists feedback_created_at_idx on public.feedback(created_at desc);
create index if not exists audit_log_created_at_idx on public.audit_log(created_at desc);
create index if not exists guests_auth_user_id_idx on public.guests(auth_user_id);
create index if not exists reservations_active_guest_idx on public.reservations(guest_id, status, check_out);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('activity-media', 'activity-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('promotion-media', 'promotion-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('private-guest-uploads', 'private-guest-uploads', false, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
on conflict (id) do update set
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy activity_media_read on storage.objects
for select using (bucket_id = 'activity-media');
create policy promotion_media_read on storage.objects
for select using (bucket_id = 'promotion-media');
create policy staff_activity_media_write on storage.objects
for insert with check (bucket_id = 'activity-media' and public.is_staff());
create policy staff_promotion_media_write on storage.objects
for insert with check (bucket_id = 'promotion-media' and public.is_staff());
create policy private_guest_upload_read on storage.objects
for select using (
  bucket_id = 'private-guest-uploads'
  and (owner_id = auth.uid()::text or public.is_staff())
);
create policy private_guest_upload_insert on storage.objects
for insert with check (
  bucket_id = 'private-guest-uploads'
  and (owner_id = auth.uid()::text or public.is_staff())
);
create policy private_guest_upload_delete on storage.objects
for delete using (bucket_id = 'private-guest-uploads' and (owner_id = auth.uid()::text or public.is_staff()));

create or replace function public.write_audit_entry()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.audit_log (actor_id, actor_role, action, metadata)
  values (
    auth.uid(),
    public.current_app_role(),
    lower(TG_OP) || ' ' || TG_TABLE_NAME,
    jsonb_build_object('entity_id', coalesce((to_jsonb(new) ->> 'id'), (to_jsonb(old) ->> 'id')))
  );
  return coalesce(new, old);
end;
$$;

drop trigger if exists service_requests_audit on public.service_requests;
create trigger service_requests_audit
after insert or update or delete on public.service_requests
for each row execute function public.write_audit_entry();

drop trigger if exists activity_bookings_audit on public.activity_bookings;
create trigger activity_bookings_audit
after insert or update or delete on public.activity_bookings
for each row execute function public.write_audit_entry();

drop trigger if exists rooms_audit on public.rooms;
create trigger rooms_audit
after update on public.rooms
for each row execute function public.write_audit_entry();
