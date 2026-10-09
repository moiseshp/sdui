import { useEffect } from 'react';
import { useActionHandler } from './use-action-handler';
import type { Screen } from '../schema/screen';

/**
 * Hook to fire screen-level `onMount` triggers.
 * @param screen The screen to fire triggers for.
 */
export function useScreenActions(screen: Screen) {
  const { handleActions } = useActionHandler();

  // Fire screen-level onMount once per rendered screen. The screenId guards
  // against re-firing when the parent re-renders but the screen is unchanged.
  useEffect(() => {
    if (!screen.actions?.onMount?.length) return;
    void handleActions(screen.actions.onMount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen.screenId]);
}
