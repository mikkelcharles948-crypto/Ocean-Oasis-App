-- Lets a guest complete digital check-in from the app. Reservations has no
-- general guest UPDATE policy (guests shouldn't be able to edit dates, room,
-- etc.), so this is a narrow, security-definer RPC: it only ever flips a
-- reservation from 'confirmed' to 'checked_in', and only for the calling
-- guest's own reservation.
create or replace function public.complete_guest_checkin(p_reservation_id text)
returns public.reservations
language plpgsql
security definer
set search_path = public
as $$
declare
  updated public.reservations;
begin
  update public.reservations r
  set status = 'checked_in'
  where r.id = p_reservation_id
    and r.status = 'confirmed'
    and r.guest_id in (select g.id from public.guests g where g.auth_user_id = auth.uid())
  returning * into updated;

  if updated is null then
    raise exception 'Reservation not found or not eligible for check-in';
  end if;

  return updated;
end;
$$;

revoke all on function public.complete_guest_checkin(text) from public;
grant execute on function public.complete_guest_checkin(text) to authenticated;
