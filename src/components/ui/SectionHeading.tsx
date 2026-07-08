import { Reveal } from '@/animations/Reveal';
import { cn } from '@/utils/cn';

interface SectionHeadingProps {
  /** Sur-titre court (uppercase, tracking large). */
  eyebrow?: string;
  /** Titre principal. */
  title: string;
  /** Paragraphe d'introduction optionnel. */
  intro?: string;
  align?: 'left' | 'center';
  /** Balise de titre pour la hiérarchie sémantique. */
  as?: 'h2' | 'h3';
  /** Identifiant posé sur le titre (pour `aria-labelledby`). */
  id?: string;
  className?: string;
}

/**
 * En-tête de section réutilisable (eyebrow + titre + intro), révélé au scroll.
 * Garantit une hiérarchie typographique cohérente sur tout le site.
 */
export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = 'left',
  as: Tag = 'h2',
  id,
  className,
}: SectionHeadingProps) {
  return (
    <Reveal
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        className,
      )}
    >
      {eyebrow && (
        <p className="font-sans text-sm uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
      )}
      <Tag id={id} className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
        {title}
      </Tag>
      {intro && <p className="mt-5 font-sans text-lg leading-relaxed text-muted">{intro}</p>}
    </Reveal>
  );
}
