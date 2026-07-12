const wrap = (title: string, body: string) => `
  <div style="font-family: Arial, Helvetica, sans-serif; color: #271a12; max-width: 560px; margin: 0 auto;">
    <h1 style="font-size: 20px; color: #271a12;">${title}</h1>
    ${body}
    <p style="font-size: 12px; color: #6f6455; margin-top: 32px;">Amélie Déco — Décoratrice d'intérieur</p>
  </div>`;

export function resetLinkEmail(url: string): string {
  return wrap(
    'Réinitialisation de votre mot de passe',
    `<p>Vous avez demandé à réinitialiser votre mot de passe. Ce lien est valable 1 heure et à usage unique :</p>
     <p><a href="${url}" style="color: #304254;">Choisir un nouveau mot de passe</a></p>
     <p style="font-size: 13px; color: #6f6455;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>`,
  );
}

export function passwordChangedEmail(): string {
  return wrap(
    'Votre mot de passe a bien été modifié',
    `<p>Votre mot de passe vient d'être modifié avec succès.</p>
     <p style="font-size: 13px; color: #6f6455;">Si vous n'êtes pas à l'origine de ce changement, contactez-nous immédiatement.</p>`,
  );
}

export function contactEmail(p: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}): string {
  return wrap(
    'Nouveau message depuis le site',
    `<p><strong>Nom :</strong> ${p.name}</p>
     <p><strong>Email :</strong> ${p.email}</p>
     ${p.phone ? `<p><strong>Téléphone :</strong> ${p.phone}</p>` : ''}
     ${p.subject ? `<p><strong>Sujet :</strong> ${p.subject}</p>` : ''}
     <p><strong>Message :</strong></p>
     <p style="white-space: pre-wrap;">${p.message}</p>`,
  );
}
