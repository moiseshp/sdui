import * as z from 'zod';
import { TriggerSchema } from './action';
import { SectionSchema } from './section';

/**
 * Screen metadata. Lives alongside the section tree so the BFF can drive
 * SEO/analytics/telemetry without duplicating it in each section.
 */
export const ScreenMetaSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  analytics: z
    .object({
      screenName: z.string().optional(),
      properties: z.record(z.string(), z.unknown()).optional(),
    })
    .optional(),
});
export type ScreenMeta = z.infer<typeof ScreenMetaSchema>;

/**
 * Screen-level layout. Changes how sections are arranged (container,
 * columns), never their props. See docs/contrato.md §3.
 */
export const ScreenLayoutSchema = z.enum(['default', 'kiosk']);
export type ScreenLayout = z.infer<typeof ScreenLayoutSchema>;

/**
 * Screen-level theme (v1.2). Semantic intent, never raw colors (D-60, D-63):
 * each platform maps it to its own tokens (web: `[data-bdui-theme]` in
 * app/globals.css). Independent from `layout`.
 */
export const ScreenThemeSchema = z.enum(['default', 'loyalty', 'christmas']);
export type ScreenTheme = z.infer<typeof ScreenThemeSchema>;

/**
 * The top-level BDUI envelope. Everything the BFF delivers for a single
 * rendered screen MUST conform to this shape.
 *
 * - `schemaVersion` is the contract version between BFF and client. Bump it
 *   only on breaking changes to the envelope itself (not section props).
 * - `screenId` is the stable identifier of the screen (e.g. "kfc_home").
 *   Useful for analytics and for routing/caching decisions on the BFF side.
 * - `layout` (v1.1) how the client arranges `sections`. Defaults to "default".
 * - `header` (v1.1) sticky slot rendered outside the scrollable body. Same
 *   Section envelope, resolved through the same registry. Optional: when
 *   absent, no header is rendered. Native equivalent: navigation bar.
 * - `theme` (v1.2) semantic theme for the whole screen. Defaults to "default".
 * - `bottomBar` (v1.2) fixed slot at the bottom of the screen. The backend
 *   fills it with the winning initiative (feature flag), or leaves it out.
 *   Same Section envelope and registry as the body (D-64).
 * - `actions` are screen-level triggers. Most common: `onMount` for pageview
 *   tracking, `onRefresh` for pull-to-refresh, etc.
 */
export const ScreenSchema = z.object({
  schemaVersion: z.string().min(1),
  screenId: z.string().min(1),
  layout: ScreenLayoutSchema.default('default'),
  theme: ScreenThemeSchema.default('default'),
  header: SectionSchema.optional(),
  bottomBar: SectionSchema.optional(),
  sections: z.array(SectionSchema),
  actions: TriggerSchema.optional(),
  meta: ScreenMetaSchema.optional(),
});
export type Screen = z.infer<typeof ScreenSchema>;

/** Strict parse: throws a ZodError with full issue path when the shape is wrong. */
export function parseScreen(input: unknown): Screen {
  return ScreenSchema.parse(input);
}

/** Safe parse: returns a discriminated result so callers can fallback gracefully. */
export function safeParseScreen(input: unknown) {
  return ScreenSchema.safeParse(input);
}

/** Current envelope version. Keep in sync with `schemaVersion` in payloads. */
export const SCHEMA_VERSION = '1.2.0';
