-- Phase 5: subscription/plan tracking per hotel, for the platform admin's
-- analytics screen. This app has no real payment processor anywhere
-- (guest billing/Folio is already display-only) -- these are the same
-- kind of stored figures MCX Technologies would enter manually per
-- customer, not a live Stripe integration.
alter table public.hotels
  add column plan text not null default 'trial' check (plan in ('trial', 'starter', 'growth', 'enterprise')),
  add column mrr numeric(10,2) not null default 0;

update public.hotels set plan = 'growth', mrr = 899 where slug = 'ocean-oasis-dm';
update public.hotels set plan = 'trial', mrr = 0 where slug = 'fort-young-dm';
