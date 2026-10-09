import type { Metadata } from 'next';
import Link from 'next/link';

import { SignInForm } from './sign-in-form';

// [DEMO] Logo comes from the local brand config (D-36, D-77).
import appConfig from '@/config/app-config.json';

export const metadata: Metadata = {
  title: 'Ingresar · KFC',
};

/**
 * Demo sign-in: name only (docs/variantes-y-vistas.md → /ingresar).
 * The route stays in Spanish because it is a URL the audience sees.
 * Always shows the form, even with a session: lets people switch names.
 * People arrive here from the public Home (bottom bar or offer, D-69).
 */
export default function SignInPage() {
  const { logo } = appConfig.brand;

  return (
    <main className="mx-auto flex min-h-dvh w-full flex-col bg-white sm:max-w-sm">
      <div className="bg-primary px-6 pb-10 pt-8 text-white">
        <img src={logo.defaultUrl} alt={logo.alt} />
        <h1 className="mt-6 text-3xl font-black tracking-tight">¡Bienvenido!</h1>
        <p className="mt-1 text-sm font-medium opacity-90">Crea tu cuenta solo con tu nombre.</p>
      </div>
      <div className="flex-1 px-6 py-8">
        <SignInForm />
        <Link href="/" className="mt-6 block text-center text-sm font-medium text-muted-foreground underline underline-offset-4">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
