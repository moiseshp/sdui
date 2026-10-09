import * as z from 'zod';
import { headerPositionSchema, headerVariantSchema } from '../header-default/schema';

export const headerGreetingPropsSchema = z.object({
  /** Already interpolated by the backend, e.g. "¡Hola, Moisés!". */
  title: z.string().min(1),
  subtitle: z.string().optional(),
  position: headerPositionSchema.optional().default('sticky'),
  variant: headerVariantSchema.optional().default('default'),
});
export type HeaderGreetingProps = z.infer<typeof headerGreetingPropsSchema>;
