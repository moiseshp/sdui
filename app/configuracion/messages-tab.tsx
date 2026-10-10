import type { InitiativeSummary, VariantId, VariantSummary } from '@/lib/data';
import { cn } from '@/packages/utils/cn';
import { InitiativeToggle } from './initiative-toggle';
import { describeAudience, splitVariants, winningInitiative } from './panel-model';
import { GroupHeading, TabIntro } from './panel-tabs';

interface MessagesTabProps {
  initiatives: InitiativeSummary[];
  variants: VariantSummary[];
  anonymousVariantId: VariantId;
}

interface NowShowingRow {
  key: string;
  label: string;
  detail?: string;
  message?: InitiativeSummary;
}

/**
 * Tab «Mensajes» (D-80): the bottom bar initiatives (D-64) in product words.
 * «Ahora se muestra» makes the priority rule visible without explaining it.
 */
export function MessagesTab({ initiatives, variants, anonymousVariantId }: MessagesTabProps) {
  const { signedIn } = splitVariants(variants);
  const anonymousName = variants.find(variant => variant.id === anonymousVariantId)?.name ?? anonymousVariantId;

  // Signed-in views grouped by the message they would get: one row when they all agree.
  const byMessage = new Map<string, { message?: InitiativeSummary; names: string[] }>();
  for (const variant of signedIn) {
    const message = winningInitiative(variant.id, initiatives);
    const key = message?.id ?? 'none';
    const group = byMessage.get(key) ?? { message, names: [] };
    group.names.push(variant.name);
    byMessage.set(key, group);
  }
  const signedInGroups = [...byMessage.entries()];

  const rows: NowShowingRow[] = [
    {
      key: 'anonymous',
      label: 'Sin sesión',
      detail: `Vista «${anonymousName}»`,
      message: winningInitiative(anonymousVariantId, initiatives),
    },
    ...signedInGroups.map(([key, group]) => ({
      key: `signed-in-${key}`,
      label: 'Con sesión',
      detail: signedInGroups.length === 1 ? 'Todas las vistas' : group.names.join(', '),
      message: group.message,
    })),
  ];

  return (
    <>
      <TabIntro title="¿Qué aviso aparece abajo en la Home?">
        Un mensaje destacado es un aviso fijo en la parte inferior de la Home: invitar a registrarse, pedir la dirección o avisar de
        una incidencia. Se prende y se apaga sin release. Si varios aplican a la vez, solo se muestra el de mayor prioridad.
      </TabIntro>
      <p className="mt-2 text-xs text-muted-foreground">
        En términos técnicos, cada mensaje es un <span className="font-bold">feature flag</span>.
      </p>

      <section aria-labelledby="now-showing-title" className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
        <GroupHeading id="now-showing-title" title="Ahora se muestra" />
        <dl className="mt-3 divide-y divide-border">
          {rows.map(row => (
            <div key={row.key} className="flex items-start justify-between gap-4 py-2 first:pt-0 last:pb-0">
              <dt className="min-w-0">
                <span className="block text-sm font-bold">{row.label}</span>
                {row.detail && <span className="block text-xs text-muted-foreground">{row.detail}</span>}
              </dt>
              <dd className={cn('shrink-0 text-right text-sm', row.message ? 'font-bold' : 'text-muted-foreground')}>
                {row.message ? row.message.name : 'Ningún mensaje'}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="messages-title" className="mt-6">
        <GroupHeading id="messages-title" title="Mensajes disponibles" />
        <ul className="mt-3 flex flex-col gap-3">
          {initiatives.map(initiative => (
            <InitiativeToggle key={initiative.id} initiative={initiative} audienceLabel={describeAudience(initiative.audience, variants)} />
          ))}
        </ul>
      </section>
    </>
  );
}
