'use client';

import { StarIcon } from '@phosphor-icons/react';
import type { LoyaltyCardProps } from './schema';

/**
 * Loyalty program status. Points and labels arrive already formatted:
 * the client doesn't compute tiers or progress (D-12).
 * Uses the `highlight` token, which each screen theme redefines (D-63).
 */
export function LoyaltyCard({ tierLabel, pointsLabel, progress, progressLabel }: LoyaltyCardProps) {
  return (
    <section data-slot="loyalty-card" className="px-4 py-3">
      <div className="rounded-2xl bg-foreground p-4 text-white">
        <div className="flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full border border-highlight px-3 py-1 text-xs font-bold text-highlight">
            <StarIcon weight="fill" />
            {tierLabel}
          </span>
          <span className="text-2xl font-black text-highlight">{pointsLabel}</span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={progressLabel ?? tierLabel}
          className="mt-4 h-2 overflow-hidden rounded-full bg-white/15"
        >
          <div className="h-full rounded-full bg-highlight" style={{ width: `${progress}%` }} />
        </div>
        {progressLabel && <p className="mt-2 text-sm opacity-80">{progressLabel}</p>}
      </div>
    </section>
  );
}
