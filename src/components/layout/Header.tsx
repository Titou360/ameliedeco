'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/Button';
import { mainNav, primaryCta } from '@/lib/site';
import { cn } from '@/utils/cn';

interface HeaderProps {
  /**
   * Transparent au sommet (au-dessus d'un hero sombre), solide au scroll.
   * Si omis, activé automatiquement sur la page d'accueil.
   */
  transparentOnTop?: boolean;
}

/**
 * En-tête sticky, élégant et accessible.
 *
 * - Transparent au-dessus du hero puis fond crème au scroll (option).
 * - Menu mobile plein écran animé (Framer Motion), fermé par Échap ou clic.
 * - Lien actif mis en valeur, navigation clavier et `aria-expanded` gérés.
 */
export function Header({ transparentOnTop }: HeaderProps) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  // Par défaut : transparent uniquement sur l'accueil (hero plein écran).
  const transparent = transparentOnTop ?? pathname === '/';

  // Détecte le défilement pour basculer transparent → solide.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Ferme le menu à la navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Échap ferme le menu + verrouille le scroll de fond quand ouvert.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const solid = scrolled || !transparent || open;

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-colors duration-500',
        solid
          ? 'border-b border-border/70 bg-background/85 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="mx-auto flex h-18 max-w-360 items-center justify-between px-6 sm:px-8 lg:px-12">
        <Logo className={cn(!solid && 'text-cream')} />

        {/* Navigation desktop */}
        <nav aria-label="Navigation principale" className="hidden lg:block">
          <ul className="flex items-center gap-8">
            {mainNav.map((item) => {
              const active =
                item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative py-1 font-sans text-sm transition-colors duration-300',
                      'after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left',
                      'after:scale-x-0 after:bg-current after:transition-transform after:duration-300',
                      'hover:after:scale-x-100',
                      active && 'after:scale-x-100',
                      solid ? 'text-foreground' : 'text-cream',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden lg:block">
            <Button href={primaryCta.href} size="sm" variant={solid ? 'primary' : 'outline'}>
              {primaryCta.label}
            </Button>
          </div>

          {/* Bouton menu mobile */}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'}
            className={cn(
              'inline-flex h-11 w-11 items-center justify-center rounded-md lg:hidden',
              'transition-colors hover:bg-sand-50',
              solid ? 'text-foreground' : 'text-cream',
            )}
          >
            {open ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Overlay menu mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            id="menu-mobile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 top-18 z-40 bg-background lg:hidden"
          >
            <nav aria-label="Navigation mobile" className="flex h-full flex-col px-6 pb-10 pt-8">
              <ul className="flex flex-col gap-2">
                {mainNav.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * i + 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <Link
                      href={item.href}
                      className="block border-b border-border py-4 font-display text-3xl"
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <div className="mt-auto pt-8">
                <Button href={primaryCta.href} size="lg" className="w-full">
                  {primaryCta.label}
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
