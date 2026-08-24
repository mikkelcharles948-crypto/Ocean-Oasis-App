-- Lets a guest who is already staying with us (but hasn't signed in on this
-- device) look up the email on file for their reservation by reservation
-- number + last name, so the app can send them a real magic-link sign-in
-- instead of the old no-op mock "Access My Stay" flow. Runs as the function
-- owner so it can read across guests/reservations despite RLS, but only
-- ever returns a single email for an exact reservation-number + last-name
-- match — it exposes no other guest data.
create or replace function public.find_guest_email_for_reservation(p_reservation_number text, p_last_name text)
returns text
language sql
security definer
set search_path = public
stable
as $$
  select g.email
  from public.reservations r
  join public.guests g on g.id = r.guest_id
  where r.reservation_number = p_reservation_number
    and lower(g.last_name) = lower(p_last_name)
    and g.email is not null
  limit 1;
$$;

revoke all on function public.find_guest_email_for_reservation(text, text) from public;
grant execute on function public.find_guest_email_for_reservation(text, text) to anon, authenticated;
