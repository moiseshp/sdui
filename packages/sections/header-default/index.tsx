'use client';

import { usePressHandler } from '@/packages/bdui/hooks/use-press-handler';
import { Button } from '@/packages/ui/button';
import { cn } from '@/packages/utils/cn';
import { UserSwitchIcon, ShoppingCartIcon, SlidersIcon, type Icon } from '@phosphor-icons/react';
import { cva } from 'class-variance-authority';
import type { HeaderActions, HeaderDefaultProps, HeaderVariant } from './schema';

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

/** Semantic button name (contract key) → this platform's label and icon. */
const topBarButtons: { key: keyof HeaderActions; label: string; icon: Icon }[] = [
  { key: 'user', label: 'Usuario', icon: UserSwitchIcon },
  { key: 'settings', label: 'Configuración', icon: SlidersIcon },
  { key: 'cart', label: 'Carrito', icon: ShoppingCartIcon },
];

export interface HeaderTopBarProps {
  variant?: HeaderVariant;
  /** What each button does comes from the contract. Without actions, the button is decorative (D-32). */
  actions?: HeaderActions;
}

/** Top bar shared by both headers: logo + actions. */
export function HeaderTopBar({ variant, actions }: HeaderTopBarProps) {
  const bindPress = usePressHandler();

  // The action buttons are primary-colored, which blends into the default (red)
  // bar. On a dark bar they would show up as red squares, so they go transparent.
  const actionClassName = variant === 'dark' ? 'bg-transparent hover:bg-white/10' : undefined;

  return (
    <div className="flex h-14 items-center justify-between">
      <img src={brandLogo.defaultUrl} alt={brandLogo.alt} />
      <nav className="flex items-center gap-2">
        {topBarButtons.map(({ key, label, icon: IconComponent }) => {
          const { onPress } = bindPress(actions?.[key]);
          return (
            <Button key={key} size="icon-lg" aria-label={label} className={actionClassName} onClick={onPress}>
              <IconComponent className="size-6" />
            </Button>
          );
        })}
      </nav>
    </div>
  );
}

export function HeaderDefault({ position, variant, actions }: HeaderDefaultProps) {
  return (
    <header data-slot="header-default" className={cn(headerVariants({ position }))}>
      <div className={headerSurfaceVariants({ variant })}>
        <HeaderTopBar variant={variant} actions={actions} />
      </div>
    </header>
  );
}
