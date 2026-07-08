'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { ProjectCard } from '@/components/realisations/ProjectCard';
import { realisations, projectCategories, type ProjectCategory } from '@/lib/realisations';
import { cn } from '@/utils/cn';

type Filter = 'Tous' | ProjectCategory;
const filters: Filter[] = ['Tous', ...projectCategories];

/**
 * Aperçu du portfolio avec filtres par catégorie. La grille se recompose avec
 * une animation de layout douce (Framer Motion), neutralisée en reduced-motion.
 */
export function RealisationsSection() {
  const [active, setActive] = useState<Filter>('Tous');

  const visible = useMemo(
    () => (active === 'Tous' ? realisations : realisations.filter((r) => r.category === active)),
    [active],
  );

  return (
    <Section tone="background" spacing="lg" aria-labelledby="realisations-title">
      <Container size="wide">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="realisations-title"
            eyebrow="Réalisations"
            title="Des intérieurs qui racontent une histoire"
            intro="Une sélection de projets pensés sur mesure, entre esthétisme et bien-être."
          />
          <div className="hidden lg:block">
            <Button href="/realisations" variant="outline">
              Toutes les réalisations
            </Button>
          </div>
        </div>

        {/* Filtres */}
        <div className="mt-10 flex flex-wrap gap-2" role="tablist" aria-label="Filtrer par catégorie">
          {filters.map((filter) => {
            const isActive = active === filter;
            return (
              <button
                key={filter}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(filter)}
                className={cn(
                  'rounded-full border px-4 py-2 font-sans text-sm transition-colors duration-300',
                  isActive
                    ? 'border-espresso bg-espresso text-cream'
                    : 'border-border bg-transparent text-foreground hover:border-accent/60',
                )}
              >
                {filter}
              </button>
            );
          })}
        </div>

        {/* Grille */}
        <motion.ul layout className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((project, i) => (
              <motion.li
                key={project.slug}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              >
                <ProjectCard project={project} priority={i < 3} />
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>

        <div className="mt-12 lg:hidden">
          <Button href="/realisations" variant="outline" className="w-full">
            Toutes les réalisations
          </Button>
        </div>
      </Container>
    </Section>
  );
}
