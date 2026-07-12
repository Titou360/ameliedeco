'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const APP_PREFIXES = ['/admin', '/login', '/mot-de-passe-oublie', '/reinitialiser'];

/**
 * Affiche le header/footer marketing SAUF sur les pages applicatives
 * (admin + parcours d'authentification), pour un rendu « app » épuré.
 */
export function SiteChrome({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isApp = APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  return (
    <>
      {!isApp && header}
      {children}
      {!isApp && footer}
    </>
  );
}
