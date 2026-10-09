import { TriggerSchema } from '@/packages/bdui/schema/action';
import * as z from 'zod';

export const featuredProductSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().optional(),
  imageUrl: z.url().optional(),
  price: z.string().min(1).optional(),
  originalPrice: z.string().min(1).optional(),
  badge: z.string().optional(),
  actions: TriggerSchema.optional(),
});
export type FeaturedProduct = z.infer<typeof featuredProductSchema>;

export const ctaSchema = z.object({
  label: z.string().min(1),
  actions: TriggerSchema,
});
export type CTAItem = z.infer<typeof ctaSchema>;

export const featuredProductsPropsSchema = z.object({
  title: z.string().optional(),
  layout: z.enum(['carousel', 'grid']).optional(),
  variant: z.enum(['default', 'compact']).optional(),
  items: z.array(featuredProductSchema).min(1),
  cta: ctaSchema.optional(),
});
export type FeaturedProductsProps = z.infer<typeof featuredProductsPropsSchema>;
