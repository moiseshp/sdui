import { TriggerSchema } from '@/packages/bdui/schema/action';
import * as z from 'zod';

export const daypartMenuItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  imageUrl: z.url().optional(),
  /** Price already formatted by the backend. */
  price: z.string().optional(),
  actions: TriggerSchema.optional(),
});
export type DaypartMenuItem = z.infer<typeof daypartMenuItemSchema>;

export const daypartMenuPropsSchema = z.object({
  title: z.string().min(1),
  /** The backend picks the time slot; the client only displays it. */
  daypartLabel: z.string().min(1),
  storeLabel: z.string().optional(),
  items: z.array(daypartMenuItemSchema).min(1),
});
export type DaypartMenuProps = z.infer<typeof daypartMenuPropsSchema>;
