-- Split into its own migration/transaction: a newly added enum value can't
-- be referenced by other statements in the same transaction that added it,
-- so the multi-tenant foundation migration (which uses 'PLATFORM_ADMIN'
-- immediately) has to run afterward, in a separate transaction.
alter type public.app_role add value 'PLATFORM_ADMIN';
