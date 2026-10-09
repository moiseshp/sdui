/**
 * [DEMO] Name sanitization in the frontend (D-07, accepted debt).
 * In production this lives in the backend. Rules: docs/contrato.md §5.
 *
 *   "Moisés"          → { id: "moises",          displayName: "Moisés" }
 *   "  María José "   → { id: "maria-jose",      displayName: "María José" }
 *   "Peña"            → { id: "pena",            displayName: "Peña" }
 *   "!!!"             → InvalidNameError
 */

export class InvalidNameError extends Error {
  constructor() {
    // User-facing wording (shown in the /ingresar form), so it stays in Spanish.
    super('Escribe un nombre con al menos una letra o número.');
    this.name = 'InvalidNameError';
  }
}

export function sanitizeName(raw: string): { id: string; displayName: string } {
  const displayName = raw.trim().replace(/\s+/g, ' ');

  const id = displayName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // accents, diaeresis, ñ → n
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!id) throw new InvalidNameError();

  return { id, displayName };
}
