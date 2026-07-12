'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

const fieldClasses =
  'w-full rounded-md border border-border bg-surface px-4 py-3 font-sans text-sm text-foreground ' +
  'placeholder:text-muted/70 transition-colors focus:border-accent';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const res = await signIn('credentials', {
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError('Identifiants invalides.');
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-sand-50 px-6 py-24">
      <Container size="narrow" className="max-w-md">
        <div className="rounded-xl border border-border bg-background p-8">
          <h1 className="font-display text-3xl">Administration</h1>
          <p className="mt-2 font-sans text-sm text-muted">Connectez-vous pour accéder au tableau de bord.</p>
          <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block font-sans text-sm text-foreground">E-mail</label>
              <input id="email" name="email" type="email" required autoComplete="email" className={fieldClasses} />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block font-sans text-sm text-foreground">Mot de passe</label>
              <input id="password" name="password" type="password" required autoComplete="current-password" className={fieldClasses} />
            </div>
            {error && <p role="alert" className="font-sans text-sm text-red-700">{error}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </Button>
          </form>
          <p className="mt-6 font-sans text-sm text-muted">
            <Link href="/mot-de-passe-oublie" className="text-foreground underline hover:text-accent">
              Mot de passe oublié ?
            </Link>
          </p>
        </div>
      </Container>
    </div>
  );
}
