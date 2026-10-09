'use client';

import * as React from 'react';

import { Switch as SwitchPrimitive } from 'radix-ui';

import { cn } from '@/packages/utils/cn';

/**
 * [DEMO] On/off switch of the presenter panel. Panel-only, so it lives here and
 * not in `packages/` (only what BDUI renders goes there, D-79). Shared by the
 * bottom bar initiatives and the section editor so both look and behave the
 * same. Built on Radix Switch (`role="switch"`, keyboard support).
 * Always give it an accessible name (`aria-label` or a linked `<label>`).
 */
function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'relative h-7 w-12 shrink-0 cursor-pointer rounded-full transition-colors outline-none',
        'focus-visible:ring-3 focus-visible:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60',
        'data-[state=checked]:bg-primary data-[state=unchecked]:bg-neutral-300',
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none absolute top-1 left-1 block size-5 rounded-full bg-white shadow transition-transform data-[state=checked]:translate-x-5"
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
