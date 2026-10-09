import type { Metadata } from 'next';
import Link from 'next/link';
import { connection } from 'next/server';

import { getDataSourceName, listInitiatives, listUsers, listVariants } from '@/lib/data';
import { cn } from '@/packages/utils/cn';
import { BulkAssign } from './bulk-assign';
import { InitiativeToggle } from './initiative-toggle';
import { RefreshButton } from './refresh-button';
import { VariantSelect } from './variant-select';
import { variantBadge } from './variant-styles';

export const metadata: Metadata = {
  title: 'Panel de experimentos · KFC',
};

/**
 * Presenter panel (docs/variantes-y-vistas.md → /configuracion).
 * The route stays in Spanish because it is a URL the audience sees.
 * Mobile-first: in round 2 an attendee runs it from their phone (D-43).
 */
export default async function ExperimentsPanelPage() {
  // No cache: every request reads the current state (D-19).
  await connection();

  const [users, variants, initiatives] = await Promise.all([listUsers(), listVariants(), listInitiatives()]);
  const hasUsers = users.length > 0;
  const dataSource = getDataSourceName();
  const variantNames = new Map(variants.map(variant => [variant.id, variant.name]));

  return (
    <div className="min-h-dvh bg-neutral-100">
      <main className="mx-auto w-full max-w-2xl px-4 py-6">
        <header>
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-bold uppercase tracking-widest text-primary">Demo BDUI</p>
            <DataSourceBadge source={dataSource} />
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight">Panel de experimentos</h1>
          <p className="mt-1 text-sm text-muted-foreground">Elige qué vista de la Home ve cada persona. Después, pídele que recargue.</p>
        </header>

        <section aria-labelledby="presets-title" className="mt-6">
          <h2 id="presets-title" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Vistas
          </h2>
          <ul className="mt-2 grid grid-cols-2 gap-2">
            {variants.map(variant => (
              <li key={variant.id}>
                <Link
                  href={`/configuracion/${variant.id}`}
                  className="group flex h-full gap-2 rounded-xl bg-white p-3 transition-shadow hover:shadow-md hover:ring-2 hover:ring-primary/40"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex size-7 shrink-0 items-center justify-center rounded-full text-sm',
                      variantBadge[variant.id].className,
                    )}
                  >
                    {variantBadge[variant.id].emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-bold">{variant.name}</p>
                    <p className="text-xs text-muted-foreground">{variant.description}</p>
                    <p className="mt-1 text-xs font-bold text-primary group-hover:underline">Ordenar y ocultar secciones →</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
          <BulkAssign variants={variants} hasUsers={hasUsers} />
        </section>

        <section aria-labelledby="users-title" className="mt-4">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 id="users-title" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Personas conectadas
            </h2>
            <span className="text-sm font-bold">{users.length}</span>
          </div>

          <RefreshButton />

          {hasUsers ? (
            <ul className="mt-4 flex flex-col gap-3">
              {users.map(user => (
                <li key={user.id} className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <span
                      aria-label={`Ve la vista ${variantNames.get(user.variantId) ?? user.variantId}`}
                      className={cn(
                        'flex size-10 shrink-0 items-center justify-center rounded-full text-lg',
                        variantBadge[user.variantId].className,
                      )}
                    >
                      {variantBadge[user.variantId].emoji}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-bold">{user.displayName}</p>
                      <p className="truncate font-mono text-xs text-muted-foreground">{user.id}</p>
                    </div>
                  </div>
                  <VariantSelect userId={user.id} displayName={user.displayName} value={user.variantId} variants={variants} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-4 rounded-2xl border-2 border-dashed border-border bg-white p-6 text-center">
              <p className="font-bold">Aún no hay personas conectadas</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Pide que entren a la web e ingresen su nombre. Luego toca «Actualizar lista».
              </p>
            </div>
          )}
        </section>

        <section aria-labelledby="bottom-bar-title" className="mt-8">
          <h2 id="bottom-bar-title" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
            Bottom bar
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Iniciativas que se prenden y apagan sin release. Si a una vista le aplica más de una, se muestra la de mayor prioridad
            (P1 es la más alta).
          </p>
          <ul className="mt-3 flex flex-col gap-3">
            {initiatives.map(initiative => (
              <InitiativeToggle
                key={initiative.id}
                initiative={initiative}
                audienceLabel={
                  initiative.audience
                    ? initiative.audience.map(id => variantNames.get(id) ?? id).join(', ')
                    : 'Todas las vistas'
                }
              />
            ))}
          </ul>
        </section>
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
