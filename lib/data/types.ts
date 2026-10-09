/**
 * [ARQ] Data contract (docs/contrato.md §4).
 *
 * Views only know the operations in `lib/data/index.ts`.
 * Each backend (mock today, Supabase now, .NET later) implements `DataSource`.
 * Switching backends never touches the views.
 */

/** Context views (D-62). The order is the one shown in the panel. */
export const VARIANT_IDS = ['guest', 'logged', 'loyalty', 'christmas', 'heavy', 'birthday'] as const;
export type VariantId = (typeof VARIANT_IDS)[number];

/** View for people without a session (the "not logged in" home). */
export const ANONYMOUS_VARIANT_ID: VariantId = 'guest';

/** View the backend assigns to every person when they sign in (D-69). */
export const DEFAULT_VARIANT_ID: VariantId = 'logged';

export function isVariantId(value: string): value is VariantId {
  return (VARIANT_IDS as readonly string[]).includes(value);
}

export interface DemoUser {
  /** Sanitized name: "moises", "maria-jose". */
  id: string;
  /** Name as the person typed it (first time): "Moisés". */
  displayName: string;
  variantId: VariantId;
  /** ISO 8601. */
  createdAt: string;
}

export interface VariantSummary {
  id: VariantId;
  name: string;
  description: string;
}

/**
 * Initiative that competes for the bottom bar (feature flag, D-64).
 * The backend shows, per view, the enabled one with the lowest `priority`.
 */
export interface InitiativeSummary {
  id: string;
  name: string;
  description: string;
  /** 1 = highest. */
  priority: number;
  /** Views it applies to; `null` = every view. */
  audience: VariantId[] | null;
  enabled: boolean;
}

export interface RegisterUserResult {
  id: string;
  displayName: string;
  isNew: boolean;
}

/** Saved order and visibility of a view's sections (D-74, D-78). */
export interface SectionLayoutResult {
  /** Every section of the view, in order (hidden ones included). */
  sectionIds: string[];
  /** The hidden ones, in the same order. The Home never receives them. */
  hiddenSectionIds: string[];
}

/**
 * What every backend must implement.
 *
 * Note: `upsertUser` receives the name ALREADY sanitized because, in this demo
 * only, sanitization lives in the frontend (D-07). In production the backend
 * would receive the raw name and sanitize it itself.
 */
export interface DataSource {
  /** Creates the user if missing. If it exists, returns it without touching displayName. */
  upsertUser(input: { id: string; displayName: string }): Promise<RegisterUserResult>;
  /**
   * Returns the screen ALREADY resolved: the view without its hidden sections
   * (D-78), the winning bottom bar (if any) and {{displayName}} interpolated.
   * Not validated: the client validates it with `parseScreen`.
   * No session (`null`) or unknown user → the anonymous view (D-69). It never
   * returns `null`: the Home is public.
   */
  getHomeScreen(userId: string | null): Promise<unknown>;
  /** Ordered by arrival (createdAt ascending). */
  listUsers(): Promise<DemoUser[]>;
  listVariants(): Promise<VariantSummary[]>;
  assignVariant(userId: string, variantId: VariantId): Promise<DemoUser>;
  /** Ordered by priority (1 first). */
  listInitiatives(): Promise<InitiativeSummary[]>;
  setInitiativeEnabled(initiativeId: string, enabled: boolean): Promise<InitiativeSummary>;
  /**
   * Stored screen of a view, as a TEMPLATE: tokens are not interpolated,
   * there is no bottom bar and hidden sections are included with
   * `hidden: true` (D-78). Used by the section editor (D-74).
   * Unknown view → `null`.
   */
  getVariantScreen(variantId: VariantId): Promise<unknown | null>;
  /**
   * Saves the order and the visibility of a view's `screen.sections`
   * (D-74, D-78). Only ids travel, never content: the backend rejects any
   * order that is not exactly the sections the view already has, and any
   * hidden id that is not one of them.
   * `hiddenSectionIds` omitted = keep the current visibility.
   */
  reorderSections(variantId: VariantId, sectionIds: string[], hiddenSectionIds?: string[]): Promise<SectionLayoutResult>;
}
