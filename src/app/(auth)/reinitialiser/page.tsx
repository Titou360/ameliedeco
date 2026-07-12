'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { isPasswordValid } from '@/lib/auth/password-policy';

const fieldClasses =
  'w-full rounded-md border border-border bg-surface px-4 py-3 font-sans text-sm text-foreground ' +
  'placeholder:text-muted/70 transition-colors focus:border-accent';

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const uid = params.get('uid') ?? '';
  const token = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const ready = isPasswordValid(password) && password === confirm;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready) return;
    setError('');
    setLoading(true);
    const res = await fetch('/api/password/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, token, password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push('/login?reset=1');
      return;
    }
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    setError(body.error ?? 'Une erreur est survenue.');
  }

  if (!uid || !token) {
    return <p className="mt-4 font-sans text-sm text-red-700">Lien invalide ou incomplet.</p>;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
      <div>
        <label htmlFor="password" className="mb-2 block font-sans text-sm text-foreground">Nouveau mot de passe</label>
        <input id="password" type="password" required autoComplete="new-password" className={fieldClasses}
          value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div>
        <label htmlFor="confirm" className="mb-2 block font-sans text-sm text-foreground">Confirmer le mot de passe</label>
        <input id="confirm" type="password" required autoComplete="new-password" className={fieldClasses}
          value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>
      <PasswordStrength password={password} confirm={confirm} />
      {error && <p role="alert" className="font-sans text-sm text-red-700">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={!ready || loading}>
        {loading ? 'Validation…' : 'Valider le nouveau mot de passe'}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-sand-50 px-6 py-24">
      <Container size="narrow" className="max-w-md">
        <div className="rounded-xl border border-border bg-background p-8">
          <h1 className="font-display text-3xl">Nouveau mot de passe</h1>
          <Suspense fallback={<p className="mt-4 font-sans text-sm text-muted">Chargement…</p>}>
            <ResetForm />
          </Suspense>
          <p className="mt-6 font-sans text-sm text-muted">
            <Link href="/login" className="text-foreground underline hover:text-accent">Retour à la connexion</Link>
          </p>
        </div>
      </Container>
    </div>
  );
}
