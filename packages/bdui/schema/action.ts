import * as z from 'zod';

/**
 * Loose action shape. Any action delivered by the BFF MUST at least match this.
 * Unknown action types pass validation here; the client will decide how to handle
 * them (via ActionRegistry) or gracefully ignore them.
 */
export const ActionSchema = z.object({
  type: z.string().min(1),
  payload: z.record(z.string(), z.unknown()).optional(),
});
export type Action = z.infer<typeof ActionSchema>;

/* -------------------------------------------------------------------------- */
/* Core action schemas                                                         */
/* Every core action is strictly typed so handlers can receive a validated     */
/* payload. Add new entries here as they become "core" capabilities.           */
/* -------------------------------------------------------------------------- */

export const NavigateActionSchema = z.object({
  type: z.literal('NAVIGATE'),
  payload: z.object({
    url: z.string().min(1),
    replace: z.boolean().optional(),
  }),
});

export const TrackEventActionSchema = z.object({
  type: z.literal('TRACK_EVENT'),
  payload: z.object({
    name: z.string().min(1),
    id: z.string().optional(),
    params: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const ApiCallActionSchema = z.object({
  type: z.literal('API_CALL'),
  payload: z.object({
    endpoint: z.string().min(1),
    method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']).optional(),
    body: z.unknown().optional(),
    headers: z.record(z.string(), z.string()).optional(),
  }),
});

export const ExternalLinkActionSchema = z.object({
  type: z.literal('EXTERNAL_LINK'),
  payload: z.object({
    url: z.string().min(1),
    target: z.enum(['_self', '_blank']).optional(),
  }),
});

export const ShowLoadingActionSchema = z.object({
  type: z.literal('SHOW_LOADING'),
  payload: z
    .object({
      fullScreen: z.boolean().optional(),
      message: z.string().optional(),
    })
    .optional(),
});

export const HideLoadingActionSchema = z.object({
  type: z.literal('HIDE_LOADING'),
  payload: z.object({}).optional(),
});

/**
 * Discriminated union of every core action. Use this in handlers that want
 * exhaustive type checks.
 */
export const CoreActionSchema = z.discriminatedUnion('type', [
  NavigateActionSchema,
  TrackEventActionSchema,
  ApiCallActionSchema,
  ExternalLinkActionSchema,
  ShowLoadingActionSchema,
  HideLoadingActionSchema,
]);
export type CoreAction = z.infer<typeof CoreActionSchema>;
export type CoreActionType = CoreAction['type'];

/**
 * Canonical list of known core action type strings. Declared once so the
 * runtime dispatcher can decide whether to apply strict validation. Keep in
 * sync with CoreActionSchema's union members.
 */
export const CORE_ACTION_TYPES = [
  'NAVIGATE',
  'TRACK_EVENT',
  'API_CALL',
  'EXTERNAL_LINK',
  'SHOW_LOADING',
  'HIDE_LOADING',
] as const satisfies readonly CoreActionType[];

/** Type guard: is this action type one of the known core actions? */
export function isCoreActionType(type: string): type is CoreActionType {
  return (CORE_ACTION_TYPES as readonly string[]).includes(type);
}

/**
 * Map from action type to its payload. Enables type-safe handlers in the
 * ActionRegistry:
 *   NAVIGATE: (payload: ActionPayloadMap['NAVIGATE']) => void
 */
export type ActionPayloadMap = {
  [K in CoreAction as K['type']]: K extends { payload: infer P } ? P : never;
};

/* -------------------------------------------------------------------------- */
/* Triggers                                                                   */
/* A trigger is a named event on a section / item / screen that the BFF can   */
/* bind to a list of actions. The client decides when to fire each trigger.   */
/* Convention: onMount, onView, onPress, onSubmit, onDismiss.                 */
/* -------------------------------------------------------------------------- */

export const TriggerSchema = z.record(z.string(), z.array(ActionSchema));
export type TriggerMap = z.infer<typeof TriggerSchema>;

export const WELL_KNOWN_TRIGGERS = ['onMount', 'onView', 'onPress', 'onSubmit', 'onDismiss'] as const;
export type WellKnownTrigger = (typeof WELL_KNOWN_TRIGGERS)[number];
