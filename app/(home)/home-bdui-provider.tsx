'use client';

import { ScreenProvider } from '@/packages/bdui/providers/screen-provider';
import { createActionRegistry } from '@/packages/bdui/utils/action-registry';
import { useRouter } from 'next/navigation';
import { useMemo, type ReactNode } from 'react';

/** Maps the contract's action types to concrete handlers for the Home. */
export function HomeScreenProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const registry = useMemo(
    () =>
      createActionRegistry({
        NAVIGATE: ({ url, replace }) => (replace ? router.replace(url) : router.push(url)),
        TRACK_EVENT: ({ name, id, params }) => {
          // Metrics are out of scope (D-13): logging is enough for the demo.
          console.log('[KFC] Track:', name, { id, ...params });
        },
        EXTERNAL_LINK: ({ url, target = '_blank' }) => window.open(url, target, target === '_blank' ? 'noopener,noreferrer' : undefined),
      }),
    [router],
  );

  return <ScreenProvider registry={registry}>{children}</ScreenProvider>;
}
