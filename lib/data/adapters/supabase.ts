/**
 * Supabase adapter: calls the 11 contract RPCs over plain HTTP.
 *
 * [ARQ] No SDK on purpose: this is exactly what a native app or a .NET backend
 * would do. Each operation is a POST to /rest/v1/rpc/<function> with the public
 * key in the `apikey` header. The RPCs already return the shape of `types.ts`
 * (camelCase), so there is no mapping here. See supabase/README.md.
 *
 * [DEMO] Runs on the Next server (Server Components / Actions), so the
 * variables don't need the NEXT_PUBLIC_ prefix.
 */

import type {
  DataSource,
  DemoUser,
  InitiativeSummary,
  RegisterUserResult,
  SectionLayoutResult,
  VariantId,
  VariantSummary,
} from '../types';

/** Accepts the variable names the Supabase dashboard usually suggests. */
function readConfig() {
  const url = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL)?.trim();
  const key = (
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )?.trim();

  if (!url || !key) {
    throw new Error(
      '[supabase] Missing variables. Define SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY (or SUPABASE_ANON_KEY) in .env.local. See .env.example.',
    );
  }
  // Catches typos like "KEY==sb_publishable_..." before they become a 401 mid-demo.
  if (!key.startsWith('sb_publishable_') && !key.startsWith('eyJ')) {
    throw new Error(
      '[supabase] The key does not look like a public Supabase key (expected "sb_publishable_..." or "eyJ..."). Check .env.local for stray characters such as a double "=".',
    );
  }
  if (key.startsWith('sb_secret_')) {
    throw new Error('[supabase] That is the SECRET key. Use the public (publishable) key.');
  }
  return { url: url.replace(/\/$/, ''), key };
}

async function rpc<T>(fn: string, args: Record<string, unknown> = {}): Promise<T> {
  const { url, key } = readConfig();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    apikey: key,
  };
  // Legacy "anon" keys are JWTs and also go as Bearer.
  // New "publishable" keys (sb_publishable_...) only go in `apikey`.
  if (key.startsWith('eyJ')) headers.Authorization = `Bearer ${key}`;

  const response = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(args),
    cache: 'no-store', // D-19: never cache
  });

  if (!response.ok) {
    const detail = await response.json().catch(() => null);
    throw new Error(`[supabase] ${fn} failed (${response.status}): ${detail?.message ?? response.statusText}`);
  }

  return (await response.json()) as T;
}

export const supabaseDataSource: DataSource = {
  upsertUser: ({ id, displayName }) => rpc<RegisterUserResult>('upsert_user', { p_id: id, p_display_name: displayName }),

  // `null` travels as JSON null: the RPC answers with the anonymous view (D-69).
  getHomeScreen: userId => rpc<unknown>('get_home_screen', { p_user_id: userId }),

  listUsers: () => rpc<DemoUser[]>('list_users'),

  listVariants: () => rpc<VariantSummary[]>('list_variants'),

  assignVariant: (userId, variantId) => rpc<DemoUser>('assign_variant', { p_user_id: userId, p_variant_id: variantId }),

  listInitiatives: () => rpc<InitiativeSummary[]>('list_initiatives'),

  setInitiativeEnabled: (initiativeId, enabled) =>
    rpc<InitiativeSummary>('set_initiative_enabled', { p_initiative_id: initiativeId, p_enabled: enabled }),

  // Template of a view (tokens not interpolated, no bottomBar, hidden sections flagged): D-74, D-78.
  getVariantScreen: variantId => rpc<unknown | null>('get_variant_screen', { p_variant_id: variantId }),

  // Only ids travel; the RPC rejects anything that is not exactly the view's sections (D-74).
  // Hidden ids are optional: omitted (null) = keep the current visibility (D-78).
  reorderSections: (variantId, sectionIds, hiddenSectionIds) =>
    rpc<SectionLayoutResult>('reorder_sections', {
      p_variant_id: variantId,
      p_section_ids: sectionIds,
      p_hidden_section_ids: hiddenSectionIds ?? null,
    }),

  // Active anonymous view for every visitor without a session (D-81).
  getAnonymousVariant: () => rpc<VariantId>('get_anonymous_variant'),

  // The RPC rejects views that are not `anonymous` (D-81).
  setAnonymousVariant: variantId => rpc<VariantId>('set_anonymous_variant', { p_variant_id: variantId }),
};
