'use server';

import { refresh } from 'next/cache';
import { assignVariant, isVariantId, listUsers, reorderSections, setAnonymousVariant, setInitiativeEnabled } from '@/lib/data';

/** Assigns a view to one person and refreshes the panel. */
export async function assignVariantAction(userId: string, variantId: string) {
  if (!isVariantId(variantId)) throw new Error(`Invalid view: ${variantId}`);
  await assignVariant(userId, variantId);
  refresh();
}

/**
 * Assigns the same view to everyone ("Todos a ...").
 * Built on top of `assignVariant`: it is not a contract operation (D-45).
 */
export async function assignAllAction(variantId: string) {
  if (!isVariantId(variantId)) throw new Error(`Invalid view: ${variantId}`);
  const users = await listUsers();
  await Promise.all(users.map(user => assignVariant(user.id, variantId)));
  refresh();
}

/** Turns a bottom bar initiative on or off (feature flag, D-64). */
export async function setInitiativeEnabledAction(initiativeId: string, enabled: boolean) {
  await setInitiativeEnabled(initiativeId, enabled);
  refresh();
}

/**
 * Picks the view that every visitor without a session sees (D-81). The backend
 * rejects views that are not meant for people without a session.
 */
export async function setAnonymousVariantAction(variantId: string) {
  if (!isVariantId(variantId)) throw new Error(`Invalid view: ${variantId}`);
  await setAnonymousVariant(variantId);
  refresh();
}

/**
 * Saves the order and visibility of a view's sections (D-74, D-78). Only ids
 * travel: the backend rejects any order that is not exactly the view's sections
 * and any hidden id that is not one of them. `hiddenSectionIds` omitted = keep
 * the current visibility. Returns what the backend saved.
 */
export async function reorderSectionsAction(variantId: string, sectionIds: string[], hiddenSectionIds?: string[]) {
  if (!isVariantId(variantId)) throw new Error(`Invalid view: ${variantId}`);
  const result = await reorderSections(variantId, sectionIds, hiddenSectionIds);
  refresh();
  return result;
}
