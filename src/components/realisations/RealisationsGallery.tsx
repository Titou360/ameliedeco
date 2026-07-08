'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ProjectCard } from '@/components/realisations/ProjectCard';
import { projectCategories, type Realisation, type ProjectCategory } from '@/lib/realisations';
import { cn } from '@/utils/cn';

type Filter = 'Tous' | ProjectCategory;
const filters: Filter[] = ['Tous', ...projectCategories];

interface RealisationsGalleryProps {
  items: Realisation[];
  initialCount?: number;
  step?: number;
  paginate?: boolean;
}

/**
 * Grille de réalisations filtrable par catégorie. Optionnellement paginée
 * (« Voir plus », +step). Animation de layout douce, neutralisée en
 * reduced-motion via MotionConfig. Réutilisée par la home et /realisations.
 */
export function RealisationsGallery({
  items,
  initialCount = 6,
  step = 6,
  paginate = false,
}: RealisationsGalleryProps) {
  const [active, setActive] = useState<Filter>('Tous');
  const [visibleCount, setVisibleCount] = useState(initialCount);

  const filtered = useMemo(
    () => (active === 'Tous' ? items : items.filter((r) => r.category === active)),
    [active, items],
  );

  const cap = paginate ? visibleCount : initialCount;
  const shown = filtered.slice(0, cap);
  const canLoadMore = paginate && shown.length < filtered.length;

  function selectFilter(filter: Filter) {
    setActive(filter);
    setVisibleCount(initialCount);
  }

  return (
    <div>
      {/* Filtres */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrer par catégorie">
        {filters.map((filter) => {
          const isActive = active === filter;
          return (
            <button
              key={filter}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => selectFilter(filter)}
              className={cn(
                'cursor-pointer rounded-full border px-4 py-2 font-sans text-sm transition-colors duration-300',
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
          {shown.map((project, i) => (
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

      {/* Compteur accessible + pagination */}
      {paginate && (
        <div className="mt-12 flex flex-col items-center gap-4">
          <p aria-live="polite" className="font-sans text-sm text-muted">
            {shown.length} réalisation{shown.length > 1 ? 's' : ''} affichée
            {shown.length > 1 ? 's' : ''} sur {filtered.length}
          </p>
          {canLoadMore && (
            <Button variant="outline" onClick={() => setVisibleCount((c) => c + step)}>
              Voir plus
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
