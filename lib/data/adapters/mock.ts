/**
 * [DEMO] Mock adapter: SIMULATES THE BACKEND for offline work.
 *
 * Everything that happens here (storing users, picking the view, resolving
 * the bottom bar, interpolating {{displayName}}) is done by the backend in
 * production, never by the client. Same rules as supabase/01-schema.sql.
 *
 * In-memory state on the Next server. Works locally; NOT reliable on Vercel
 * (each instance has its own memory). See docs/roadmap.md.
 */

import type { DataSource, DemoUser, InitiativeSummary, VariantId, VariantSummary } from '../types';
import { ANONYMOUS_VARIANT_ID, DEFAULT_VARIANT_ID, isVariantId } from '../types';

import initiativesSeed from '@/contract/fixtures/initiatives.json';
import variantsSeed from '@/contract/fixtures/variants.json';
import viewBirthday from '@/contract/fixtures/variant-birthday.json';
import viewChristmas from '@/contract/fixtures/variant-christmas.json';
import viewGuest from '@/contract/fixtures/variant-guest.json';
import viewHeavy from '@/contract/fixtures/variant-heavy.json';
import viewLogged from '@/contract/fixtures/variant-logged.json';
import viewLoyalty from '@/contract/fixtures/variant-loyalty.json';

const screensByVariant: Record<VariantId, Record<string, unknown>> = {
  guest: viewGuest,
  logged: viewLogged,
  loyalty: viewLoyalty,
  christmas: viewChristmas,
  heavy: viewHeavy,
  birthday: viewBirthday,
};
const variants = variantsSeed as VariantSummary[];

/** Fixture shape: the summary plus the default state and the section to inject. */
type InitiativeFixture = Omit<InitiativeSummary, 'enabled'> & { enabledByDefault: boolean; section: unknown };
const initiatives = (initiativesSeed as InitiativeFixture[]).toSorted((x, y) => x.priority - y.priority);

/* -------------------------------------------------------------------------- */
/* In-memory state (survives dev-server hot reloads)                           */
/* -------------------------------------------------------------------------- */

type MockDb = {
  users: Map<string, DemoUser>;
  initiativesEnabled?: Map<string, boolean>;
  /** Saved section order per view (D-74). Missing = the fixture order. */
  sectionOrder?: Map<VariantId, string[]>;
};

const globalForMock = globalThis as unknown as { __bduiMockDb?: MockDb };
const db: MockDb = (globalForMock.__bduiMockDb ??= { users: new Map() });
const initiativesEnabled = (db.initiativesEnabled ??= new Map(initiatives.map(i => [i.id, i.enabledByDefault])));
const sectionOrder = (db.sectionOrder ??= new Map<VariantId, string[]>());

/* -------------------------------------------------------------------------- */
/* Backend rules (D-08, D-64)                                                  */
/* -------------------------------------------------------------------------- */

function interpolate<T>(value: T, vars: Record<string, string>): T {
  if (typeof value === 'string') {
    return value.replace(/\{\{(\w+)\}\}/g, (match, key: string) => vars[key] ?? match) as T;
  }
  if (Array.isArray(value)) {
    return value.map(item => interpolate(item, vars)) as T;
  }
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, interpolate(v, vars)])) as T;
  }
  return value;
}

/** Enabled initiative with the highest priority that applies to the view. */
function winningInitiative(variantId: VariantId) {
  return initiatives.find(i => initiativesEnabled.get(i.id) && (i.audience === null || i.audience.includes(variantId)));
}

function toSummary({ id, name, description, priority, audience }: InitiativeFixture): InitiativeSummary {
  return { id, name, description, priority, audience, enabled: initiativesEnabled.get(id) ?? false };
}

type StoredSection = { id: string };

/** Stored screen of a view with the saved section order applied (D-74). */
function orderedScreen(variantId: VariantId): Record<string, unknown> {
  const base = screensByVariant[variantId];
  const order = sectionOrder.get(variantId);
  if (!order) return base;

  const byId = new Map((base.sections as StoredSection[]).map(section => [section.id, section]));
  return { ...base, sections: order.flatMap(id => byId.get(id) ?? []) };
}

/* -------------------------------------------------------------------------- */
/* DataSource                                                                  */
/* -------------------------------------------------------------------------- */

export const mockDataSource: DataSource = {
  async upsertUser({ id, displayName }) {
    const existing = db.users.get(id);
    if (existing) return { id: existing.id, displayName: existing.displayName, isNew: false };

    const user: DemoUser = { id, displayName, variantId: DEFAULT_VARIANT_ID, createdAt: new Date().toISOString() };
    db.users.set(id, user);
    return { id, displayName, isNew: true };
  },

  async getHomeScreen(userId) {
    // No session or unknown user (data deleted, server restarted): anonymous view (D-69).
    const user = userId ? db.users.get(userId) : undefined;

    // Users left in memory from the deprecated A–D presets fall back to the default view.
    const variantId = !user ? ANONYMOUS_VARIANT_ID : isVariantId(user.variantId) ? user.variantId : DEFAULT_VARIANT_ID;
    const winner = winningInitiative(variantId);
    const base = orderedScreen(variantId);
    const screen = winner ? { ...base, bottomBar: winner.section } : base;

    // Personalization tokens, resolved by the backend (D-08, D-72).
    // displayName is already trimmed with single spaces (D-07): first word = first name.
    if (!user) return screen;
    const firstName = user.displayName.split(' ')[0];
    return interpolate(screen, { displayName: user.displayName, firstName });
  },

  async listUsers() {
    return [...db.users.values()]
      .map(user => (isVariantId(user.variantId) ? user : { ...user, variantId: DEFAULT_VARIANT_ID }))
      .sort((x, y) => x.createdAt.localeCompare(y.createdAt));
  },

  async listVariants() {
    return variants;
  },

  async assignVariant(userId, variantId) {
    if (!isVariantId(variantId)) throw new Error(`Unknown view: ${variantId}`);
    const user = db.users.get(userId);
    if (!user) throw new Error(`Unknown user: ${userId}`);

    const updated: DemoUser = { ...user, variantId };
    db.users.set(userId, updated);
    return updated;
  },

  async listInitiatives() {
    return initiatives.map(toSummary);
  },

  async setInitiativeEnabled(initiativeId, enabled) {
    const initiative = initiatives.find(i => i.id === initiativeId);
    if (!initiative) throw new Error(`Unknown initiative: ${initiativeId}`);

    initiativesEnabled.set(initiativeId, enabled);
    return toSummary(initiative);
  },

  async getVariantScreen(variantId) {
    return isVariantId(variantId) ? orderedScreen(variantId) : null;
  },

  async reorderSections(variantId, sectionIds) {
    if (!isVariantId(variantId)) throw new Error(`Unknown view: ${variantId}`);

    // Same rule as the SQL function: exactly the view's sections, nothing missing, repeated or unknown.
    const current = (orderedScreen(variantId).sections as StoredSection[]).map(section => section.id);
    const isSameSet =
      sectionIds.length === current.length &&
      new Set(sectionIds).size === sectionIds.length &&
      sectionIds.every(id => current.includes(id));
    if (!isSameSet) throw new Error('The ids must be exactly the sections of the view');

    sectionOrder.set(variantId, [...sectionIds]);
    return [...sectionIds];
  },
};
