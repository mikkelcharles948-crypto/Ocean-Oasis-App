create policy rooms_staff_write on public.rooms
for update using (public.is_staff()) with check (public.is_staff());

create policy notifications_broadcast_insert on public.notifications
for insert with check (recipient_user_id is null and recipient_role is not null);

create policy notifications_staff_update on public.notifications
for update using (public.is_staff()) with check (public.is_staff());
