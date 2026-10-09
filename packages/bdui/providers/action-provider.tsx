'use client';

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { ActionRegistry } from '../utils/action-registry';

const ActionRegistryContext = createContext<ActionRegistry | null>(null);

export interface ActionProviderProps {
  children: ReactNode;
  /**
   * Map of action type → handler. Use `createActionRegistry` at the call site
   * so TypeScript can infer per-action payload types precisely.
   */
  registry: ActionRegistry;
}

export function ActionProvider({ children, registry }: ActionProviderProps) {
  // Stabilize the context value so consumers don't re-render when the parent
  // re-renders with a structurally equal registry literal.
  const stable = useMemo(() => registry, [registry]);

  return <ActionRegistryContext.Provider value={stable}>{children}</ActionRegistryContext.Provider>;
}

const NOOP_HANDLER = { handleActions: () => Promise.resolve() };

/**
 * Access the ActionRegistry from context. Returns a no-op handler if no
 * `ActionProvider` wraps the current tree.
 */

export function useActionRegistry(): ActionRegistry {
  const ctx = useContext(ActionRegistryContext);
  if (!ctx) {
    return NOOP_HANDLER;
  }
  return ctx;
}
