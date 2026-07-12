import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/auth/users';
import { createResetToken } from '@/lib/auth/reset-tokens';
import { sendEmail } from '@/lib/email/brevo';
import { resetLinkEmail } from '@/lib/email/templates';

const GENERIC = {
  ok: true,
  message: 'Si un compte existe pour cette adresse, un email de réinitialisation a été envoyé.',
};

// Rate-limit best-effort en mémoire (par email) : max 3 / 15 min.
const hits = new Map<string, number[]>();
function limited(key: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  return arr.length > 3;
}

export async function POST(request: Request) {
  let email = '';
  try {
    const body = (await request.json()) as { email?: string };
    email = String(body.email ?? '').toLowerCase().trim();
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }
  if (!email || limited(email)) return NextResponse.json(GENERIC);

  try {
    const user = await getUserByEmail(email);
    if (user) {
      const token = await createResetToken(user.id);
      const base = process.env.NEXT_PUBLIC_SITE_URL ?? '';
      const url = `${base}/reinitialiser?uid=${user.id}&token=${token}`;
      await sendEmail({
        to: user.email,
        toName: user.name,
        subject: 'Réinitialisation de votre mot de passe',
        html: resetLinkEmail(url),
      });
    }
  } catch (err) {
    console.error('[forgot] échec :', err);
  }
  return NextResponse.json(GENERIC);
}
