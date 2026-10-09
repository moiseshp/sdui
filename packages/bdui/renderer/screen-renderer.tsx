'use client';

import type { Screen, ScreenLayout } from '../schema/screen';
import { SectionSlot, type SectionRegistry } from './section-slot';
import { useScreenActions } from '../hooks/use-screen-actions';

export interface ScreenRendererProps {
  /** The full parsed BDUI envelope delivered by the BFF. */
  screen: Screen;
  /** Maps `section.type` to the component that renders it. */
  sectionRegistry: SectionRegistry;
}

/**
 * [ARQ] Each platform implements its own strategy per `layout`.
 * The layout decides the container and arrangement; it never reads or changes
 * section props (docs/arquitectura.md, principle 7).
 *
 * - `default`: single mobile-first column.
 * - `kiosk`  : dark canvas with each section as its own panel; on wide screens
 *              it switches to two columns and the first section spans the full
 *              width. Must look different even on a phone (D-40).
 */
const layoutClasses: Record<ScreenLayout, { root: string; body: string }> = {
  default: {
    root: 'relative mx-auto min-h-dvh w-full bg-white sm:max-w-sm',
    body: '',
  },
  kiosk: {
    root: 'relative min-h-dvh w-full bg-foreground',
    body: [
      'mx-auto grid max-w-6xl gap-3 p-3 lg:grid-cols-2 lg:gap-4 lg:p-6',
      '[&>*]:overflow-hidden [&>*]:rounded-2xl [&>*]:bg-white',
      'lg:[&>*:first-child]:col-span-2',
      '[&>*:empty]:hidden',
    ].join(' '),
  },
};

/**
 * Renders a BDUI screen:
 *  - Fires screen-level `onMount` triggers once per mounted screen.
 *  - Renders the `header` slot (Screen v1.1) outside the body. Its wrapper uses
 *    `display: contents` so the header's own `sticky` applies to the screen.
 *  - Applies the screen `layout` and delegates each section to `SectionSlot`.
 *  - Exposes the screen `theme` (v1.2) as `data-bdui-theme`: the platform maps
 *    it to its tokens (app/globals.css). Sections never read it (D-63).
 *  - Renders the `bottomBar` slot (v1.2) after the body, also with
 *    `display: contents`, so the bar can pin itself to the viewport (D-64).
 */
export function ScreenRenderer({ screen, sectionRegistry }: ScreenRendererProps) {
  useScreenActions(screen);

  const classes = layoutClasses[screen.layout] ?? layoutClasses.default;

  return (
    <div
      data-bdui-screen-id={screen.screenId}
      data-bdui-layout={screen.layout}
      data-bdui-theme={screen.theme}
      className={classes.root}
    >
      {screen.header && <SectionSlot section={screen.header} registry={sectionRegistry} className="contents" />}
      <main className={classes.body}>
        {screen.sections.map(section => (
          <SectionSlot key={section.id} section={section} registry={sectionRegistry} />
        ))}
      </main>
      {screen.bottomBar && (
        <SectionSlot key={screen.bottomBar.id} section={screen.bottomBar} registry={sectionRegistry} className="contents" />
      )}
    </div>
  );
}
