import { TriggerSchema } from '@/packages/bdui/schema/action';
import * as z from 'zod';

/**
 * Semantic look of the bar (D-60). Each platform maps it to its own tokens.
 * - `brand`  : brand color (follows the screen theme).
 * - `dark`   : black surface.
 * - `warning`: operational notice (incidents, delays).
 */
export const bottomBarVariantSchema = z.enum(['brand', 'dark', 'warning']);
export type BottomBarVariant = z.infer<typeof bottomBarVariantSchema>;

/** Semantic icon name. Each platform maps it to its own icon set. */
export const bottomBarIconSchema = z.enum(['gift', 'map-pin', 'warning', 'bell']);
export type BottomBarIcon = z.infer<typeof bottomBarIconSchema>;

export const bottomBarPropsSchema = z.object({
  /** Plain text (D-33). May arrive personalized by the backend. */
  title: z.string().min(1),
  message: z.string().optional(),
  /** Without `actions` the button is decorative in the demo (D-32). */
  cta: z
    .object({
      label: z.string().min(1),
      actions: TriggerSchema.optional(),
    })
    .optional(),
  variant: bottomBarVariantSchema.optional().default('brand'),
  icon: bottomBarIconSchema.optional(),
  /** Closing it is local state: it comes back on the next load. */
  isDismissible: z.boolean().optional().default(true),
});
export type BottomBarProps = z.infer<typeof bottomBarPropsSchema>;
