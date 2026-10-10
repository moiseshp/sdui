'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';

import type { VariantId, VariantSummary } from '@/lib/data';
import { Button } from '@/packages/ui/button';
import { cn } from '@/packages/utils/cn';
import { setAnonymousVariantAction } from './actions';
import { VariantEmoji } from './variant-emoji';

interface AnonymousVariantPickerProps {
  /** Only views meant for people without a session. */
  variants: VariantSummary[];
  activeId: VariantId;
}

/**
 * Picks which view EVERY visitor without a session sees (D-81). It is a switch,
 * not an A/B split: everyone sees the same one. Saves on click, like the
 * bottom bar switches: it is a single, self-explanatory step.
 */
export function AnonymousVariantPicker({ variants, activeId }: AnonymousVariantPickerProps) {
  const [isPending, startTransition] = useTransition();
  const [pendingId, setPendingId] = useState<VariantId | null>(null);
  const [savedName, setSavedName] = useState<string | null>(null);

  const handleActivate = (variant: VariantSummary) => {
    setSavedName(null);
    setPendingId(variant.id);
    startTransition(async () => {
      await setAnonymousVariantAction(variant.id);
      setSavedName(variant.name);
      setPendingId(null);
    });
  };

  return (
    <>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {variants.map(variant => {
          const isActive = variant.id === activeId;
          return (
            <li
              key={variant.id}
              className={cn(
                'flex flex-col rounded-2xl bg-white p-4 shadow-sm ring-2 transition-shadow',
                isActive ? 'ring-primary' : 'ring-transparent',
              )}
            >
              <div className="flex flex-1 items-start gap-3">
                <VariantEmoji variantId={variant.id} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-bold">{variant.name}</p>
                  <p className="mt-0.5 text-sm text-muted-foreground">{variant.description}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                {isActive ? (
                  <span className="inline-flex h-7 items-center gap-1.5 rounded-full bg-primary/10 px-2.5 text-xs font-bold text-primary">
                    <span aria-hidden="true" className="size-2 rounded-full bg-primary" />
                    La ven ahora
                  </span>
                ) : (
                  <Button size="sm" variant="outline" disabled={isPending} onClick={() => handleActivate(variant)}>
                    {pendingId === variant.id ? 'Cambiando…' : 'Mostrar esta vista'}
                  </Button>
                )}
                <Link href={`/configuracion/${variant.id}`} className="text-xs font-bold text-primary hover:underline">
                  Ordenar y ocultar secciones →
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
      <p aria-live="polite" className="mt-2 min-h-5 text-sm text-muted-foreground">
        {isPending
          ? 'Guardando…'
          : savedName
            ? `Listo: quien navega sin sesión ahora ve «${savedName}». Pide a la sala que recargue.`
            : ''}
      </p>
    </>
  );
}
