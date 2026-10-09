/**
 * [ARQ] Data operations (docs/contrato.md §4).
 * Views import ONLY from here. They never read fixtures or Supabase directly.
 *
 * [DEMO] The adapter is picked with the DATA_SOURCE environment variable:
 *   - `mock`     (default): in-memory, for offline work.
 *   - `supabase`: real backend (the 9 RPCs). Requires the variables in .env.example.
 */

import { mockDataSource } from './adapters/mock';
import { supabaseDataSource } from './adapters/supabase';
import { sanitizeName } from './sanitize';
import type { DataSource, VariantId } from './types';

export type { DemoUser, InitiativeSummary, RegisterUserResult, VariantId, VariantSummary } from './types';
export { ANONYMOUS_VARIANT_ID, DEFAULT_VARIANT_ID, VARIANT_IDS, isVariantId } from './types';
export { InvalidNameError } from './sanitize';

export type DataSourceName = 'mock' | 'supabase';

/** Active adapter name. Tolerates whitespace and casing ("Supabase ", "SUPABASE"). */
export function getDataSourceName(): DataSourceName {
  const raw = (process.env.DATA_SOURCE ?? 'mock').trim().toLowerCase();
  if (raw === 'mock' || raw === 'supabase') return raw;
  throw new Error(`Unsupported DATA_SOURCE: "${process.env.DATA_SOURCE}". Use "mock" or "supabase".`);
}

function getDataSource(): DataSource {
  return getDataSourceName() === 'supabase' ? supabaseDataSource : mockDataSource;
}

/** Receives the raw name. Sanitizes here (D-07) and delegates to the backend. */
export function registerUser(name: string) {
  return getDataSource().upsertUser(sanitizeName(name));
}

/** `null` = no session: the backend answers with the anonymous view (D-69). */
export function getHomeScreen(userId: string | null) {
  return getDataSource().getHomeScreen(userId);
}

export function listUsers() {
  return getDataSource().listUsers();
}

export function listVariants() {
  return getDataSource().listVariants();
}

export function assignVariant(userId: string, variantId: VariantId) {
  return getDataSource().assignVariant(userId, variantId);
}

export function listInitiatives() {
  return getDataSource().listInitiatives();
}

export function setInitiativeEnabled(initiativeId: string, enabled: boolean) {
  return getDataSource().setInitiativeEnabled(initiativeId, enabled);
}

/** Stored screen of a view (template: tokens not interpolated, no bottom bar). `null` if it does not exist. */
export function getVariantScreen(variantId: VariantId) {
  return getDataSource().getVariantScreen(variantId);
}

/** Saves the section order of a view. Only ids travel; the backend validates them (D-74). */
export function reorderSections(variantId: VariantId, sectionIds: string[]) {
  return getDataSource().reorderSections(variantId, sectionIds);
}
