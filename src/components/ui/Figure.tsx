import Image from 'next/image';
import { cn } from '@/utils/cn';

type Ratio = 'square' | 'portrait' | 'landscape' | 'wide' | 'hero';

const ratioMap: Record<Ratio, string> = {
  square: 'aspect-square',
  portrait: 'aspect-[3/4]',
  landscape: 'aspect-[4/3]',
  wide: 'aspect-[16/10]',
  hero: 'aspect-[16/9]',
};

interface FigureProps {
  /** Chemin de l'image (public/). Si absent, un placeholder élégant est rendu. */
  src?: string;
  /** Texte alternatif — obligatoire pour l'accessibilité. */
  alt: string;
  ratio?: Ratio;
  /** Tailles responsives pour l'optimisation next/image. */
  sizes?: string;
  /** Chargement prioritaire (LCP, ex. hero). */
  priority?: boolean;
  className?: string;
  /** Effet de zoom au survol (cartes de réalisations). */
  zoomOnHover?: boolean;
}

/**
 * Média encadré, coins arrondis, ombre discrète.
 *
 * - Avec `src` : `next/image` (AVIF/WebP, lazy, ratio fixe → zéro CLS).
 * - Sans `src` : placeholder chaud dégradé (palette de marque) que la cliente
 *   remplacera par une vraie photo sans modifier le code.
 */
export function Figure({
  src,
  alt,
  ratio = 'landscape',
  sizes = '(max-width: 768px) 100vw, 50vw',
  priority = false,
  className,
  zoomOnHover = false,
}: FigureProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-lg bg-sand-100 shadow-soft',
        ratioMap[ratio],
        className,
      )}
    >
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={cn(
            'object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]',
            zoomOnHover && 'group-hover:scale-105',
          )}
        />
      ) : (
        <div
          role="img"
          aria-label={alt}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            backgroundImage:
              'linear-gradient(135deg, var(--color-sand-200) 0%, var(--color-taupe) 55%, var(--color-sage) 100%)',
          }}
        >
          <span
            aria-hidden="true"
            className="absolute inset-0 opacity-[0.12]"
            style={{
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 22px, rgba(39,26,18,0.5) 22px, rgba(39,26,18,0.5) 23px)',
            }}
          />
          <span className="relative font-display text-lg italic text-espresso/50">
            Amélie Déco
          </span>
        </div>
      )}
    </div>
  );
}
