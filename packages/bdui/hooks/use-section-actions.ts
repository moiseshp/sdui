import { useEffect, useRef } from 'react';
import type { Section } from '../schema/section';
import { useActionHandler } from './use-action-handler';

interface UseSectionActionsOptions {
  section: Section;
  enabled: boolean;
  rootRef: React.RefObject<HTMLDivElement | null>;
}

export function useSectionActions({ section, enabled, rootRef }: UseSectionActionsOptions) {
  const { handleActions } = useActionHandler();
  const viewFiredRef = useRef(false);

  // onMount
  useEffect(() => {
    if (!enabled) return;
    void handleActions(section.actions?.onMount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.id, enabled]);

  // onView
  useEffect(() => {
    if (!enabled) return;
    const viewActions = section.actions?.onView;
    if (!viewActions?.length) return;

    const el = rootRef.current;

    const fireOnce = () => {
      if (viewFiredRef.current) return;
      viewFiredRef.current = true;
      void handleActions(viewActions);
    };

    if (!el || typeof IntersectionObserver === 'undefined') {
      fireOnce();
      return;
    }

    const observer = new IntersectionObserver(
      entries => {
        for (const e of entries) {
          if (e.isIntersecting) {
            fireOnce();
            observer.disconnect();
            return;
          }
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(el);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section.id, enabled]);
}
