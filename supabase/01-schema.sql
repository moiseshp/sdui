-- =============================================================================
-- BDUI Demo · 01 · Schema (tables + security + contract operations)
-- -----------------------------------------------------------------------------
-- Where:  Supabase → SQL Editor → New query → paste everything → Run.
-- Order:  1) this file  2) 02-seed.sql
-- Idempotent: safe to run again (also upgrades a database created with the
-- A–D presets).
--
-- Design (docs/contrato.md §4 and §6, docs/decisiones.md D-23, D-49, D-62–D-66):
--   · Tables are CLOSED: nobody reads or writes them directly with the public key.
--   · The 7 contract operations are 7 RPC functions. That is all the public key
--     can call. Each one is exposed as a REST endpoint:
--       POST /rest/v1/rpc/<function_name>
--     so Swift, Android or .NET consume them exactly like the web does.
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 1. Tables
-- -----------------------------------------------------------------------------

create table if not exists public.variants (
  id          text primary key,             -- 'guest' | 'logged' | 'loyalty' | ...
  name        text not null,                -- "Default (no logeado)"
  description text not null,
  screen      jsonb not null,               -- Screen v1.2 with {{displayName}} tokens
  constraint variants_id_format check (id ~ '^[a-z][a-z0-9-]*$')
);

comment on table public.variants is
  'Home views (D-62). Source: contract/fixtures/. Loaded with 02-seed.sql.';

-- Upgrade from the A–D presets: ids are now slugs, not single letters.
alter table public.variants drop constraint if exists variants_id_format;
alter table public.variants add constraint variants_id_format check (id ~ '^[a-z][a-z0-9-]*$');

create table if not exists public.demo_users (
  id           text primary key,            -- sanitized: "moises", "maria-jose"
  display_name text not null,               -- original: "Moisés"
  variant_id   text not null default 'logged' references public.variants (id),
  created_at   timestamptz not null default now(),
  constraint demo_users_id_format
    check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint demo_users_display_name_length
    check (char_length(display_name) between 1 and 60)
);

comment on table public.demo_users is
  'Presentation attendees. Deleted manually afterwards (03-cleanup.sql).';

-- Signing in assigns the logged-in view (D-69). Also upgrades older databases.
alter table public.demo_users alter column variant_id set default 'logged';

create index if not exists demo_users_created_at_idx
  on public.demo_users (created_at);

-- Bottom bar initiatives = feature flags (D-64).
create table if not exists public.initiatives (
  id                 text primary key,      -- 'incident' | 'address' | 'register'
  name               text not null,
  description        text not null,
  priority           int not null,          -- 1 = highest
  audience           text[],                -- view ids; null = every view
  enabled            boolean not null default false,
  enabled_by_default boolean not null default false,
  section            jsonb not null,        -- bottom_bar Section injected into the screen
  constraint initiatives_id_format check (id ~ '^[a-z][a-z0-9-]*$')
);

comment on table public.initiatives is
  'Bottom bar initiatives (feature flags). Source: contract/fixtures/initiatives.json.';


-- -----------------------------------------------------------------------------
-- 2. Security: closed tables
--    RLS enabled with NO policies = no direct access with the public key.
--    Supabase's default grants are revoked as well.
-- -----------------------------------------------------------------------------

alter table public.variants    enable row level security;
alter table public.demo_users  enable row level security;
alter table public.initiatives enable row level security;

revoke all on table public.variants    from anon, authenticated;
revoke all on table public.demo_users  from anon, authenticated;
revoke all on table public.initiatives from anon, authenticated;


-- -----------------------------------------------------------------------------
-- 3. Contract operations (RPC)
--    security definer: runs with the owner's privileges, so it can touch the
--    tables even though the caller can't.
--    search_path = '': Supabase best practice for definer functions; that's
--    why every name is qualified with "public.".
--    Responses use camelCase to match lib/data/types.ts 1:1.
-- -----------------------------------------------------------------------------

-- registerUser → upsert_user
-- Receives the name ALREADY sanitized (D-07, D-46). If the id exists, it creates
-- nothing and keeps display_name (first one wins, D-06).
create or replace function public.upsert_user(p_id text, p_display_name text)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_is_new boolean;
  v_user   public.demo_users;
