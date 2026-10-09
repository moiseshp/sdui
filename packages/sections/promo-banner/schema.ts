import { TriggerSchema } from '@/packages/bdui/schema/action';
import * as z from 'zod';

export const promoBannerPropsSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
  backgroundColor: z.string().optional(),
  textColor: z.string().optional(),
  badge: z.string().optional(),
  actions: TriggerSchema.optional(),
});

export type PromoBannerProps = z.infer<typeof promoBannerPropsSchema>;
