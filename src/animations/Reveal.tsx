'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/utils/cn';

type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

interface RevealProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  /** Sens d'entrée du contenu. */
  direction?: Direction;
  /** Délai avant l'animation (s). Utile pour des cascades. */
  delay?: number;
  /** Distance de translation (px). */
  distance?: number;
  /** Déclenche une seule fois (par défaut) ou à chaque entrée. */
  once?: boolean;
  as?: 'div' | 'section' | 'article' | 'li' | 'span';
}

const offsetFor = (direction: Direction, distance: number) => {
  switch (direction) {
    case 'up':
      return { y: distance };
    case 'down':
      return { y: -distance };
    case 'left':
      return { x: distance };
    case 'right':
      return { x: -distance };
    default:
      return {};
  }
};

/**
 * Wrapper de révélation au scroll, réutilisable.
 *
 * S'appuie sur `MotionConfig reducedMotion="user"` (voir AppProviders) :
 * lorsque l'utilisateur demande une réduction des animations, Framer Motion
 * neutralise les transforms et n'anime que l'opacité de façon instantanée.
 */
export function Reveal({
  direction = 'up',
  delay = 0,
  distance = 24,
  once = true,
  as = 'div',
  className,
  children,
  ...rest
}: RevealProps) {
  // Cast : tous les éléments `motion.*` acceptent le même jeu de props au
  // runtime ; on unifie le type sur `motion.div` pour la vérification statique.
  const MotionTag = motion[as] as typeof motion.div;

  return (
    <MotionTag
      className={cn(className)}
      initial={{ opacity: 0, ...offsetFor(direction, distance) }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
