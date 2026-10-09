'use client';

import * as React from 'react';

import { useActionHandler } from '@/packages/bdui/hooks/use-action-handler';
import { Button } from '@/packages/ui/button';
import { cn } from '@/packages/utils/cn';
import { BellIcon, GiftIcon, MapPinIcon, WarningIcon, XIcon, type Icon } from '@phosphor-icons/react';
import { cva } from 'class-variance-authority';
import type { BottomBarIcon, BottomBarProps } from './schema';

/** Semantic icon → this platform's icon set. */
const icons: Record<BottomBarIcon, Icon> = {
  gift: GiftIcon,
  'map-pin': MapPinIcon,
  warning: WarningIcon,
  bell: BellIcon,
};

/** Semantic variant → this platform's tokens (D-60). `brand` follows the screen theme. */
const surfaceVariants = cva('flex items-center gap-3 rounded-2xl p-3 shadow-xl', {
  variants: {
    variant: {
      brand: 'bg-primary text-primary-foreground',
      dark: 'bg-foreground text-white',
      warning: 'bg-amber-100 text-amber-950 ring-1 ring-amber-400',
    },
  },
  defaultVariants: { variant: 'brand' },
});

const ctaVariants = cva('h-10 shrink-0 px-4 font-bold', {
  variants: {
    variant: {
      brand: 'bg-white text-foreground hover:bg-white/90',
      dark: 'bg-primary text-primary-foreground',
      warning: 'bg-amber-950 text-amber-50',
    },
  },
  defaultVariants: { variant: 'brand' },
});

/**
 * Bottom bar (Screen v1.2 `bottomBar` slot, D-64).
 *
 * The client doesn't know which initiative it is showing (sign up, address,
 * incident...): the backend picks the winner and sends its props. If the
 * payload has no `bottomBar`, nothing is rendered.
 */
export function BottomBar({ title, message, cta, variant, icon, isDismissible }: BottomBarProps) {
  const { handleActions } = useActionHandler();
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) return null;

  const IconComponent = icon ? icons[icon] : null;

  return (
    <>
      {/* Spacer so the fixed bar never covers the end of the body. */}
      <div aria-hidden="true" className="h-28" />
      <aside
        data-slot="bottom-bar"
        aria-label={title}
        className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:max-w-sm"
      >
        <div className={cn(surfaceVariants({ variant }))}>
          {IconComponent && <IconComponent className="size-7 shrink-0" weight="fill" />}
          <div className="min-w-0 flex-1">
            <p className="text-sm leading-tight font-bold">{title}</p>
            {message && <p className="mt-0.5 text-xs leading-snug opacity-90">{message}</p>}
          </div>
          {cta && (
            <Button className={cn(ctaVariants({ variant }))} onClick={() => void handleActions(cta.actions?.onPress)}>
              {cta.label}
            </Button>
          )}
          {isDismissible && (
            <Button
              variant="ghost"
              size="icon"
              className="-mr-1 shrink-0 hover:bg-black/10"
              aria-label="Cerrar"
              onClick={() => setIsVisible(false)}
            >
              <XIcon />
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}
