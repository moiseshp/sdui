'use client';

import type { Screen } from '../../schema/screen';
import { ScreenRenderer } from '../../renderer/screen-renderer';
import { sectionRegistry } from './section-registry';

/**
 * Thin wrapper that binds the home-screen section registry to the generic
 * `ScreenRenderer`. Additional pages (menu, cart, etc.) follow the same
 * pattern: one folder per screen, each exporting its own `sectionRegistry`
 * and a wrapper that composes it with the renderer.
 *
 * This file MUST be a client component. The registry holds Zod schemas
 * (non-serializable: their methods would break the RSC payload) and uses
 * `React.lazy`, which only exists client-side. Having the 'use client'
 * marker here keeps the import of `sectionRegistry` inside the client
 * bundle, so the server never tries to serialize it across the boundary.
 * Only the parsed `screen` (plain JSON data) crosses — that's safe.
 */
export function Home({ screen }: { screen: Screen }) {
  return <ScreenRenderer screen={screen} sectionRegistry={sectionRegistry} />;
}
