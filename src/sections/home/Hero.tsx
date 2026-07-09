'use client';

import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { siteConfig, primaryCta } from '@/lib/site';

interface HeroProps {
  /** Image de fond (public/). Placeholder espresso si absente. */
  image?: string;
}

// Easing éditorial partagé (tuple typé pour Framer Motion).
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

// Animation d'entrée mot à mot du titre (respecte reduced-motion via MotionConfig).
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};
const word: Variants = {
  hidden: { opacity: 0, y: '0.4em' },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

/**
 * Hero plein écran. Fond sombre (image ou dégradé espresso) pour garantir la
 * lisibilité du texte crème et du header transparent. Titre révélé mot à mot,
 * léger parallax possible à l'étape Three.js.
 */
export function Hero({ image }: HeroProps) {
  const titleWords = siteConfig.tagline.split(' ');

  return (
    <section className="relative flex min-h-svh items-end overflow-hidden bg-espresso text-cream">
      {/* Fond */}
      <div className="absolute inset-0">
        {image ? (
          <Image
            src={image}
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              backgroundImage:
                'radial-gradient(120% 80% at 70% 10%, #3a2a1d 0%, #271a12 45%, #1a1109 100%)',
            }}
          />
        )}
        {/* Voile dégradé pour le contraste (WCAG). */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to top, rgba(26,17,9,0.85) 0%, rgba(26,17,9,0.35) 45%, rgba(26,17,9,0.25) 100%)',
          }}
        />
      </div>

      {/* Contenu */}
      <Container size="wide" className="relative z-10 pb-20 pt-40 sm:pb-28">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="font-sans text-sm uppercase tracking-[0.28em] text-cream/70"
        >
          Décoratrice d&apos;intérieur · {siteConfig.address.locality}, {siteConfig.address.region}
        </motion.p>

        <motion.h1
          variants={container}
          initial="hidden"
          animate="show"
          className="mt-8 max-w-5xl font-display text-[3.25rem] leading-[1.02] sm:text-8xl"
        >
          {titleWords.map((w, i) => (
            <span key={`${w}-${i}`} className="inline-block overflow-hidden pb-[0.05em]">
              <motion.span variants={word} className="inline-block">
                {w}
                {i < titleWords.length - 1 ? ' ' : ''}
              </motion.span>
            </span>
          ))}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 max-w-xl font-sans text-lg leading-relaxed text-cream/85"
        >
          Conseil déco, aménagement 3D, relooking et home staging. Des lieux qui vous
          ressemblent, où l&apos;esthétisme et le bien-être se rencontrent.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="mt-12 flex flex-wrap gap-4"
        >
          <Button href={primaryCta.href} size="lg">
            {primaryCta.label}
          </Button>
          <Button href="/realisations" size="lg" variant="outlineOnDark">
            Voir les réalisations
            <ArrowUpRight
              size={18}
              strokeWidth={1.5}
              className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </Button>
        </motion.div>
      </Container>

      {/* Indicateur de scroll */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.8 }}
        className="absolute inset-x-0 bottom-6 z-10 flex justify-center"
      >
        <span className="inline-flex flex-col items-center gap-2 text-cream/60">
          <span className="font-sans text-xs uppercase tracking-[0.2em]">Défiler</span>
          <ChevronDown size={18} strokeWidth={1.5} className="animate-bounce" />
        </span>
      </motion.div>
    </section>
  );
}
