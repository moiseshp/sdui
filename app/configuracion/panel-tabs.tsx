import Link from 'next/link';
import type { ReactNode } from 'react';

import { cn } from '@/packages/utils/cn';
import { PANEL_TABS, panelTabHref, type PanelTabId } from './panel-model';

interface PanelTabsProps {
  active: PanelTabId;
  /** Optional hint next to a tab label, e.g. how many segments are connected. */
  hints?: Partial<Record<PanelTabId, string>>;
}

/**
 * Tab bar of the panel. Each tab is a link with `?tab=`, so reloading,
 * «Actualizar lista» and the Server Actions' refresh keep the presenter on the
 * same tab mid-demo, and the page stays a Server Component.
 */
export function PanelTabs({ active, hints = {} }: PanelTabsProps) {
  return (
    <nav aria-label="Secciones del panel" className="mt-5">
      <ul className="flex gap-1 rounded-xl bg-neutral-200/70 p-1">
        {PANEL_TABS.map(tab => {
          const isActive = tab.id === active;
          const hint = hints[tab.id];
          return (
            <li key={tab.id} className="flex-1">
              <Link
                href={panelTabHref(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex h-10 items-center justify-center gap-2 rounded-lg px-2 text-sm font-bold transition-colors',
                  isActive ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:bg-white/50 hover:text-foreground',
                )}
              >
                {tab.label}
                {hint && (
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs',
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-white/70 text-muted-foreground',
                    )}
                  >
                    {hint}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Opening of each tab: the question it answers, in product words. */
export function TabIntro({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="text-lg font-black tracking-tight">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{children}</p>
    </div>
  );
}

/** Heading of a group inside a tab ("Sin sesión", "Con sesión"...). */
export function GroupHeading({ id, title, description }: { id: string; title: string; description?: ReactNode }) {
  return (
    <div>
      <h3 id={id} className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
    </div>
  );
}
