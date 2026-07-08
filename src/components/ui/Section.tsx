import { cn } from '@/utils/cn';

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  /** Espacement vertical (sections aérées par défaut). */
  spacing?: 'sm' | 'md' | 'lg';
  /** Fond de section (tokens sémantiques). */
  tone?: 'background' | 'surface' | 'sand';
}

const spacingMap = {
  sm: 'py-16 sm:py-20',
  md: 'py-24 sm:py-28',
  lg: 'py-28 sm:py-36',
} as const;

const toneMap = {
  background: 'bg-background',
  surface: 'bg-surface',
  sand: 'bg-sand-50',
} as const;

/**
 * Section de page avec rythme vertical généreux et fond thématique.
 * `id` transmis pour l'ancrage (navigation, scroll).
 */
export function Section({
  spacing = 'lg',
  tone = 'background',
  className,
  children,
  ...rest
}: SectionProps) {
  return (
    <section className={cn(spacingMap[spacing], toneMap[tone], className)} {...rest}>
      {children}
    </section>
  );
}
