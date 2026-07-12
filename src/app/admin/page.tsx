import { auth } from '@/auth';

export default async function AdminHomePage() {
  const session = await auth();
  const name = session?.user?.name ?? '';

  return (
    <div>
      <h1 className="font-display text-3xl">Bienvenue{name ? `, ${name}` : ''}</h1>
      <p className="mt-4 max-w-xl font-sans text-base leading-relaxed text-muted">
        Votre tableau de bord. La gestion des avis, réalisations et articles arrivera très
        prochainement (prochaine étape).
      </p>
    </div>
  );
}
