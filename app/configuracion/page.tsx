import type { Metadata } from 'next';
import { connection } from 'next/server';

import { getAnonymousVariant, getDataSourceName, listInitiatives, listUsers, listVariants } from '@/lib/data';
import { cn } from '@/packages/utils/cn';
import { MessagesTab } from './messages-tab';
import { parsePanelTab } from './panel-model';
import { PanelTabs } from './panel-tabs';
import { SegmentsTab } from './segments-tab';
import { ViewsTab } from './views-tab';

export const metadata: Metadata = {
  title: 'Panel de experimentos · KFC',
};

/**
 * Presenter panel (docs/variantes-y-vistas.md → /configuracion). Desktop-only,
 * operated by the presenter (D-75). The route stays in Spanish because it is a
 * URL the audience sees.
 *
 * Three tabs, each answering one product question (D-80):
 *   - Vistas    : what someone can see (without / with a session).
 *   - Segmentos : who sees each view (each connected person = a segment).
 *   - Mensajes  : which highlighted message shows at the bottom (bottom bar).
 * The active tab lives in `?tab=` so reloads keep it.
 */
export default async function ExperimentsPanelPage({ searchParams }: { searchParams: Promise<{ tab?: string | string[] }> }) {
  // No cache: every request reads the current state (D-19).
  await connection();

  const [{ tab }, users, variants, initiatives, anonymousVariantId] = await Promise.all([
    searchParams,
    listUsers(),
    listVariants(),
    listInitiatives(),
    getAnonymousVariant(),
  ]);
  const activeTab = parsePanelTab(tab);
  const enabledMessages = initiatives.filter(initiative => initiative.enabled).length;

  return (
    <div className="min-h-dvh bg-neutral-100">
      <main className="mx-auto w-full max-w-3xl px-4 py-6">
        <header>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Demo BDUI</p>
            <DataSourceBadge source={getDataSourceName()} />
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight">Panel de experimentos</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Prueba cambios en la Home sin publicar una nueva versión de la app.
          </p>
        </header>

        <PanelTabs
          active={activeTab}
          hints={{
            segments: String(users.length),
            messages: `${enabledMessages} ${enabledMessages === 1 ? 'activo' : 'activos'}`,
          }}
        />

        <div className="mt-6">
          {activeTab === 'views' && <ViewsTab variants={variants} users={users} anonymousVariantId={anonymousVariantId} />}
          {activeTab === 'segments' && <SegmentsTab users={users} variants={variants} />}
          {activeTab === 'messages' && (
            <MessagesTab initiatives={initiatives} variants={variants} anonymousVariantId={anonymousVariantId} />
          )}
        </div>
      </main>
    </div>
  );
}

/** Shows which backend is live: avoids "am I on the mock?" doubts mid-demo. */
function DataSourceBadge({ source }: { source: 'mock' | 'supabase' }) {
  const isSupabase = source === 'supabase';
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold',
        isSupabase ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800',
      )}
    >
      <span className={cn('size-2 rounded-full', isSupabase ? 'bg-emerald-500' : 'bg-amber-500')} />
      {isSupabase ? 'Supabase' : 'Mock (en memoria)'}
    </span>
  );
}
