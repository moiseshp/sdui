'use client';

import * as React from 'react';

import { Button } from '@/packages/ui/button';
import { cn } from '@/packages/utils/cn';
import { XIcon } from '@phosphor-icons/react';
import { cva } from 'class-variance-authority';
import type { AnnouncementBarProps } from './schema';

// Semantic variants (D-60, D-62): the contract says `dark` or `light`; this
// client maps them to its own tokens.
const announcementBarVariants = cva('flex w-full items-center justify-between gap-2 px-4 py-2 text-sm font-medium', {
  variants: {
    variant: {
      dark: 'bg-secondary-foreground text-secondary',
      light: 'bg-secondary text-secondary-foreground',
    },
  },
  defaultVariants: { variant: 'dark' },
});

/** If the section is in the payload, it shows. Dismissing it is local state. */
export function AnnouncementBar({ message, variant, isDismissible }: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) return null;

  return (
    <div data-slot="announcement-bar" role="status" className={cn(announcementBarVariants({ variant }))}>
      <p>{message}</p>
      {isDismissible && (
        <Button className="-mr-2" variant="ghost" size="icon" aria-label="Cerrar anuncio" onClick={() => setIsVisible(false)}>
          <XIcon />
        </Button>
      )}
    </div>
  );
}
