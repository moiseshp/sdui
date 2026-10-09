import { TriggerSchema } from '@/packages/bdui/schema/action';
import * as z from 'zod';

export const couponCardPropsSchema = z.object({
  title: z.string().min(1),
  /** May arrive personalized by the backend ("Moisés, usa este código..."). */
  description: z.string().optional(),
  code: z.string().min(1),
  /** Already formatted by the backend, e.g. "Válido hasta hoy 11:59 pm". */
  validUntilLabel: z.string().min(1),
  badge: z.string().optional(),
  cta: z
    .object({
      label: z.string().min(1),
      actions: TriggerSchema,
    })
    .optional(),
});
export type CouponCardProps = z.infer<typeof couponCardPropsSchema>;
