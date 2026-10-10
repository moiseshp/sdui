import type { DemoUser, InitiativeSummary, VariantId, VariantSummary } from '@/lib/data';

/**
 * [DEMO] Presentation helpers for the presenter panel. Panel-only: nothing here
 * is part of the contract and the Home never uses it.
 */

/** Tabs of the panel. `param` is the visible `?tab=` value, so it stays in Spanish (D-56). */
export const PANEL_TABS = [
  { id: 'views', param: 'vistas', label: 'Vistas' },
  { id: 'segments', param: 'segmentos', label: 'Segmentos' },
  { id: 'messages', param: 'mensajes', label: 'Mensajes' },
] as const;
export type PanelTabId = (typeof PANEL_TABS)[number]['id'];

/** Unknown or missing `?tab=` → the first tab. */
export function parsePanelTab(raw: string | string[] | undefined): PanelTabId {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return PANEL_TABS.find(tab => tab.param === value)?.id ?? 'views';
}

export function panelTabHref(id: PanelTabId): string {
  const tab = PANEL_TABS.find(item => item.id === id) ?? PANEL_TABS[0];
  return `/configuracion?tab=${tab.param}`;
}

/** Views for people without a session vs. views for registered people (D-81). */
export function splitVariants(variants: VariantSummary[]) {
  return {
    anonymous: variants.filter(variant => variant.kind === 'anonymous'),
    signedIn: variants.filter(variant => variant.kind === 'signed-in'),
  };
}

export function countUsersByVariant(users: DemoUser[]): Map<VariantId, number> {
  const counts = new Map<VariantId, number>();
  for (const user of users) counts.set(user.variantId, (counts.get(user.variantId) ?? 0) + 1);
  return counts;
}

/** "Ningún segmento la ve" · "1 segmento la ve" · "3 segmentos la ven". */
export function segmentsLabel(count: number): string {
  if (count === 0) return 'Ningún segmento la ve';
  return count === 1 ? '1 segmento la ve' : `${count} segmentos la ven`;
}

/**
 * [DEMO] Same rule the backend applies in `getHomeScreen` (contrato.md §4.1):
 * the enabled initiative with the lowest priority whose audience includes the
 * view. Used ONLY to show "Ahora se muestra" in the panel; the Home always gets
 * the winner from the backend.
 */
export function winningInitiative(variantId: VariantId, initiatives: InitiativeSummary[]): InitiativeSummary | undefined {
  return initiatives
    .filter(initiative => initiative.enabled && (initiative.audience === null || initiative.audience.includes(variantId)))
    .toSorted((x, y) => x.priority - y.priority)[0];
}

/** Audience in product words: a whole group when it covers it exactly, otherwise the view names. */
export function describeAudience(audience: VariantId[] | null, variants: VariantSummary[]): string {
  if (audience === null) return 'Todos, con y sin sesión';

  const { anonymous, signedIn } = splitVariants(variants);
  const isExactly = (group: VariantSummary[]) =>
    group.length > 0 && group.every(variant => audience.includes(variant.id)) && audience.every(id => group.some(variant => variant.id === id));

  if (isExactly(anonymous)) return 'Quien navega sin sesión';
  if (isExactly(signedIn)) return 'Quien tiene sesión';

  const names = new Map(variants.map(variant => [variant.id, variant.name]));
  return audience.map(id => names.get(id) ?? id).join(', ');
}
