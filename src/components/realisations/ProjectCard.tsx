import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Figure } from '@/components/ui/Figure';
import type { Realisation } from '@/lib/realisations';
import { cn } from '@/utils/cn';

interface ProjectCardProps {
  project: Realisation;
  /** Priorité de chargement image (premières cartes visibles). */
  priority?: boolean;
  className?: string;
}

/**
 * Carte de réalisation réutilisable (homepage + page Réalisations).
 * Zoom image et apparition des informations au survol (CSS, sans JS).
 */
export function ProjectCard({ project, priority = false, className }: ProjectCardProps) {
  return (
    <Link
      href={`/realisations/${project.slug}`}
      className={cn(
        'group block rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4',
        className,
      )}
      aria-label={`${project.title}, ${project.category} à ${project.city}`}
    >
      <div className="relative">
        <Figure
          src={project.image}
          alt={`${project.title} — ${project.projectType} à ${project.city}`}
          ratio="landscape"
          zoomOnHover
          priority={priority}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        {/* Voile bas + flèche au survol */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-lg bg-gradient-to-t from-espresso/45 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        />
        <span
          aria-hidden="true"
          className="absolute right-4 top-4 inline-flex h-10 w-10 translate-y-1 items-center justify-center rounded-full bg-cream/90 text-espresso opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"
        >
          <ArrowUpRight size={18} strokeWidth={1.5} />
        </span>
      </div>

      <div className="mt-4 flex items-baseline justify-between gap-4">
        <h3 className="font-display text-2xl transition-colors duration-300 group-hover:text-accent">
          {project.title}
        </h3>
        <span className="shrink-0 font-sans text-sm text-muted">{project.city}</span>
      </div>
      <p className="mt-1 font-sans text-sm text-muted">
        {project.projectType} · {project.surface}
      </p>
    </Link>
  );
}
