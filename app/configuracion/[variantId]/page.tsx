import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';

import { getVariantScreen, isVariantId, listVariants } from '@/lib/data';
import { parseScreen } from '@/packages/bdui/schema/screen';
import { describeHeader, describeSection } from './section-labels';
import { SectionOrderEditor } from './section-order-editor';

export const metadata: Metadata = {
  title: 'Secciones de la vista · KFC',
};

/**
 * Ids of the sections flagged `hidden: true` in the stored template (D-78).
 * Read from the raw template because `parseScreen` drops unknown keys: `hidden`
 * is a backend storage flag, not part of the Screen the Home receives.
 */
function readHiddenSectionIds(rawScreen: unknown): string[] {
  const sections = (rawScreen as { sections?: unknown })?.sections;
  if (!Array.isArray(sections)) return [];
  return sections.flatMap(section => {
    const { id, hidden } = (section ?? {}) as { id?: unknown; hidden?: unknown };
    return hidden === true && typeof id === 'string' ? [id] : [];
  });
}

/**
 * Section editor for one view (docs/variantes-y-vistas.md → /configuracion/[vista]):
 * order (D-74) and visibility (D-78). Desktop-only, presenter-only (D-75).
 * Changes apply to the VIEW, so to everyone who has it assigned, not to one person.
 */
export default async function SectionOrderPage({ params }: { params: Promise<{ variantId: string }> }) {
  // No cache: always show the order currently stored (D-19).
  await connection();

  const { variantId } = await params;
  if (!isVariantId(variantId)) notFound();

  const [rawScreen, variants] = await Promise.all([getVariantScreen(variantId), listVariants()]);
  if (!rawScreen) notFound();

  const screen = parseScreen(rawScreen);
  const variant = variants.find(item => item.id === variantId);

  return (
    <div className="min-h-dvh bg-neutral-100">
      <main className="mx-auto w-full max-w-2xl px-4 py-6">
        <Link href="/configuracion?tab=vistas" className="text-sm font-bold text-primary hover:underline">
          ← Volver a Vistas
        </Link>

        <header className="mt-3">
          <p className="text-xs font-bold uppercase tracking-widest text-primary">Secciones de la vista</p>
          <h1 className="mt-1 text-2xl font-black tracking-tight">{variant?.name ?? variantId}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Arrastra las secciones para cambiar el orden en que llegan en esta vista, o usa el interruptor para ocultarlas o
            mostrarlas. Los cambios aplican a todas las personas que la tengan asignada.
          </p>
        </header>

        <SectionOrderEditor
          variantId={variantId}
          header={screen.header ? describeHeader(screen.header) : null}
          sections={screen.sections.map(section => describeSection(section))}
          hiddenSectionIds={readHiddenSectionIds(rawScreen)}
        />
      </main>
    </div>
  );
}
