import Link from 'next/link';
import { cn } from '@/utils/cn';
import { siteConfig } from '@/lib/site';

interface LogoProps {
  className?: string;
  /** Libellé accessible du lien. */
  label?: string;
}

/**
 * Wordmark de la marque « Amélie Déco ». Typographie display, lettrage soigné.
 * Rendu texte (net à toute résolution, sélectionnable, parfait pour le SEO).
 */
export function Logo({ className, label = "Amélie Déco, retour à l'accueil" }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label={label}
      className={cn(
        'inline-flex items-baseline gap-2 font-display leading-none tracking-tight',
        'text-2xl transition-opacity duration-300 hover:opacity-70',
        className,
      )}
    >
      <span className="font-medium">Amélie</span>
      <span className="text-[0.7em] uppercase tracking-[0.3em] text-accent">
        {siteConfig.address.region}
      </span>
    </Link>
  );
}
