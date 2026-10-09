import type { ComponentType } from 'react';
import type * as z from 'zod';

/**
 * A single entry in the SectionRegistry. Binds a section `type` string (the
 * key under which this entry is registered) to:
 *
 *  - `component`: the client component that renders the section.
 *  - `schema`  : Zod schema that validates `section.props` before rendering.
 *                This is the contract boundary between the BFF and the UI.
 *  - `version` : contract version understood by *this* client. When the
 *                incoming `section.version` differs, the renderer surfaces a
 *                version mismatch through the reporter so you can ship a
 *                fallback or ignore it depending on your policy.
 */
export interface SectionRegistryEntry<TProps = unknown> {
  component: ComponentType<TProps>;
  schema: z.ZodType<TProps>;
  version: number;
}

/**
 * Registry is a plain record — the map is always keyed by `section.type`.
 * We intentionally use `any` on the entry generic so a registry can hold
 * heterogeneous entries (each with its own props shape) without forcing a
 * union at the storage level. Inference still works at the call site through
 * `defineSection`.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SectionRegistry = Record<string, SectionRegistryEntry<any>>;

/**
 * Authoring helper: binds a component to its schema + version while
 * preserving the exact inferred props type. Prefer this over constructing
 * the entry literal by hand — it keeps the component and schema locked to
 * the same `TProps`.
 *
 * @example
 * export const promoBannerEntry = defineSection({
 *   schema: promoBannerPropsSchema,     // z.ZodType<PromoBannerProps>
 *   component: PromoBanner,             // props: PromoBannerProps
 *   version: 1,
 * });
 */
export function defineSection<T>(entry: SectionRegistryEntry<T>): SectionRegistryEntry<T> {
  return entry;
}
