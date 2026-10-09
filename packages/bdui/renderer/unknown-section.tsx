'use client';

/**
 * Rendered when the renderer can't mount a section — either because the type
 * isn't in the registry, the version doesn't match, or the component threw
 * during render. In production we keep the footprint tiny (a hidden span with
 * a data-attr), so a broken section doesn't leak UI noise. In development
 * we surface a visible placeholder so it's obvious what failed.
 */
export interface UnknownSectionProps {
  sectionId: string;
  sectionType: string;
  reason: 'unknown_type' | 'error' | 'version_mismatch' | 'invalid_props';
  message?: string;
}

export function UnknownSection({ sectionId, sectionType, reason, message }: UnknownSectionProps) {
  const isDev = process.env.NODE_ENV !== 'production';

  if (!isDev) {
    return (
      <span
        aria-hidden="true"
        data-bdui-unknown-section={sectionType}
        data-bdui-section-id={sectionId}
        data-bdui-reason={reason}
        style={{ display: 'none' }}
      />
    );
  }

  return (
    <div
      role="alert"
      data-bdui-unknown-section={sectionType}
      data-bdui-section-id={sectionId}
      data-bdui-reason={reason}
      className="my-3 rounded-lg border border-dashed border-amber-400 bg-amber-50 p-3 text-sm text-amber-900"
    >
      <div className="font-semibold">[BDUI] Sección no renderizada</div>
      <div>
        <code>{sectionType}</code> (<code>{sectionId}</code>) — {reason}
        {message ? `: ${message}` : ''}
      </div>
    </div>
  );
}

/**
 * Placeholder shown while a lazy-loaded section streams in. Intentionally
 * minimal — real skeletons should live alongside each section if needed.
 */
export function SectionSkeleton() {
  return <div aria-hidden="true" data-bdui-skeleton="true" className="my-3 h-32 animate-pulse rounded-lg bg-neutral-100" />;
}
