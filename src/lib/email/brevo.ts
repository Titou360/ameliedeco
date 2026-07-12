interface SendArgs {
  to: string;
  toName?: string;
  subject: string;
  html: string;
}

/**
 * Envoi d'un email transactionnel via l'API Brevo. Renvoie `false` (sans lever)
 * si la config est absente ou si l'API échoue — l'appelant décide de la suite.
 */
export async function sendEmail({ to, toName, subject, html }: SendArgs): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  const sender = process.env.BREVO_SENDER;
  if (!apiKey || !sender) {
    console.error('[email] BREVO_API_KEY/BREVO_SENDER manquant — email non envoyé.');
    return false;
  }
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { email: sender, name: 'Amélie Déco' },
        to: [{ email: to, ...(toName ? { name: toName } : {}) }],
        subject,
        htmlContent: html,
      }),
    });
    if (!res.ok) {
      console.error('[email] Brevo a répondu', res.status, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (err) {
    console.error('[email] envoi Brevo échoué :', err);
    return false;
  }
}
