'use client';

import { useState, useTransition } from 'react';

import type { InitiativeSummary } from '@/lib/data';
import { setInitiativeEnabledAction } from './actions';
import { Switch } from './switch';

interface InitiativeToggleProps {
  initiative: InitiativeSummary;
  /** Already resolved by the page: "Todas las vistas" or the view names. */
  audienceLabel: string;
}

/** On/off switch for one bottom bar initiative (feature flag, D-64). */
export function InitiativeToggle({ initiative, audienceLabel }: InitiativeToggleProps) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const { id, name, description, priority, enabled } = initiative;

  const handleToggle = () => {
    setSaved(false);
    startTransition(async () => {
      await setInitiativeEnabledAction(id, !enabled);
      setSaved(true);
    });
  };

  return (
    <li className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-sm font-black">
          P{priority}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-bold">{name}</p>
          <p className="text-sm text-muted-foreground">{description}</p>
          <p className="mt-1 text-xs font-medium text-muted-foreground">Para: {audienceLabel}</p>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={() => handleToggle()}
          aria-label={`${enabled ? 'Apagar' : 'Prender'} ${name}`}
          disabled={isPending}
        />
      </div>
      <p aria-live="polite" className="mt-2 min-h-5 text-sm text-muted-foreground">
        {isPending ? 'Guardando…' : saved ? `Listo: ${enabled ? 'prendida' : 'apagada'}. Pide a la sala que recargue.` : ''}
      </p>
    </li>
  );
}
