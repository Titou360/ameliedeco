'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Figure } from '@/components/ui/Figure';
import { testimonials } from '@/lib/testimonials';
import { cn } from '@/utils/cn';

/**
 * Slider d'avis clients. Transitions douces (Framer Motion), navigation clavier
 * et boutons explicites. La zone est annoncée aux lecteurs d'écran (aria-live).
 */
export function TestimonialsSection() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const count = testimonials.length;

  const go = (dir: number) => {
    setDirection(dir);
    setIndex((prev) => (prev + dir + count) % count);
  };

  const current = testimonials[index];

  return (
    <Section tone="background" spacing="lg" aria-labelledby="avis-title">
      <Container size="wide">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-sans text-sm uppercase tracking-[0.2em] text-accent">Témoignages</p>
          <h2 id="avis-title" className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
            Ce que disent mes clients
          </h2>
        </div>

        <div className="relative mx-auto mt-14 max-w-3xl">
          <div className="min-h-64" aria-live="polite">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.figure
                key={index}
                custom={direction}
                initial={{ opacity: 0, x: direction * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -40 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col items-center text-center"
              >
                <div
                  className="flex gap-1 text-accent"
                  role="img"
                  aria-label={`Note : ${current.rating} sur 5`}
                >
                  {Array.from({ length: current.rating }).map((_, i) => (
                    <Star key={i} size={18} className="fill-current" strokeWidth={0} />
                  ))}
                </div>
                <blockquote className="mt-6 font-display text-2xl leading-snug sm:text-3xl">
                  « {current.quote} »
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-4">
                  <div className="h-12 w-12 overflow-hidden rounded-full">
                    <Figure
                      src={current.photo}
                      alt={`Photo de ${current.name}`}
                      ratio="square"
                      sizes="48px"
                      className="rounded-full shadow-none"
                    />
                  </div>
                  <div className="text-left">
                    <p className="font-sans text-sm font-medium text-foreground">{current.name}</p>
                    <p className="font-sans text-sm text-muted">{current.city}</p>
                  </div>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
          </div>

          {/* Contrôles */}
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Avis précédent"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border transition-colors hover:bg-sand-50"
            >
              <ChevronLeft size={18} strokeWidth={1.5} />
            </button>

            <div className="flex gap-2" role="tablist" aria-label="Choisir un avis">
              {testimonials.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Avis ${i + 1} sur ${count}`}
                  onClick={() => {
                    setDirection(i > index ? 1 : -1);
                    setIndex(i);
                  }}
                  className={cn(
                    'h-2 rounded-full transition-all duration-300',
                    i === index ? 'w-6 bg-espresso' : 'w-2 bg-border hover:bg-accent/60',
                  )}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Avis suivant"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border transition-colors hover:bg-sand-50"
            >
              <ChevronRight size={18} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </Container>
    </Section>
  );
}
