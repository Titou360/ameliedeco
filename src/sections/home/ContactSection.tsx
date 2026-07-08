'use client';

import { useState, type FormEvent } from 'react';
import { Mail, MapPin, Clock, Instagram, Facebook, Check } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { siteConfig } from '@/lib/site';
import { cn } from '@/utils/cn';

type Status = 'idle' | 'loading' | 'success' | 'error';

const fieldClasses =
  'w-full rounded-md border border-border bg-surface px-4 py-3 font-sans text-sm text-foreground ' +
  'placeholder:text-muted/70 transition-colors focus:border-accent';

const openingHours = [
  { day: 'Lundi – Vendredi', hours: '9h00 – 18h00' },
  { day: 'Samedi', hours: 'Sur rendez-vous' },
  { day: 'Dimanche', hours: 'Fermé' },
];

/**
 * Section contact : formulaire accessible (labels liés, erreurs annoncées,
 * honeypot anti-spam) + coordonnées et horaires. Soumet à /api/contact.
 */
export function ContactSection() {
  const [status, setStatus] = useState<Status>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus('loading');
    setErrors({});

    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setStatus('success');
        form.reset();
        return;
      }

      const body = (await res.json().catch(() => ({}))) as { errors?: Record<string, string> };
      if (body.errors) setErrors(body.errors);
      setStatus('error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <Section id="contact" tone="surface" spacing="lg" aria-labelledby="contact-title">
      <Container size="wide">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Colonne informations */}
          <div className="lg:col-span-5">
            <p className="font-sans text-sm uppercase tracking-[0.2em] text-accent">Contact</p>
            <h2 id="contact-title" className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
              Discutons de votre projet
            </h2>
            <p className="mt-5 font-sans text-lg leading-relaxed text-muted">
              Parlez-moi de votre espace et de vos envies. Je vous réponds avec plaisir pour
              imaginer ensemble un lieu qui vous ressemble.
            </p>

            <ul className="mt-10 space-y-5">
              <li className="flex items-start gap-3">
                <Mail size={18} strokeWidth={1.5} className="mt-0.5 text-accent" aria-hidden="true" />
                <a
                  href={`mailto:${siteConfig.email}`}
                  className="font-sans text-sm text-foreground transition-colors hover:text-accent"
                >
                  {siteConfig.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} strokeWidth={1.5} className="mt-0.5 text-accent" aria-hidden="true" />
                <span className="font-sans text-sm text-foreground">
                  {siteConfig.address.locality} ({siteConfig.address.postalCode}),{' '}
                  {siteConfig.address.region}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <Clock size={18} strokeWidth={1.5} className="mt-0.5 text-accent" aria-hidden="true" />
                <ul className="font-sans text-sm text-foreground">
                  {openingHours.map((slot) => (
                    <li key={slot.day} className="flex gap-2">
                      <span className="w-40 text-muted">{slot.day}</span>
                      <span>{slot.hours}</span>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>

            <div className="mt-8 flex gap-3">
              <a
                href={siteConfig.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram d'Amélie Déco"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border transition-colors hover:bg-sand-50"
              >
                <Instagram size={18} strokeWidth={1.5} />
              </a>
              <a
                href={siteConfig.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook d'Amélie Déco"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border transition-colors hover:bg-sand-50"
              >
                <Facebook size={18} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Colonne formulaire */}
          <div className="lg:col-span-7">
            {status === 'success' ? (
              <div
                role="status"
                className="flex h-full min-h-80 flex-col items-center justify-center rounded-xl border border-accent/40 bg-sand-50 p-10 text-center"
              >
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-espresso text-cream">
                  <Check size={26} strokeWidth={1.5} />
                </span>
                <p className="mt-6 font-display text-2xl">Merci pour votre message</p>
                <p className="mt-2 font-sans text-sm text-muted">
                  Je vous réponds dans les meilleurs délais.
                </p>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="rounded-xl border border-border bg-background p-6 sm:p-8">
                {/* Honeypot anti-spam (masqué) */}
                <div className="hidden" aria-hidden="true">
                  <label htmlFor="company">Ne pas remplir</label>
                  <input id="company" name="company" type="text" tabIndex={-1} autoComplete="off" />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Nom" name="name" required error={errors.name} autoComplete="name" />
                  <Field
                    label="E-mail"
                    name="email"
                    type="email"
                    required
                    error={errors.email}
                    autoComplete="email"
                  />
                  <Field label="Téléphone" name="phone" type="tel" autoComplete="tel" />
                  <Field label="Sujet" name="subject" />
                </div>

                <div className="mt-5">
                  <label htmlFor="message" className="mb-2 block font-sans text-sm text-foreground">
                    Votre message <span className="text-accent">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    required
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'message-error' : undefined}
                    className={cn(fieldClasses, 'resize-y')}
                    placeholder="Décrivez votre projet, votre espace, vos envies…"
                  />
                  {errors.message && (
                    <p id="message-error" className="mt-2 font-sans text-sm text-red-700">
                      {errors.message}
                    </p>
                  )}
                </div>

                {status === 'error' && !Object.keys(errors).length && (
                  <p role="alert" className="mt-4 font-sans text-sm text-red-700">
                    Une erreur est survenue. Merci de réessayer ou de m&apos;écrire directement par
                    e-mail.
                  </p>
                )}

                <div className="mt-6">
                  <Button type="submit" size="lg" disabled={status === 'loading'}>
                    {status === 'loading' ? 'Envoi…' : 'Envoyer le message'}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </Container>
    </Section>
  );
}

/** Champ de formulaire libellé et accessible. */
function Field({
  label,
  name,
  type = 'text',
  required = false,
  error,
  autoComplete,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block font-sans text-sm text-foreground">
        {label} {required && <span className="text-accent">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        className={fieldClasses}
      />
      {error && (
        <p id={`${name}-error`} className="mt-2 font-sans text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
