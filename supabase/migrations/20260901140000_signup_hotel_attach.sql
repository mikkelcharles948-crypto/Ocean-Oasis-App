-- The guest hotel picker (new, pre-auth) passes the picked hotel through
-- signUp()'s metadata now -- handle_new_user() needs to actually read it
-- and attach it to the new guests row, instead of always leaving hotel_id
-- null until a first reservation. Staff signup has no such metadata (staff
-- accounts are hand-provisioned via platform_assign_staff), so this is a
-- no-op for them either way.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'first_name', ''), coalesce(new.raw_user_meta_data->>'last_name', ''))
  on conflict (id) do nothing;
  insert into public.guests (auth_user_id, first_name, last_name, email, interests, hotel_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', ''),
    coalesce(new.raw_user_meta_data->>'last_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data->'interests', '[]'::jsonb),
    nullif(new.raw_user_meta_data->>'hotel_id', '')::uuid
  )
  on conflict (auth_user_id) do nothing;
  return new;
end;
$$;
