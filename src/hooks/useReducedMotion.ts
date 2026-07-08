'use client';

import { useEffect, useState } from 'react';

/**
 * Retourne `true` si l'utilisateur a demandé une réduction des animations
 * (`prefers-reduced-motion: reduce`). Réactif aux changements de préférence.
 *
 * Toute animation JS (Framer Motion / GSAP / Lenis) doit consulter ce hook
 * pour se désactiver et respecter l'accessibilité.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mql.matches);

    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
