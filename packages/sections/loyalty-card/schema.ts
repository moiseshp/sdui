import * as z from 'zod';

export const loyaltyCardPropsSchema = z.object({
  /** e.g. "Club Gold". */
  tierLabel: z.string().min(1),
  /** Already formatted by the backend, e.g. "2,450 pts". */
  pointsLabel: z.string().min(1),
  /** Progress to the next tier, 0–100. */
  progress: z.number().min(0).max(100),
  /** e.g. "Te faltan 550 puntos para subir a Platinum." */
  progressLabel: z.string().optional(),
});
export type LoyaltyCardProps = z.infer<typeof loyaltyCardPropsSchema>;
