#!/usr/bin/env node
/**
 * Generates supabase/02-seed.sql from contract/fixtures/.
 *
 *   npm run db:seed   (or: node scripts/generate-supabase-seed.mjs)
 *
 * Fixtures are the contract's source of truth (docs/contrato.md). Whenever a
 * fixture, variants.json or initiatives.json changes: regenerate, then run
 * 02-seed.sql again in Supabase. The seed is idempotent (upsert by id).
 *
 * Conventions:
 *   - Each view in variants.json has its screen in variant-<id>.json.
 *   - Views or initiatives no longer in the fixtures are removed; people on a
 *     removed view are moved to the signed-in view (D-62, D-69).
 *   - Each view declares its `kind`: 'anonymous' or 'signed-in' (D-81). The
 *     settings row (active anonymous view) is created once and never changed
 *     by a re-seed, unless its view stops existing or stops being anonymous.
 *   - Re-running the seed never changes whether an initiative is on or off.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const fixturesDir = join(root, 'contract', 'fixtures');
const outFile = join(root, 'supabase', '02-seed.sql');

/** Same as DEFAULT_VARIANT_ID in lib/data/types.ts (view assigned on sign-in). */
const DEFAULT_VARIANT_ID = 'logged';
/** Same as ANONYMOUS_VARIANT_ID in lib/data/types.ts (view without a session). */
const ANONYMOUS_VARIANT_ID = 'guest';

const readJson = file => JSON.parse(readFileSync(join(fixturesDir, file), 'utf8'));

/** Safe SQL literal for short text (escapes single quotes). */
const sqlText = value => `'${String(value).replaceAll("'", "''")}'`;

/** Dollar-quoted SQL literal for JSON (nothing to escape). */
const sqlJson = value => {
  const json = JSON.stringify(value, null, 2);
  if (json.includes('$json$')) throw new Error('The JSON contains "$json$"; change the delimiter.');
  return `$json$${json}$json$::jsonb`;
};

/** text[] literal, or null. */
const sqlTextArray = values => (values ? `array[${values.map(sqlText).join(', ')}]::text[]` : 'null');

const sqlIdList = items => items.map(item => sqlText(item.id)).join(', ');

/* Views ------------------------------------------------------------------- */

const variants = readJson('variants.json');
const VARIANT_KINDS = ['anonymous', 'signed-in'];
for (const variant of variants) {
  if (!VARIANT_KINDS.includes(variant.kind)) {
    throw new Error(`View "${variant.id}" must declare kind "anonymous" or "signed-in" (got "${variant.kind}").`);
  }
}
for (const required of [DEFAULT_VARIANT_ID, ANONYMOUS_VARIANT_ID]) {
  if (!variants.some(variant => variant.id === required)) {
    throw new Error(`variants.json must include the view "${required}".`);
  }
}
if (variants.find(variant => variant.id === ANONYMOUS_VARIANT_ID).kind !== 'anonymous') {
  throw new Error(`The view "${ANONYMOUS_VARIANT_ID}" must have kind "anonymous".`);
}
if (variants.find(variant => variant.id === DEFAULT_VARIANT_ID).kind !== 'signed-in') {
  throw new Error(`The view "${DEFAULT_VARIANT_ID}" must have kind "signed-in".`);
}

const variantRows = variants.map(variant => {
  const screen = readJson(`variant-${variant.id}.json`);
  return `  (\n    ${sqlText(variant.id)},\n    ${sqlText(variant.name)},\n    ${sqlText(variant.description)},\n    ${sqlText(variant.kind)},\n    ${sqlJson(screen)}\n  )`;
});

/* Initiatives ------------------------------------------------------------- */

const initiatives = readJson('initiatives.json');
const variantIds = new Set(variants.map(variant => variant.id));

const initiativeRows = initiatives.map(initiative => {
  for (const id of initiative.audience ?? []) {
    if (!variantIds.has(id)) throw new Error(`Initiative "${initiative.id}" targets unknown view "${id}".`);
  }
  return [
    '  (',
    `    ${sqlText(initiative.id)},`,
    `    ${sqlText(initiative.name)},`,
    `    ${sqlText(initiative.description)},`,
    `    ${Number(initiative.priority)},`,
    `    ${sqlTextArray(initiative.audience)},`,
    `    ${initiative.enabledByDefault ? 'true' : 'false'},`,
    `    ${initiative.enabledByDefault ? 'true' : 'false'},`,
    `    ${sqlJson(initiative.section)}`,
    '  )',
  ].join('\n');
});

/* SQL --------------------------------------------------------------------- */

const sql = `-- =============================================================================
-- BDUI Demo · 02 · Seed (views + bottom bar initiatives)
-- -----------------------------------------------------------------------------
-- GENERATED FILE. Do not edit by hand.
-- Source:      contract/fixtures/ (variants.json, variant-*.json, initiatives.json)
-- Regenerate:  npm run db:seed
--
-- Where:  Supabase → SQL Editor → New query → paste everything → Run.
-- Order:  after 01-schema.sql.
-- Idempotent: updates existing rows. Only touches demo_users to move people
-- off views that no longer exist. Never changes whether an initiative is on,
-- nor the active anonymous view (unless that view is gone or not anonymous).
-- =============================================================================

-- 1. Views
insert into public.variants (id, name, description, kind, screen)
values
${variantRows.join(',\n')}
on conflict (id) do update
  set name        = excluded.name,
      description = excluded.description,
      kind        = excluded.kind,
      screen      = excluded.screen;

-- 2. Active anonymous view (D-81): created once, kept on re-seed. Falls back to
--    ${ANONYMOUS_VARIANT_ID} if its view is about to be retired or is no longer anonymous.
insert into public.demo_settings (id, anonymous_variant_id)
values (true, ${sqlText(ANONYMOUS_VARIANT_ID)})
on conflict (id) do nothing;

update public.demo_settings
   set anonymous_variant_id = ${sqlText(ANONYMOUS_VARIANT_ID)}
 where anonymous_variant_id not in (${sqlIdList(variants.filter(variant => variant.kind === 'anonymous'))});

-- 3. Retire views that are no longer in the fixtures (e.g. the A–D presets)
update public.demo_users
   set variant_id = ${sqlText(DEFAULT_VARIANT_ID)}
 where variant_id not in (${sqlIdList(variants)});

delete from public.variants
 where id not in (${sqlIdList(variants)});

-- 4. Bottom bar initiatives (feature flags)
insert into public.initiatives (id, name, description, priority, audience, enabled, enabled_by_default, section)
values
${initiativeRows.join(',\n')}
on conflict (id) do update
  set name               = excluded.name,
      description        = excluded.description,
      priority           = excluded.priority,
      audience           = excluded.audience,
      enabled_by_default = excluded.enabled_by_default,
      section            = excluded.section;

delete from public.initiatives
 where id not in (${sqlIdList(initiatives)});
`;

writeFileSync(outFile, sql);
console.log(
  `✔ ${outFile} generated with ${variants.length} views (${variants.map(v => `${v.id}:${v.kind}`).join(', ')}) ` +
    `and ${initiatives.length} initiatives (${initiatives.map(i => i.id).join(', ')})`,
);
