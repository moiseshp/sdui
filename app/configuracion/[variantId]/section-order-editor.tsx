'use client';

import { useState, useTransition, type DragEvent } from 'react';

import { Button } from '@/packages/ui/button';
import { cn } from '@/packages/utils/cn';
import { DotsSixVerticalIcon, EyeSlashIcon, LockSimpleIcon } from '@phosphor-icons/react';
import { reorderSectionsAction } from '../actions';
import { Switch } from '../switch';
import type { SectionCard } from './section-labels';

interface SectionOrderEditorProps {
  variantId: string;
  /** Friendly name of the header slot, or `null` if the view has none. */
  header: string | null;
  sections: SectionCard[];
  /** Sections currently hidden in the view (D-78). */
  hiddenSectionIds: string[];
}

type Status = { tone: 'success' | 'error'; message: string } | null;

const sameIds = (a: string[], b: string[]) => a.length === b.length && a.every(id => b.includes(id));

/**
 * Section editor for one view: order (D-74) and visibility (D-78).
 * Desktop-only and presenter-only (D-75), so it uses the browser's native drag
 * and drop: no dependencies.
 *
 * Dragging and the switches only change the draft. Nothing is sent until
 * «Guardar cambios», so the presenter can explain each step before saving.
 * One save = one call to `reorderSections` with the order and the hidden ids
 * (only ids travel to the backend).
 */
export function SectionOrderEditor({ variantId, header, sections, hiddenSectionIds }: SectionOrderEditorProps) {
  const [saved, setSaved] = useState({ order: sections, hidden: hiddenSectionIds });
  const [items, setItems] = useState(sections);
  const [hidden, setHidden] = useState(hiddenSectionIds);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [isPending, startTransition] = useTransition();

  const isOrderDirty = items.some((item, index) => item.id !== saved.order[index]?.id);
  const isVisibilityDirty = !sameIds(hidden, saved.hidden);
  const isDirty = isOrderDirty || isVisibilityDirty;

  const handleDragOver = (event: DragEvent<HTMLLIElement>, overId: string) => {
    event.preventDefault(); // required so the browser allows the drop
    if (!draggingId || draggingId === overId) return;

    const from = items.findIndex(item => item.id === draggingId);
    const to = items.findIndex(item => item.id === overId);
    if (from < 0 || to < 0) return;

    // Swap only once the pointer crosses the middle of the target card: avoids
    // flickering between cards of different heights.
    const rect = event.currentTarget.getBoundingClientRect();
    const middle = rect.top + rect.height / 2;
    if ((from < to && event.clientY < middle) || (from > to && event.clientY > middle)) return;

    setItems(current => {
      const source = current.findIndex(item => item.id === draggingId);
      const target = current.findIndex(item => item.id === overId);
      if (source < 0 || target < 0 || source === target) return current;

      const next = [...current];
      const [moved] = next.splice(source, 1);
      next.splice(target, 0, moved);
      return next;
    });
    setStatus(null);
  };

  /** Draft only: nothing is sent until «Guardar cambios». */
  const handleToggle = (id: string, isVisible: boolean) => {
    setHidden(current => (isVisible ? current.filter(hiddenId => hiddenId !== id) : [...current, id]));
    setStatus(null);
  };

  const handleSave = () => {
    setStatus(null);
    startTransition(async () => {
      try {
        const result = await reorderSectionsAction(
          variantId,
          items.map(item => item.id),
          hidden,
        );
        setSaved({ order: items, hidden: result.hiddenSectionIds });
        setHidden(result.hiddenSectionIds);
        setStatus({ tone: 'success', message: 'Guardado. Quien tenga esta vista verá los cambios al recargar.' });
      } catch {
        setStatus({ tone: 'error', message: 'No se pudo guardar. Revisa la conexión e inténtalo de nuevo.' });
      }
    });
  };

  const pendingLabel = [isOrderDirty && 'orden', isVisibilityDirty && 'visibilidad'].filter(Boolean).join(' y ');

  return (
    <>
      <ol className="mt-5 flex flex-col gap-2">
        {header && <LockedRow title={header} note="Slot fijo: siempre va arriba" />}

        {items.map((item, index) => {
          const isHidden = hidden.includes(item.id);
          return (
            <li
              key={item.id}
              draggable={!isPending}
              onDragStart={event => {
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', item.id); // Firefox only starts a drag with data set
                setDraggingId(item.id);
              }}
              onDragOver={event => handleDragOver(event, item.id)}
              onDrop={event => event.preventDefault()}
              onDragEnd={() => setDraggingId(null)}
              className={cn(
                'flex cursor-grab items-center gap-3 rounded-xl p-3 shadow-sm transition-opacity active:cursor-grabbing',
                isHidden ? 'bg-white/60' : 'bg-white',
                draggingId === item.id && 'opacity-40 ring-2 ring-primary',
              )}
            >
              <DotsSixVerticalIcon aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
              <span className="w-5 shrink-0 text-center text-sm font-black text-muted-foreground">{index + 1}</span>
              <div className={cn('flex min-w-0 flex-1 items-center gap-3', isHidden && 'opacity-50 grayscale')}>
                {item.thumbnail ? (
                  // draggable={false}: otherwise the browser drags the image instead of the card.
                  <img src={item.thumbnail} alt="" draggable={false} className="size-14 shrink-0 rounded-lg object-cover" />
                ) : (
                  <div aria-hidden="true" className="size-14 shrink-0 rounded-lg bg-muted" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
                    {item.typeLabel}
                    {isHidden && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[0.65rem] text-muted-foreground">
                        <EyeSlashIcon aria-hidden="true" />
                        Oculta
                      </span>
                    )}
                  </p>
                  {item.summary && <p className="truncate text-sm font-medium">{item.summary}</p>}
                </div>
              </div>
              <Switch
                checked={!isHidden}
                onCheckedChange={isVisible => handleToggle(item.id, isVisible)}
                disabled={isPending}
                aria-label={`${isHidden ? 'Mostrar' : 'Ocultar'} ${item.typeLabel}${item.summary ? `: ${item.summary}` : ''}`}
              />
            </li>
          );
        })}

        <LockedRow title="Bottom bar" note="La decide una iniciativa: aparece solo si hay una prendida" />
      </ol>

      <div className="mt-5 flex items-center gap-4">
        <Button size="lg" disabled={!isDirty || isPending} onClick={handleSave}>
          {isPending ? 'Guardando…' : 'Guardar cambios'}
        </Button>
        <p aria-live="polite" className={cn('text-sm', status?.tone === 'error' ? 'font-medium text-primary' : 'text-muted-foreground')}>
          {status?.message ?? (isDirty ? `Cambios sin guardar: ${pendingLabel}.` : '')}
        </p>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Arrastrar y los interruptores solo preparan el cambio; nada llega a la Home hasta «Guardar cambios». Una sección oculta
        conserva su lugar.
      </p>
    </>
  );
}

/** Slots that are not part of the ordered body: shown for context, not draggable. */
function LockedRow({ title, note }: { title: string; note: string }) {
  return (
    <li className="flex items-center gap-3 rounded-xl border-2 border-dashed border-border bg-white/60 p-3 text-muted-foreground">
      <LockSimpleIcon aria-hidden="true" className="size-5 shrink-0" />
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider">{title}</p>
        <p className="text-sm">{note}</p>
      </div>
    </li>
  );
}