begin
  insert into public.demo_users (id, display_name)
  values (p_id, p_display_name)
  on conflict (id) do nothing;

  v_is_new := found;

  select * into v_user from public.demo_users where id = p_id;

  return json_build_object(
    'id',          v_user.id,
    'displayName', v_user.display_name,
    'isNew',       v_is_new
  );
end;
$$;

-- getHomeScreen → get_home_screen
-- The Home is public (D-69):
--   · No session (p_user_id null) or unknown user → anonymous view 'guest'.
--   · Registered user → the view assigned to them (starts on 'logged').
-- Then:
--   1. Adds `bottomBar` with the enabled initiative of highest priority whose
--      audience includes that view (D-64). No winner → no `bottomBar`.
--   2. If there is a user, interpolates the personalization tokens in the whole
--      payload, escaped as JSON strings so odd names can't break the JSON (D-51):
--        {{displayName}} → full name as typed ("Moisés Huaringa")
--        {{firstName}}   → first word of it ("Moisés"), for greetings (D-72)
-- Never returns null.
create or replace function public.get_home_screen(p_user_id text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with viewer as (
    select
      coalesce(u.variant_id, 'guest') as variant_id,
      u.display_name,
      -- display_name is already trimmed with single spaces (D-07): first word = first name.
      split_part(u.display_name, ' ', 1) as first_name
    from (select 1) as anchor
    left join public.demo_users u on u.id = p_user_id
  ),
  resolved as (
    select
      vw.display_name,
      vw.first_name,
      case
        when w.section is null then v.screen
        else v.screen || jsonb_build_object('bottomBar', w.section)
      end as screen
    from viewer vw
    join public.variants v on v.id = vw.variant_id
    left join lateral (
      select i.section
      from public.initiatives i
      where i.enabled
        and (i.audience is null or vw.variant_id = any (i.audience))
      order by i.priority, i.id
      limit 1
    ) w on true
  )
  select
    case
      when r.display_name is null then r.screen
      else replace(
             replace(
               r.screen::text,
               '{{displayName}}',
               substr(to_json(r.display_name)::text, 2, length(to_json(r.display_name)::text) - 2)
             ),
             '{{firstName}}',
             substr(to_json(r.first_name)::text, 2, length(to_json(r.first_name)::text) - 2)
           )::jsonb
    end
  from resolved r;
$$;

-- listUsers → list_users  (ordered by arrival)
create or replace function public.list_users()
returns json
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
           json_agg(
             json_build_object(
               'id',          u.id,
               'displayName', u.display_name,
               'variantId',   u.variant_id,
               'createdAt',   u.created_at
             )
             order by u.created_at
           ),
           '[]'::json
         )
  from public.demo_users u;
$$;

-- listVariants → list_variants  (metadata only; the screen is not sent here)
-- Same order as contract/fixtures/variants.json, which is the panel's order.
create or replace function public.list_variants()
returns json
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
           json_agg(
             json_build_object(
               'id',          v.id,
               'name',        v.name,
               'description', v.description
             )
             order by array_position(
               array['guest', 'logged', 'loyalty', 'christmas', 'heavy', 'birthday'],
               v.id
             ) nulls last,
             v.id
           ),
           '[]'::json
         )
  from public.variants v;
$$;

-- assignVariant → assign_variant
-- Unknown view → fails on the FK. Unknown user → explicit error.
create or replace function public.assign_variant(p_user_id text, p_variant_id text)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user public.demo_users;
begin
  update public.demo_users
     set variant_id = p_variant_id
   where id = p_user_id
  returning * into v_user;

  if not found then
    raise exception 'Unknown user: %', p_user_id using errcode = 'P0002';
  end if;

  return json_build_object(
    'id',          v_user.id,
    'displayName', v_user.display_name,
    'variantId',   v_user.variant_id,
    'createdAt',   v_user.created_at
  );
end;
$$;

-- listInitiatives → list_initiatives  (ordered by priority; the section is not sent)
create or replace function public.list_initiatives()
returns json
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
           json_agg(
             json_build_object(
               'id',          i.id,
               'name',        i.name,
               'description', i.description,
               'priority',    i.priority,
               'audience',    i.audience,
               'enabled',     i.enabled
             )
             order by i.priority, i.id
           ),
           '[]'::json
         )
  from public.initiatives i;
$$;

