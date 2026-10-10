'use client';

import type { TriggerMap } from '../schema/action';
import { useActionHandler } from './use-action-handler';

export interface PressBinding {
  /** Whether the contract bound at least one `onPress` action to the element. */
  isPressable: boolean;
  /** Runs the element's `onPress` actions in order. No-op when there are none. */
  onPress: () => void;
}

/**
 * Press helper for interactive elements inside a section (buttons, cards, CTAs).
 *
 * Receives the element's trigger map as the contract sends it and returns what
 * the UI needs to wire it. The section never knows what the actions do
 * (navigate, track, open a link...): the app's ActionRegistry decides that, so
 * the component stays framework-agnostic.
 *
 * @example
 * const bindPress = usePressHandler();
 * const user = bindPress(actions?.user);
 * <Button onClick={user.onPress} />
 */
export function usePressHandler() {
  const { handleActions } = useActionHandler();

  return (actions?: TriggerMap): PressBinding => {
    const onPressActions = actions?.onPress;
    const isPressable = !!onPressActions?.length;

    return {
      isPressable,
      onPress: () => {
        if (isPressable) void handleActions(onPressActions);
      },
    };
  };
}
