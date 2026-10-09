'use client';

import { useState, useTransition } from 'react';

import type { VariantId, VariantSummary } from '@/lib/data';
import { assignVariantAction } from './actions';
import { variantBadge } from './variant-styles';

interface VariantSelectProps {
  userId: string;
  displayName: string;
  value: VariantId;
  variants: VariantSummary[];
}

export function VariantSelect({ userId, displayName, value, variants }: VariantSelectProps) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  const handleChange = (variantId: string) => {
    setSaved(false);
    startTransition(async () => {
      await assignVariantAction(userId, variantId);
      setSaved(true);
    });
  };

  return (
    <div className="mt-3">
      <label htmlFor={`variant-${userId}`} className="sr-only">
        Vista para {displayName}
      </label>
      {/* key={value}: once the server confirms the change, the select re-syncs. */}
      <select
        key={value}
        id={`variant-${userId}`}
        defaultValue={value}
        disabled={isPending}
        onChange={event => handleChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-border bg-white px-3 text-base font-medium disabled:opacity-60"
      >
        {variants.map(variant => (
          <option key={variant.id} value={variant.id}>
            {variantBadge[variant.id].emoji} {variant.name}
          </option>
        ))}
      </select>
      <p aria-live="polite" className="mt-2 min-h-5 text-sm text-muted-foreground">
        {isPending ? 'Guardando…' : saved ? `Listo. Pídele a ${displayName} que recargue.` : ''}
      </p>
    </div>
  );
}