-- setInitiativeEnabled → set_initiative_enabled
-- Unknown initiative → explicit error.
create or replace function public.set_initiative_enabled(p_initiative_id text, p_enabled boolean)
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_initiative public.initiatives;
begin
  update public.initiatives
     set enabled = p_enabled
   where id = p_initiative_id
  returning * into v_initiative;

  if not found then
    raise exception 'Unknown initiative: %', p_initiative_id using errcode = 'P0002';
  end if;

  return json_build_object(
    'id',          v_initiative.id,
    'name',        v_initiative.name,
    'description', v_initiative.description,
    'priority',    v_initiative.priority,
    'audience',    v_initiative.audience,
    'enabled',     v_initiative.enabled
  );
end;
$$;


-- getVariantScreen → get_variant_screen
-- Returns the stored screen of a view as a TEMPLATE: {{tokens}} are not
-- interpolated and there is no bottomBar. Used by the section order editor
-- (D-74). Unknown view → null.
create or replace function public.get_variant_screen(p_variant_id text)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select v.screen from public.variants v where v.id = p_variant_id;
$$;

-- reorderSections → reorder_sections
-- Reorders screen.sections of a view (D-74). It receives ONLY the section ids in
-- the new order: the backend checks that they are exactly the sections the view
-- already has (nothing missing, repeated or unknown) and rebuilds the array.
-- Content never travels from the client (D-24). Returns the saved order.
-- Note: 02-seed.sql overwrites `screen`, so re-seeding restores the fixture order.
create or replace function public.reorder_sections(p_variant_id text, p_section_ids text[])
returns json
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sections jsonb;
  v_current  text[];
  v_new      jsonb;
begin
  select screen -> 'sections' into v_sections
    from public.variants
   where id = p_variant_id
     for update;

  if not found then
    raise exception 'Unknown view: %', p_variant_id using errcode = 'P0002';
  end if;

  select coalesce(array_agg(s ->> 'id' order by ord), '{}')
    into v_current
    from jsonb_array_elements(coalesce(v_sections, '[]'::jsonb)) with ordinality as t(s, ord);

  if p_section_ids is null
     or cardinality(p_section_ids) <> cardinality(v_current)
     or (select count(distinct x) from unnest(p_section_ids) as x) <> cardinality(p_section_ids)
     or exists (select 1 from unnest(p_section_ids) as x where x <> all (v_current)) then
    raise exception 'The ids must be exactly the sections of the view' using errcode = '22023';
  end if;

  select coalesce(jsonb_agg(t.s order by o.ord), '[]'::jsonb)
    into v_new
    from unnest(p_section_ids) with ordinality as o(id, ord)
    join jsonb_array_elements(v_sections) as t(s) on t.s ->> 'id' = o.id;

  update public.variants
     set screen = jsonb_set(screen, '{sections}', v_new)
   where id = p_variant_id;

  return to_json(p_section_ids);
end;
$$;


-- -----------------------------------------------------------------------------
-- 4. Execute permissions: only these 9 functions, for the public key.
-- -----------------------------------------------------------------------------

revoke execute on function public.upsert_user(text, text)                 from public;
revoke execute on function public.get_home_screen(text)                   from public;
revoke execute on function public.list_users()                            from public;
revoke execute on function public.list_variants()                         from public;
revoke execute on function public.assign_variant(text, text)              from public;
revoke execute on function public.list_initiatives()                      from public;
revoke execute on function public.set_initiative_enabled(text, boolean)   from public;
revoke execute on function public.get_variant_screen(text)                from public;
revoke execute on function public.reorder_sections(text, text[])          from public;

grant execute on function public.upsert_user(text, text)                  to anon, authenticated, service_role;
grant execute on function public.get_home_screen(text)                    to anon, authenticated, service_role;
grant execute on function public.list_users()                             to anon, authenticated, service_role;
grant execute on function public.list_variants()                          to anon, authenticated, service_role;
grant execute on function public.assign_variant(text, text)               to anon, authenticated, service_role;
grant execute on function public.list_initiatives()                       to anon, authenticated, service_role;
grant execute on function public.set_initiative_enabled(text, boolean)    to anon, authenticated, service_role;
grant execute on function public.get_variant_screen(text)                 to anon, authenticated, service_role;
grant execute on function public.reorder_sections(text, text[])           to anon, authenticated, service_role;
