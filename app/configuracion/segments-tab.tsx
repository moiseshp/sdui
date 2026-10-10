import type { DemoUser, VariantSummary } from '@/lib/data';
import { cn } from '@/packages/utils/cn';
import { BulkAssign } from './bulk-assign';
import { countUsersByVariant, splitVariants } from './panel-model';
import { GroupHeading, TabIntro } from './panel-tabs';
import { RefreshButton } from './refresh-button';
import { VariantEmoji } from './variant-emoji';
import { VariantSelect } from './variant-select';

interface SegmentsTabProps {
  users: DemoUser[];
  variants: VariantSummary[];
}

/**
 * Tab «Segmentos» (D-80). [DEMO] Each connected person stands for a customer
 * segment: assigning a view to «Moisés» reads as "this segment sees this view".
 * Only views for signed-in people are offered (D-81).
 */
export function SegmentsTab({ users, variants }: SegmentsTabProps) {
  const { signedIn } = splitVariants(variants);
  const counts = countUsersByVariant(users);
  const variantById = new Map(variants.map(variant => [variant.id, variant]));
  const hasUsers = users.length > 0;

  return (
    <>
      <TabIntro title="¿A quién se le muestra cada vista?">
        Cada persona conectada representa un segmento de clientes (por ejemplo, clientes frecuentes o quienes cumplen años hoy).
        Asígnale la vista que ese segmento debería ver. En producción, el backend decidiría el segmento por su cuenta.
      </TabIntro>

      <section aria-labelledby="distribution-title" className="mt-6">
        <GroupHeading id="distribution-title" title="Cómo están repartidos" />
        <ul className="mt-2 flex flex-wrap gap-2">
          {signedIn.map(variant => {
            const count = counts.get(variant.id) ?? 0;
            return (
              <li
                key={variant.id}
                className={cn(
                  'inline-flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-sm font-bold',
                  count > 0 ? 'bg-white shadow-sm' : 'bg-white/50 text-muted-foreground',
                )}
              >
                <VariantEmoji variantId={variant.id} size="sm" />
                {variant.name}
                <span className="tabular-nums">· {count}</span>
              </li>
            );
          })}
        </ul>
      </section>

      <BulkAssign variants={signedIn} hasUsers={hasUsers} />

      <section aria-labelledby="segments-title" className="mt-4">
        <div className="mb-3 flex items-baseline justify-between">
          <GroupHeading id="segments-title" title="Segmentos conectados" />
          <span className="text-sm font-bold">{users.length}</span>
        </div>

        <RefreshButton />

        {hasUsers ? (
          <ul className="mt-4 grid gap-3 sm:grid-cols-2">
            {users.map(user => {
              const current = variantById.get(user.variantId);
              // A person forced onto an anonymous view (legacy data) keeps it listed so the select is not blank.
              const options = signedIn.some(variant => variant.id === user.variantId) || !current ? signedIn : [current, ...signedIn];
              return (
                <li key={user.id} className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <VariantEmoji variantId={user.variantId} label={`Ve la vista ${current?.name ?? user.variantId}`} />
                    <div className="min-w-0">
                      <p className="truncate text-lg font-bold">{user.displayName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        Segmento <span className="font-mono">{user.id}</span>
                      </p>
                    </div>
                  </div>
                  <VariantSelect userId={user.id} displayName={user.displayName} value={user.variantId} variants={options} />
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="mt-4 rounded-2xl border-2 border-dashed border-border bg-white p-6 text-center">
            <p className="font-bold">Aún no hay segmentos conectados</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Pide que entren a la web e ingresen su nombre: cada persona será un segmento. Luego toca «Actualizar lista».
            </p>
          </div>
        )}
      </section>
    </>
  );
}
