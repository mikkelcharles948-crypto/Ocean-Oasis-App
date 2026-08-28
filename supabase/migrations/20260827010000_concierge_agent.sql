-- AI concierge conversations. Messages are inserted from two places:
-- guest turns and staff take-over replies go through the normal
-- authenticated client (RLS-checked below); assistant turns are only ever
-- inserted by the concierge-chat Edge Function using the service role key,
-- which bypasses RLS entirely — there's deliberately no policy allowing an
-- ordinary authenticated client to insert role = 'assistant' itself.

create table public.concierge_conversations (
  id uuid primary key default gen_random_uuid(),
  guest_id uuid not null references public.guests(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'escalated', 'resolved')),
  escalated_request_id text references public.service_requests(id) on delete set null,
  created_at timestamptz not null default now(),
  last_message_at timestamptz not null default now()
);

create table public.concierge_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.concierge_conversations(id) on delete cascade,
  role text not null check (role in ('guest', 'assistant', 'staff')),
  content text not null,
  staff_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index concierge_messages_conversation_idx on public.concierge_messages(conversation_id, created_at);
create index concierge_conversations_guest_idx on public.concierge_conversations(guest_id);

alter table public.concierge_conversations enable row level security;
alter table public.concierge_messages enable row level security;

create policy concierge_conversations_guest_select on public.concierge_conversations
for select using (
  guest_id in (select g.id from public.guests g where g.auth_user_id = auth.uid())
  or public.is_staff()
);

create policy concierge_conversations_guest_insert on public.concierge_conversations
for insert with check (
  guest_id in (select g.id from public.guests g where g.auth_user_id = auth.uid())
);

create policy concierge_conversations_staff_update on public.concierge_conversations
for update using (public.is_staff()) with check (public.is_staff());

create policy concierge_messages_select on public.concierge_messages
for select using (
  public.is_staff()
  or conversation_id in (
    select c.id from public.concierge_conversations c
    where c.guest_id in (select g.id from public.guests g where g.auth_user_id = auth.uid())
  )
);

create policy concierge_messages_guest_insert on public.concierge_messages
for insert with check (
  role = 'guest'
  and conversation_id in (
    select c.id from public.concierge_conversations c
    where c.guest_id in (select g.id from public.guests g where g.auth_user_id = auth.uid())
  )
);

create policy concierge_messages_staff_insert on public.concierge_messages
for insert with check (public.is_staff() and role = 'staff' and staff_id = auth.uid());

-- Lets the concierge-chat Edge Function's service-role client bump this on
-- every turn without a broader "staff can update any conversation" grant
-- being required for the guest-facing chat itself to work.
create or replace function public.touch_concierge_conversation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.concierge_conversations set last_message_at = now() where id = new.conversation_id;
  return new;
end;
$$;

create trigger concierge_messages_touch_conversation
after insert on public.concierge_messages
for each row execute function public.touch_concierge_conversation();
