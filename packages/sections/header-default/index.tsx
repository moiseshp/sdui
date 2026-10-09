'use client';

import { Button } from '@/packages/ui/button';
import { cn } from '@/packages/utils/cn';
import { MagnifyingGlassIcon, ShoppingCartIcon } from '@phosphor-icons/react';
import { cva } from 'class-variance-authority';
import type { HeaderDefaultProps, HeaderVariant } from './schema';

// [DEMO] The brand (logo) is not part of the contract: it is local app config,
// like an asset in native. The contract only decides which header to show (D-36, D-77).
import appConfig from '@/config/app-config.json';

export const brandLogo = appConfig.brand.logo;

export const headerVariants = cva('w-full', {
  variants: {
    position: {
      static: 'relative',
      sticky: 'sticky top-0 z-50',
    },
  },
  defaultVariants: { position: 'sticky' },
});

/**
 * Header surface. The contract sends a semantic `variant`; this client maps it
 * to its own tokens (`--primary`, `--foreground` in app/globals.css). Another platform
 * would map the same variant to its own theme (D-60).
 */
export const headerSurfaceVariants = cva('px-4 text-white', {
  variants: {
    variant: {
      default: 'bg-primary',
      dark: 'bg-foreground',
    },
  },
  defaultVariants: { variant: 'default' },
});

/** Top bar shared by both headers: logo + actions. */
export function HeaderTopBar({ variant }: { variant?: HeaderVariant }) {
  // The action buttons are primary-colored, which blends into the default (red)
  // bar. On a dark bar they would show up as red squares, so they go transparent.
  const actionClassName = variant === 'dark' ? 'bg-transparent hover:bg-white/10' : undefined;

  return (
    <div className="flex h-14 items-center justify-between">
      <img src={brandLogo.defaultUrl} alt={brandLogo.alt} />
      <nav className="flex items-center gap-2">
        <Button size="icon-lg" aria-label="Buscar" className={actionClassName}>
          <MagnifyingGlassIcon className="size-6" />
        </Button>
        <Button size="icon-lg" aria-label="Carrito" className={actionClassName}>
          <ShoppingCartIcon className="size-6" />
        </Button>
      </nav>
    </div>
  );
}

export function HeaderDefault({ position, variant }: HeaderDefaultProps) {
  return (
    <header data-slot="header-default" className={cn(headerVariants({ position }))}>
      <div className={headerSurfaceVariants({ variant })}>
        <HeaderTopBar variant={variant} />
      </div>
    </header>
  );
}
