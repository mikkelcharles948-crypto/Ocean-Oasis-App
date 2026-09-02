-- Phase 4: with a second real hotel now live, the guest booking flow needs
-- a real hotel picker (previously "if there's only one hotel, assume it" —
-- that fallback stops being safe once there's more than one). Guests need
-- to be able to browse active hotels to pick one before they have any
-- other relationship to it yet.
create policy hotels_browse_active on public.hotels
for select using (status = 'ACTIVE');

-- Platform admin needs a way to actually assign staff to a hotel (today
-- role/hotel assignment is manual SQL -- fine for one hotel, not once
-- there's a second real property to onboard). A thin RPC rather than a raw
-- table grant, so a platform admin can't be tricked into anything wider
-- than "set this profile's role/hotel", and every other profile column
-- (name, phone, avatar) stays owned by the profile itself.
create or replace function public.platform_assign_staff(p_profile_id uuid, p_role public.app_role, p_hotel_id uuid, p_department text default null)
returns public.profiles
language plpgsql security definer set search_path = public
as $$
declare
  updated public.profiles;
begin
  if not public.is_platform_admin() then
    raise exception using errcode = '42501', message = 'Platform admin access required';
  end if;
  if p_role = 'PLATFORM_ADMIN' and p_hotel_id is not null then
    raise exception using errcode = '22023', message = 'A platform admin cannot also be assigned to a hotel';
  end if;
  if p_role <> 'PLATFORM_ADMIN' and p_hotel_id is null then
    raise exception using errcode = '22023', message = 'A hotel role needs a hotel assigned';
  end if;

  update public.profiles
  set role = p_role, hotel_id = p_hotel_id, department = p_department
  where id = p_profile_id
  returning * into updated;

  if updated is null then
    raise exception using errcode = 'P0002', message = 'Profile not found';
  end if;

  return updated;
end;
$$;

revoke all on function public.platform_assign_staff(uuid, public.app_role, uuid, text) from public;
grant execute on function public.platform_assign_staff(uuid, public.app_role, uuid, text) to authenticated;
-- (profiles_self_or_authorized_staff, from Phase 1, already includes
-- `or is_platform_admin()` — a platform admin can already list every
-- profile to find one to assign; no additional policy needed here.)
