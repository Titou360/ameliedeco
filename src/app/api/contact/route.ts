import { NextResponse } from 'next/server';

/**
 * Route handler du formulaire de contact.
 *
 * Valide les champs côté serveur puis renvoie une réponse JSON.
 * TODO (mise en production) : brancher un service d'e-mail (ex. Resend) pour
 * transmettre le message à {siteConfig.email}. Les identifiants iront dans les
 * variables d'environnement Vercel — aucun secret dans le code.
 */
interface ContactPayload {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  /** Champ piège anti-spam (doit rester vide). */
  company?: string;
}

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function POST(request: Request) {
  let data: ContactPayload;
  try {
    data = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  // Honeypot : un bot remplira ce champ caché.
  if (data.company) {
    return NextResponse.json({ ok: true });
  }

  const errors: Record<string, string> = {};
  if (!data.name?.trim()) errors.name = 'Votre nom est requis.';
  if (!data.email?.trim() || !isEmail(data.email)) errors.email = 'Un e-mail valide est requis.';
  if (!data.message?.trim() || data.message.trim().length < 10)
    errors.message = 'Votre message doit contenir au moins 10 caractères.';

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  // TODO : envoi de l'e-mail via un service tiers (Resend, etc.).
  // await sendEmail({ to: siteConfig.email, ...data });

  return NextResponse.json({ ok: true });
}
