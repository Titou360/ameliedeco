'use client';

import { MotionConfig } from 'framer-motion';
import { SmoothScrollProvider } from './SmoothScrollProvider';

/**
 * Regroupe les providers clients de l'application.
 *
 * - `MotionConfig reducedMotion="user"` : Framer Motion respecte
 *   automatiquement `prefers-reduced-motion` sur toutes les animations.
 * - `SmoothScrollProvider` : smooth scroll Lenis (désactivé si reduced-motion).
 *
 * Monté une seule fois dans le layout racine pour englober tout le contenu
 * sans forcer le reste de l'app à devenir client.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScrollProvider>{children}</SmoothScrollProvider>
    </MotionConfig>
  );
}
