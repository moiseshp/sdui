'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/packages/ui/button';
import { ArrowClockwiseIcon } from '@phosphor-icons/react';

/** Re-reads the user list (to see who just signed in). */
export function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button variant="outline" size="lg" className="w-full" disabled={isPending} onClick={() => startTransition(() => router.refresh())}>
      <ArrowClockwiseIcon className={isPending ? 'animate-spin' : undefined} />
      Actualizar lista
    </Button>
  );
}
