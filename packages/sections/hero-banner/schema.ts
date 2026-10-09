import { TriggerSchema } from '@/packages/bdui/schema/action';
import * as z from 'zod';

export const heroBannerItemSchema = z.object({
  imageUrl: z.url(),
  alt: z.string().min(1),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  actions: TriggerSchema.optional(),
});
export type HeroBannerItem = z.infer<typeof heroBannerItemSchema>;

export const heroBannerPropsSchema = z.object({
  items: z.array(heroBannerItemSchema).min(1),
  viewportMode: z.enum(['full', 'peek']).optional().default('full'),
  showDots: z.boolean().optional().default(true),
  autoplay: z.boolean().optional().default(true),
  autoplayInterval: z.number().int().positive().optional().default(5000),
});
export type HeroBannerProps = z.infer<typeof heroBannerPropsSchema>;
