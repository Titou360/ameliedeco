import { NextResponse } from 'next/server';
import { siteConfig } from '@/lib/site';
import { sendEmail } from '@/lib/email/brevo';
import { contactEmail } from '@/lib/email/templates';

/**
 * Route handler du formulaire de contact : valide côté serveur puis envoie le
 * message à l'adresse d'Amélie via Brevo. Honeypot anti-spam.
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

  const sent = await sendEmail({
    to: siteConfig.email,
    subject: `Nouveau message${data.subject ? ` — ${data.subject}` : ''}`,
    html: contactEmail({
      name: data.name!.trim(),
      email: data.email!.trim(),
      phone: data.phone?.trim(),
      subject: data.subject?.trim(),
      message: data.message!.trim(),
    }),
  });

  if (!sent) {
    return NextResponse.json(
      { error: "L'envoi a échoué. Merci de réessayer ou d'écrire directement par e-mail." },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true });
}
