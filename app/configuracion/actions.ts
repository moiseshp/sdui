'use server';

import { refresh } from 'next/cache';
import { assignVariant, isVariantId, listUsers, reorderSections, setInitiativeEnabled } from '@/lib/data';

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
 * Saves the new section order of a view (D-74). Only the ids travel: the
 * backend rejects any list that is not exactly the view's sections.
 */
export async function reorderSectionsAction(variantId: string, sectionIds: string[]) {
  if (!isVariantId(variantId)) throw new Error(`Invalid view: ${variantId}`);
  await reorderSections(variantId, sectionIds);
  refresh();
}
