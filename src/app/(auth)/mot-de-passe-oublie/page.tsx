'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

const fieldClasses =
  'w-full rounded-md border border-border bg-surface px-4 py-3 font-sans text-sm text-foreground ' +
  'placeholder:text-muted/70 transition-colors focus:border-accent';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const res = await fetch('/api/password/forgot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: String(form.get('email') ?? '') }),
    });
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    setMessage(body.message ?? 'Si un compte existe, un email a été envoyé.');
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-sand-50 px-6 py-24">
      <Container size="narrow" className="max-w-md">
        <div className="rounded-xl border border-border bg-background p-8">
          <h1 className="font-display text-3xl">Mot de passe oublié</h1>
          {sent ? (
            <p className="mt-4 font-sans text-sm text-foreground">{message}</p>
          ) : (
            <>
              <p className="mt-2 font-sans text-sm text-muted">
                Renseignez votre e-mail : vous recevrez un lien pour choisir un nouveau mot de passe.
              </p>
              <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
                <div>
                  <label htmlFor="email" className="mb-2 block font-sans text-sm text-foreground">E-mail</label>
                  <input id="email" name="email" type="email" required autoComplete="email" className={fieldClasses} />
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? 'Envoi…' : 'Envoyer le lien'}
                </Button>
              </form>
            </>
          )}
          <p className="mt-6 font-sans text-sm text-muted">
            <Link href="/login" className="text-foreground underline hover:text-accent">Retour à la connexion</Link>
          </p>
        </div>
      </Container>
    </div>
  );
}
