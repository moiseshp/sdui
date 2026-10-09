import * as React from 'react';

import { cn } from '@/packages/utils/cn';

/** Base input. `text-base` prevents iOS from auto-zooming on focus. */
function Input({ className, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      data-slot="input"
      className={cn(
        'h-12 w-full rounded-lg border border-border bg-white px-3 text-base outline-none transition-colors',
        'placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20',
        'aria-invalid:border-primary disabled:opacity-60',
        className,
      )}
      {...props}
    />
  );
}

export { Input };
