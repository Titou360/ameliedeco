import { NextResponse } from 'next/server';
import { getUserById, updateUserPassword } from '@/lib/auth/users';
import { consumeResetToken } from '@/lib/auth/reset-tokens';
import { hashPassword } from '@/lib/auth/password';
import { isPasswordValid } from '@/lib/auth/password-policy';
import { sendEmail } from '@/lib/email/brevo';
import { passwordChangedEmail } from '@/lib/email/templates';

export async function POST(request: Request) {
  let uid = '';
  let token = '';
  let password = '';
  try {
    const body = (await request.json()) as { uid?: string; token?: string; password?: string };
    uid = String(body.uid ?? '');
    token = String(body.token ?? '');
    password = String(body.password ?? '');
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  if (!uid || !token) return NextResponse.json({ error: 'Lien invalide.' }, { status: 400 });
  if (!isPasswordValid(password))
    return NextResponse.json({ error: 'Le mot de passe ne respecte pas les critères.' }, { status: 422 });

  const ok = await consumeResetToken(uid, token);
  if (!ok)
    return NextResponse.json(
      { error: 'Lien expiré ou déjà utilisé. Merci de refaire une demande.' },
      { status: 400 },
    );

  const user = await getUserById(uid);
  if (!user) return NextResponse.json({ error: 'Compte introuvable.' }, { status: 400 });

  await updateUserPassword(uid, await hashPassword(password));
  await sendEmail({
    to: user.email,
    toName: user.name,
    subject: 'Votre mot de passe a été modifié',
    html: passwordChangedEmail(),
  });
  return NextResponse.json({ ok: true });
}
