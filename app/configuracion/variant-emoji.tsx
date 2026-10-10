import type { VariantId } from '@/lib/data';
import { cn } from '@/packages/utils/cn';
import { variantBadge } from './variant-styles';

const sizes = {
  sm: 'size-7 text-sm',
  md: 'size-10 text-lg',
};

interface VariantEmojiProps {
  variantId: VariantId;
  size?: keyof typeof sizes;
  /** Accessible name. Without it the circle is decorative (the view name is next to it). */
  label?: string;
}

/** Colored circle with the view's emoji: the panel's visual key for each view. */
export function VariantEmoji({ variantId, size = 'md', label }: VariantEmojiProps) {
  const badge = variantBadge[variantId];
  return (
    <span
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      className={cn('flex shrink-0 items-center justify-center rounded-full', sizes[size], badge.className)}
    >
      {badge.emoji}
    </span>
  );
}
