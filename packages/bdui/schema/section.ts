import * as z from 'zod';
import { TriggerSchema } from './action';

/**
 * Envelope for any renderable section. Props are intentionally left as
 * `unknown` at this level: each section ships its own props schema and
 * validates itself in the registry (see step 5). That keeps the screen-level
 * parse cheap and forward-compatible with new section types.
 *
 * Conventions:
 * - `id` must be stable across renders for animations, analytics and diffing.
 * - `version` starts at 1 and bumps on breaking prop changes.
 * - `actions` are section-level triggers (onView, onMount, etc). Per-item
 *   actions live inside `props` where they belong.
 */
export const SectionSchema = z.object({
  id: z.string().min(1),
  type: z.string().min(1),
  version: z.number().int().positive().default(1),
  actions: TriggerSchema.optional(),
  props: z.unknown().optional(),
});

export type Section = z.infer<typeof SectionSchema>;
