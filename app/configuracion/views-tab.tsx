import Link from 'next/link';

import { DEFAULT_VARIANT_ID, type DemoUser, type VariantId, type VariantSummary } from '@/lib/data';
import { AnonymousVariantPicker } from './anonymous-variant-picker';
import { countUsersByVariant, panelTabHref, segmentsLabel, splitVariants } from './panel-model';
import { GroupHeading, TabIntro } from './panel-tabs';
import { VariantEmoji } from './variant-emoji';

interface ViewsTabProps {
  variants: VariantSummary[];
  users: DemoUser[];
  anonymousVariantId: VariantId;
}

/** Tab «Vistas»: what someone can see, grouped by whether they have a session (D-80, D-81). */
export function ViewsTab({ variants, users, anonymousVariantId }: ViewsTabProps) {
  const { anonymous, signedIn } = splitVariants(variants);
  const counts = countUsersByVariant(users);

  return (
    <>
      <TabIntro title="¿Qué puede ver alguien en la Home?">
        Cada vista es una versión completa de la Home que arma el backend: qué secciones aparecen, en qué orden y con qué estilo.
        Cambiarla no requiere un release; basta con recargar.
      </TabIntro>

      <section aria-labelledby="anonymous-views-title" className="mt-6">
        <GroupHeading
          id="anonymous-views-title"
          title="Sin sesión"
          description="La ve cualquiera que entra sin registrarse. Todos los visitantes ven la misma: elige cuál."
        />
        <AnonymousVariantPicker variants={anonymous} activeId={anonymousVariantId} />
      </section>

      <section aria-labelledby="signed-in-views-title" className="mt-6">
        <GroupHeading
          id="signed-in-views-title"
          title="Con sesión"
          description={
            <>
              La ve quien ya se registró, según el segmento al que pertenece. Se asignan en{' '}
              <Link href={panelTabHref('segments')} className="font-bold text-primary hover:underline">
                Segmentos
              </Link>
              .
            </>
          }
        />
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {signedIn.map(variant => (
            <li key={variant.id} className="flex flex-col rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex flex-1 items-start gap-3">
                <VariantEmoji variantId={variant.id} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <p className="font-bold">{variant.name}</p>
                    {variant.id === DEFAULT_VARIANT_ID && (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-bold text-muted-foreground">
                        Al registrarse
                      </span>
                    )}
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">{variant.description}</p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold text-muted-foreground">{segmentsLabel(counts.get(variant.id) ?? 0)}</span>
                <Link href={`/configuracion/${variant.id}`} className="text-xs font-bold text-primary hover:underline">
                  Ordenar y ocultar secciones →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
