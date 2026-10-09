'use client';

import { useState, useTransition, type DragEvent } from 'react';

import { Button } from '@/packages/ui/button';
import { cn } from '@/packages/utils/cn';
import { DotsSixVerticalIcon, LockSimpleIcon } from '@phosphor-icons/react';
import { reorderSectionsAction } from '../actions';
import type { SectionCard } from './section-labels';

interface SectionOrderEditorProps {
  variantId: string;
  /** Friendly name of the header slot, or `null` if the view has none. */
  header: string | null;
  sections: SectionCard[];
}

type Status = 'idle' | 'saved' | 'error';

/**
 * Drag-and-drop order editor for one view (D-74). Desktop-only and
 * presenter-only (D-75), so it uses the browser's native drag and drop: no
 * dependencies. Only the section ids are sent to the backend.
 */
export function SectionOrderEditor({ variantId, header, sections }: SectionOrderEditorProps) {
  const [saved, setSaved] = useState(sections);
  const [items, setItems] = useState(sections);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [isPending, startTransition] = useTransition();

  const isDirty = items.some((item, index) => item.id !== saved[index]?.id);

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
    setStatus('idle');
  };

  const handleSave = () => {
    setStatus('idle');
    startTransition(async () => {
      try {
        await reorderSectionsAction(
          variantId,
          items.map(item => item.id),
        );
        setSaved(items);
        setStatus('saved');
      } catch {
        setStatus('error');
      }
    });
  };

  return (
    <>
      <ol className="mt-5 flex flex-col gap-2">
        {header && <LockedRow title={header} note="Slot fijo: siempre va arriba" />}

        {items.map((item, index) => (
          <li
            key={item.id}
            draggable
            onDragStart={event => {
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData('text/plain', item.id); // Firefox only starts a drag with data set
              setDraggingId(item.id);
            }}
            onDragOver={event => handleDragOver(event, item.id)}
            onDrop={event => event.preventDefault()}
            onDragEnd={() => setDraggingId(null)}
            className={cn(
              'flex cursor-grab items-center gap-3 rounded-xl bg-white p-3 shadow-sm transition-opacity active:cursor-grabbing',
              draggingId === item.id && 'opacity-40 ring-2 ring-primary',
            )}
          >
            <DotsSixVerticalIcon aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
            <span className="w-5 shrink-0 text-center text-sm font-black text-muted-foreground">{index + 1}</span>
            {item.thumbnail ? (
              // draggable={false}: otherwise the browser drags the image instead of the card.
              <img src={item.thumbnail} alt="" draggable={false} className="size-14 shrink-0 rounded-lg object-cover" />
            ) : (
              <div aria-hidden="true" className="size-14 shrink-0 rounded-lg bg-muted" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-wider text-primary">{item.typeLabel}</p>
              {item.summary && <p className="truncate text-sm font-medium">{item.summary}</p>}
            </div>
          </li>
        ))}

        <LockedRow title="Bottom bar" note="La decide una iniciativa: aparece solo si hay una prendida" />
      </ol>

      <div className="mt-5 flex items-center gap-4">
        <Button size="lg" disabled={!isDirty || isPending} onClick={handleSave}>
          {isPending ? 'Guardando…' : 'Guardar orden'}
        </Button>
        <p aria-live="polite" className={cn('text-sm', status === 'error' ? 'font-medium text-primary' : 'text-muted-foreground')}>
          {status === 'saved' && 'Guardado. Quien tenga esta vista verá el nuevo orden al recargar.'}
          {status === 'error' && 'No se pudo guardar. Revisa la conexión e inténtalo de nuevo.'}
        </p>
      </div>
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
