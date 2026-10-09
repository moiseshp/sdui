import * as z from 'zod';

export const announcementBarPropsSchema = z.object({
  /** Plain text (no HTML, D-33). */
  message: z.string().min(1),
  /** Semantic look (D-60, D-62): `dark` = dark bar, `light` = light bar. */
  variant: z.enum(['dark', 'light']).optional().default('dark'),
  isDismissible: z.boolean().optional().default(false),
});
export type AnnouncementBarProps = z.infer<typeof announcementBarPropsSchema>;
