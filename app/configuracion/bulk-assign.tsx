'use client';

import { useTransition } from 'react';

import type { VariantSummary } from '@/lib/data';
import { cn } from '@/packages/utils/cn';
import { assignAllAction } from './actions';
import { variantBadge } from './variant-styles';

interface BulkAssignProps {
  variants: VariantSummary[];
  hasUsers: boolean;
}

/**
 * One shortcut per view for every segment at once: "Todos a 🙂 Logeado", ...
 * "Todos a Logeado" doubles as rollback (D-66, D-69). The panel only passes
 * views for signed-in people (D-81).
 */
export function BulkAssign({ variants, hasUsers }: BulkAssignProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="mt-6">
      <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Asignar a todos los segmentos</p>
      <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {variants.map(variant => (
          <button
            key={variant.id}
            type="button"
            disabled={isPending || !hasUsers}
            onClick={() => startTransition(() => assignAllAction(variant.id))}
            className={cn(
              'h-11 truncate rounded-lg px-2 text-sm font-bold transition-opacity disabled:opacity-40',
              variantBadge[variant.id].className,
            )}
          >
            {variantBadge[variant.id].emoji} Todos a {variant.name}
          </button>
        ))}
      </div>
      <p aria-live="polite" className="mt-2 min-h-5 text-sm text-muted-foreground">
        {isPending ? 'Asignando…' : ''}
      </p>
    </div>
  );
}
