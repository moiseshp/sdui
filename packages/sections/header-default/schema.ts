import * as z from 'zod';

export const headerPositionSchema = z.enum(['static', 'sticky']);
/**
 * Semantic look of the header (D-60). The contract sends intent, never raw
 * colors: each platform maps the variant to its own tokens.
 * `default` = brand (red) bar, `dark` = black bar.
 */
export const headerVariantSchema = z.enum(['default', 'dark']);
export type HeaderVariant = z.infer<typeof headerVariantSchema>;

export const headerDefaultPropsSchema = z.object({
  position: headerPositionSchema.optional().default('sticky'),
  variant: headerVariantSchema.optional().default('default'),
});
export type HeaderDefaultProps = z.infer<typeof headerDefaultPropsSchema>;
