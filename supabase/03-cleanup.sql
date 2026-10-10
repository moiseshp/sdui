-- =============================================================================
-- BDUI Demo · 03 · Cleanup after each presentation (D-26)
-- -----------------------------------------------------------------------------
-- Deletes the registered people, puts every bottom bar initiative back to
-- its default state (D-64) and makes 'guest' the anonymous view again (D-81).
-- Views and initiatives themselves are kept.
-- No-SQL alternative: Table Editor → demo_users → select all → Delete,
-- set `enabled` = `enabled_by_default` in initiatives, and set
-- `anonymous_variant_id` = 'guest' in demo_settings.
--
-- Effect on phones: anyone who reloads the Home with an old session sees the
-- anonymous view again (get_home_screen treats unknown users as no session, D-69).
-- =============================================================================

delete from public.demo_users;

update public.initiatives
   set enabled = enabled_by_default;

update public.demo_settings
   set anonymous_variant_id = 'guest';
