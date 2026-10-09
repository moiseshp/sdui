'use client';

import type { Action } from '../schema/action';
import { ActionSchema, CoreActionSchema, isCoreActionType } from '../schema/action';
import { useActionRegistry } from '../providers/action-provider';

/**
 * Dispatch hook. Reads the ActionRegistry from context and exposes two
 * imperative helpers:
 *  - execute(action)    : run a single action (validates + dispatches).
 *  - handleActions(xs)  : run a list of actions in declared order; breaks on
 *                         the first error so dependent actions don't run.
 *
 * Validation policy:
 *  - Every action is matched against the loose ActionSchema. A malformed
 *    entry is logged and skipped (never throws to the caller).
 *  - If the action type is a known core action, its payload is additionally
 *    validated against the strict schema. Validation failures are logged and
 *    the handler is still invoked with the raw payload, to avoid regressing
 *    behaviour when a BFF ships an in-flight change. Flip this to hard-fail
 *    once your BFF contract is locked (see `strictCore` option below).
 */
export interface UseActionHandlerOptions {
  /**
   * When true, validation failures for known core actions block dispatch
   * (handler does NOT run). Defaults to false for forward compatibility.
   */
  strictCore?: boolean;
}

export function useActionHandler(options: UseActionHandlerOptions = {}) {
  const registry = useActionRegistry();
  const { strictCore = false } = options;

  const execute = async (action: Action): Promise<void> => {
    const envelope = ActionSchema.safeParse(action);
    if (!envelope.success) {
      console.warn('[BDUI] Skipping malformed action:', envelope.error.issues, action);
      return;
    }

    const { type, payload } = envelope.data;
    const handler = registry[type];
    if (!handler) {
      console.warn(`[BDUI] No handler registered for action "${type}"`);
      return;
    }

    // Strict validation for known core actions. Custom actions pass through.
    if (isCoreActionType(type)) {
      const strict = CoreActionSchema.safeParse(action);
      if (!strict.success) {
        console.warn(`[BDUI] Core action "${type}" failed payload validation:`, strict.error.issues, action);
        if (strictCore) return;
      }
    }

    await handler(payload);
  };

  const handleActions = async (actions: Action[] | undefined): Promise<void> => {
    if (!actions?.length) return;
    for (const action of actions) {
      try {
        await execute(action);
      } catch (error) {
        console.error(`[BDUI] Action "${action?.type}" failed:`, error);
        break;
      }
    }
  };

  return { execute, handleActions };
}
