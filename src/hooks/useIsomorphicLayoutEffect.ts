import { useEffect, useLayoutEffect } from 'react';

/**
 * `useLayoutEffect` côté client, `useEffect` côté serveur (évite les
 * avertissements SSR). Utile pour l'orchestration GSAP au montage.
 */
export const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;
