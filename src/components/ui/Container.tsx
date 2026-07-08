import { cn } from '@/utils/cn';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Largeur maximale du conteneur. */
  size?: 'default' | 'narrow' | 'wide';
  as?: 'div' | 'section' | 'header' | 'footer' | 'nav' | 'main';
}

const sizeMap = {
  narrow: 'max-w-3xl',
  default: 'max-w-7xl',
  wide: 'max-w-360',
} as const;

/**
 * Conteneur centré à gouttières cohérentes (grille rigoureuse du projet).
 */
export function Container({
  size = 'default',
  as: Tag = 'div',
  className,
  children,
  ...rest
}: ContainerProps) {
  return (
    <Tag
      className={cn('mx-auto w-full px-6 sm:px-8 lg:px-12', sizeMap[size], className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}
