import type { VariantId } from '@/lib/data';

/**
 * One color and one emoji per view so you can tell at a glance what each
 * person sees. Panel-only: never part of the contract.
 */
export const variantBadge: Record<VariantId, { className: string; emoji: string }> = {
  guest: { className: 'bg-neutral-200 text-neutral-900', emoji: '👤' },
  'guest-signup': { className: 'bg-sky-100 text-sky-900', emoji: '🎟️' },
  logged: { className: 'bg-primary text-white', emoji: '🙂' },
  loyalty: { className: 'bg-neutral-900 text-amber-300', emoji: '⭐' },
  christmas: { className: 'bg-emerald-700 text-white', emoji: '🎄' },
  heavy: { className: 'bg-orange-500 text-white', emoji: '🔥' },
  birthday: { className: 'bg-pink-500 text-white', emoji: '🎂' },
};
