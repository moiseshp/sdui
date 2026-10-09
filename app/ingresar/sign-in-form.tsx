'use client';

import { useActionState } from 'react';

import { Button } from '@/packages/ui/button';
import { Input } from '@/packages/ui/input';
import { signInAction, type SignInState } from './actions';

const initialState: SignInState = { error: null, name: '' };

export function SignInForm() {
  const [state, formAction, isPending] = useActionState(signInAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label htmlFor="name" className="text-sm font-bold">
        Tu nombre
      </label>
      <Input
        id="name"
        name="name"
        defaultValue={state.name}
        placeholder="Ej. Yennifer Almeyda"
        autoComplete="given-name"
        autoFocus
        required
        maxLength={60}
        aria-invalid={!!state.error}
        aria-describedby="name-help"
        disabled={isPending}
      />
      <p id="name-help" className={state.error ? 'text-sm font-medium text-primary' : 'text-sm text-muted-foreground'}>
        {state.error ?? 'Si alguien más tiene tu nombre, agrega tu apellido.'}
      </p>
      <Button type="submit" size="lg" className="mt-2 h-12 w-full text-base font-bold" disabled={isPending}>
        {isPending ? 'Ingresando…' : 'Ingresar'}
      </Button>
    </form>
  );
}
