'use client';

import { cn } from '@/packages/utils/cn';
import { HeaderTopBar, headerSurfaceVariants, headerVariants } from '../header-default';
import type { HeaderGreetingProps } from './schema';

/**
 * Greeting header. The client doesn't know there is personalization: it just
 * renders `title` and `subtitle` exactly as the backend sends them.
 * It shares the `variant` set with `header_default` (D-60).
 */
export function HeaderGreeting({ title, subtitle, position, variant }: HeaderGreetingProps) {
  return (
    <header data-slot="header-greeting" className={cn(headerVariants({ position }))}>
      <div className={cn(headerSurfaceVariants({ variant }), 'pb-5')}>
        <HeaderTopBar variant={variant} />
        <p className="mt-2 text-3xl font-black tracking-tight">{title}</p>
        {subtitle && <p className="mt-1 text-sm font-medium opacity-90">{subtitle}</p>}
      </div>
    </header>
  );
}
