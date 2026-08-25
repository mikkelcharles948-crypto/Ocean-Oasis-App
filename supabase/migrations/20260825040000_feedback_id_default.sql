-- feedback.id was missed by 20260824020000_generated_ids_and_secure_roles.sql,
-- which gave every other text-primary-key table (service_requests,
-- activities, activity_bookings, events, promotions, maintenance_issues,
-- content_items) a generated default. Without it, any insert that doesn't
-- explicitly supply an id (as the app's createFeedback() now also does,
-- client-side) fails with a not-null violation on feedback.id.
alter table public.feedback alter column id set default ('fb_' || replace(gen_random_uuid()::text, '-', ''));
