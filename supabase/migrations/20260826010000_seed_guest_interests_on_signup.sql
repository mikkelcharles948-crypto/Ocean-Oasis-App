-- The onboarding flow lets a guest pick interests before they ever sign up,
-- then only ever wrote them to local React state — signUp() now passes
-- them through as auth signup metadata (see AppContext.js), but
-- handle_new_user() was still only copying first_name/last_name/email into
-- the new guests row, silently dropping interests at account creation.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'first_name', ''), coalesce(new.raw_user_meta_data ->> 'last_name', ''))
  on conflict (id) do nothing;
  insert into public.guests (auth_user_id, first_name, last_name, email, interests)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data -> 'interests', '[]'::jsonb)
  )
  on conflict (auth_user_id) do nothing;
  return new;
end;
$$;
