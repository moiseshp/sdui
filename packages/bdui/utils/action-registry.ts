import type { ActionPayloadMap } from '../schema/action';

/**
 * A handler reacts to a single action. It may run sync or async, and may
 * optionally return a value (we allow `Window | null` so `window.open`-style
 * handlers type-check naturally). The runtime ignores the return value.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionHandler<P = any> = (payload: P) => void | Promise<void> | Window | null;

/**
 * Handlers for the BDUI core action catalog. Each entry is optional: an app
 * only registers the actions it actually supports. When the BFF emits an
 * action that has no handler, the dispatcher logs a warning and moves on.
 */
export type CoreActionHandlers = {
  [K in keyof ActionPayloadMap]?: ActionHandler<ActionPayloadMap[K]>;
};

/**
 * Shape that every registry must satisfy: core actions are strictly typed,
 * and any additional (custom) action keys are accepted with a permissive
 * handler type. `any` is intentional here — the index signature must be wide
 * enough that typed core handlers can co-exist with loose custom handlers.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ActionRegistry = CoreActionHandlers & Record<string, ActionHandler<any> | undefined>;

/**
 * Helper that preserves the exact literal shape of the registry at the call
 * site, so consumers keep strict payload typing on their declared handlers.
 *
 * Known core keys are checked against ActionPayloadMap; custom keys are free
 * to declare whatever payload shape they want.
 *
 * @example
 * const registry = createActionRegistry({
 *   NAVIGATE: ({ url }) => router.push(url), // url: string (inferred)
 *   OPEN_MODAL: ({ id }: { id: string }) => ... , // custom action
 * });
 */
export function createActionRegistry<T extends ActionRegistry>(handlers: T): T {
  return handlers;
}
