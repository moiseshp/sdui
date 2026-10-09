'use client';

import { Suspense, useMemo, useRef, type ComponentType } from 'react';
import { SectionErrorBoundary } from './section-error';
import type { SectionRegistry, SectionRegistryEntry } from '../utils/section-registry';
import { SectionSkeleton, UnknownSection } from './unknown-section';
import { useSectionActions } from '../hooks/use-section-actions';
import type { Section } from '../schema/section';
export type { SectionRegistry, SectionRegistryEntry } from '../utils/section-registry';

export interface SectionSlotProps {
  section: Section;
  registry: SectionRegistry;
  /**
   * Wrapper classes. The header slot uses `contents` so the header's `sticky`
   * applies to the screen instead of this div (D-39).
   */
  className?: string;
}

type PropsValidation = { status: 'ok'; props: unknown } | { status: 'invalid'; message: string };

/**
 * Validate raw `section.props` against the registry entry's schema. Returns
 * a discriminated result so the renderer can decide between "render" and
 * "fallback" without throwing.
 */
function validateProps(entry: SectionRegistryEntry<unknown>, rawProps: unknown): PropsValidation {
  const parsed = entry.schema.safeParse(rawProps ?? {});
  if (parsed.success) return { status: 'ok', props: parsed.data };
  const first = parsed.error.issues[0];
  const path = first?.path.join('.') || '(root)';
  return { status: 'invalid', message: `${path}: ${first?.message ?? 'invalid props'}` };
}

/**
 * Renders a single section envelope. Responsibilities:
 *  - Evaluate visibility rules and short-circuit hidden sections.
 *  - Look up the registry entry for `section.type`; fall back to an
 *    `UnknownSection` + reporter signal if not registered.
 *  - Validate `section.props` against the entry's schema before rendering;
 *    invalid props render an `invalid_props` placeholder instead of crashing.
 *  - Detect version mismatches between the registered contract and the one
 *    the BFF emitted; still attempts to render (forward-compat) but notifies
 *    the reporter so teams can track drift.
 *  - Fire declarative triggers (onMount immediately, onView when the slot
 *    intersects the viewport for the first time).
 *  - Wrap the real component in a per-section error boundary + Suspense so
 *    lazy loading + render errors degrade gracefully.
 */
export function SectionSlot({ section, registry, className }: SectionSlotProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  const entry = registry[section.type] as SectionRegistryEntry<unknown> | undefined;
  const validation = useMemo(() => (entry ? validateProps(entry, section.props) : null), [entry, section.props]);

  const sectionActionsEnabled = !!entry && validation?.status === 'ok';

  useSectionActions({ section, enabled: sectionActionsEnabled, rootRef });

  if (!entry) {
    return <UnknownSection sectionId={section.id} sectionType={section.type} reason="unknown_type" />;
  }

  if (validation?.status === 'invalid') {
    return <UnknownSection sectionId={section.id} sectionType={section.type} reason="invalid_props" message={validation.message} />;
  }

  const Component = entry.component as ComponentType<unknown>;

  return (
    <div ref={rootRef} data-bdui-section-id={section.id} data-bdui-section-type={section.type} className={className}>
      <SectionErrorBoundary sectionId={section.id} sectionType={section.type} sectionVersion={section.version}>
        <Suspense fallback={<SectionSkeleton />}>
          <Component {...(validation!.props as object)} />
        </Suspense>
      </SectionErrorBoundary>
    </div>
  );
}
