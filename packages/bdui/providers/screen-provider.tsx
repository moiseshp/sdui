'use client';

import { type ReactNode } from 'react';
import { ActionProvider } from './action-provider';
import type { ActionRegistry } from '../utils/action-registry';

export interface ScreenProviderProps {
  children: ReactNode;
  registry: ActionRegistry;
}

/**
 * Single entry point for wiring BDUI into a tree. Composes the three
 * contexts the renderer depends on — actions, visibility, and reporter —
 * in the correct order. Consumers should use this instead of wrapping each
 * provider manually, so additions here (future: theming, feature flags,
 * i18n locale) don't force call-site churn.
 */
export function ScreenProvider({ children, registry }: ScreenProviderProps) {
  return <ActionProvider registry={registry}>{children}</ActionProvider>;
}
