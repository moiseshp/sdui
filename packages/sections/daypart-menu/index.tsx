'use client';

import { useActionHandler } from '@/packages/bdui/hooks/use-action-handler';
import { cn } from '@/packages/utils/cn';
import { ClockIcon, StorefrontIcon } from '@phosphor-icons/react';
import type { DaypartMenuProps } from './schema';

/**
 * Menu by time of day. Uses container queries: the grid grows with the width
 * the layout provides (2 columns on a phone, 3–4 in kiosk). The section doesn't
 * know which layout it is in (D-37).
 */
export function DaypartMenu({ title, daypartLabel, storeLabel, items }: DaypartMenuProps) {
  const { handleActions } = useActionHandler();

  return (
    <section data-slot="daypart-menu" className="@container px-4 py-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
          <ClockIcon weight="bold" />
          {daypartLabel}
        </span>
        {storeLabel && (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <StorefrontIcon />
            {storeLabel}
          </span>
        )}
      </div>

      <h2 className="mb-3 text-2xl font-black tracking-tight @3xl:text-4xl">{title}</h2>

      <div className="grid grid-cols-2 gap-3 @2xl:grid-cols-3 @4xl:grid-cols-4">
        {items.map(item => {
          const onPress = item.actions?.onPress;
          const isClickable = !!onPress?.length;
          return (
            <button
              key={item.id}
              type="button"
              disabled={!isClickable}
              onClick={() => isClickable && void handleActions(onPress)}
              className={cn('overflow-hidden rounded-xl border border-secondary bg-white text-left shadow-sm', isClickable && 'cursor-pointer')}
            >
              {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="aspect-square w-full object-cover" />}
              <div className="p-3">
                <h3 className="line-clamp-2 text-sm font-bold @3xl:text-base truncate">{item.name}</h3>
                {item.price && <p className="mt-1 text-lg font-black text-primary">{item.price}</p>}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
