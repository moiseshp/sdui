'use client';

import * as React from 'react';

import { useActionHandler } from '@/packages/bdui/hooks/use-action-handler';
import { Button } from '@/packages/ui/button';
import { CheckIcon, ClockIcon, CopyIcon, TicketIcon } from '@phosphor-icons/react';
import type { CouponCardProps } from './schema';

export function CouponCard({ title, description, code, validUntilLabel, badge, cta }: CouponCardProps) {
  const { handleActions } = useActionHandler();
  const [copied, setCopied] = React.useState(false);

  // Local component behavior, not a contract action (D-38).
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // No clipboard permission: do nothing in the demo.
    }
  };

  return (
    <section data-slot="coupon-card" className="px-4 py-3">
      <div className="rounded-xl border-2 border-dashed border-primary bg-red-50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-primary truncate">
            <TicketIcon className="size-6" weight="fill" />
            <h2 className="text-lg font-black truncate">{title}</h2>
          </div>
          {badge && <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold tracking-wider text-white">{badge}</span>}
        </div>

        {description && <p className="mt-2 text-sm text-foreground">{description}</p>}

        <div className="mt-4 flex items-center justify-between gap-2 rounded-lg bg-white px-3 py-2">
          <span className="font-mono text-xl font-black tracking-widest text-primary">{code}</span>
          <Button variant="outline" size="sm" onClick={handleCopy} aria-label="Copiar código">
            {copied ? <CheckIcon /> : <CopyIcon />}
            {copied ? '¡Copiado!' : 'Copiar'}
          </Button>
        </div>

        <p className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
          <ClockIcon />
          {validUntilLabel}
        </p>

        {cta && (
          <Button className="mt-3 w-full" size="lg" onClick={() => void handleActions(cta.actions.onPress)}>
            {cta.label}
          </Button>
        )}
      </div>
    </section>
  );
}
