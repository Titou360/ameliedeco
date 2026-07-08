'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/**
 * Fournit le smooth scroll (Lenis) à toute l'application.
 *
 * - Désactivé automatiquement si `prefers-reduced-motion: reduce`
 *   (le scroll natif prend alors le relais).
 * - Expose l'instance Lenis via contexte pour synchroniser d'autres
 *   animations (GSAP ScrollTrigger) à l'étape dédiée.
 * - Boucle RAF unique, nettoyée au démontage (aucune fuite mémoire).
 */
const LenisContext = createContext<Lenis | null>(null);

/** Accès à l'instance Lenis courante (ou `null` si désactivée). */
export function useLenisInstance(): Lenis | null {
  return useContext(LenisContext);
}

export function SmoothScrollProvider({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (reducedMotion) return;

    const instance = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.2,
    });
    setLenis(instance);

    const raf = (time: number) => {
      instance.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };
    rafRef.current = requestAnimationFrame(raf);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      instance.destroy();
      setLenis(null);
    };
  }, [reducedMotion]);

  return <LenisContext.Provider value={lenis}>{children}</LenisContext.Provider>;
}
