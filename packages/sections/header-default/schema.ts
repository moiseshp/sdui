import { TriggerSchema } from '@/packages/bdui/schema/action';
import * as z from 'zod';

export const headerPositionSchema = z.enum(['static', 'sticky']);
/**
 * Semantic look of the header (D-60). The contract sends intent, never raw
 * colors: each platform maps the variant to its own tokens.
 * `default` = brand (red) bar, `dark` = black bar.
 */
export const headerVariantSchema = z.enum(['default', 'dark']);
export type HeaderVariant = z.infer<typeof headerVariantSchema>;

/**
 * Triggers of the top bar buttons, keyed by semantic button name. The backend
 * decides what each button does (e.g. `NAVIGATE` to `/ingresar`); the client
 * only fires `onPress`. A button without actions is decorative (D-32).
 * Shared by `header_default` and `header_greeting`.
 */
export const headerActionsSchema = z.object({
  user: TriggerSchema.optional(),
  settings: TriggerSchema.optional(),
  cart: TriggerSchema.optional(),
});
export type HeaderActions = z.infer<typeof headerActionsSchema>;

export const headerDefaultPropsSchema = z.object({
  position: headerPositionSchema.optional().default('sticky'),
  variant: headerVariantSchema.optional().default('default'),
  actions: headerActionsSchema.optional(),
});
export type HeaderDefaultProps = z.infer<typeof headerDefaultPropsSchema>;
