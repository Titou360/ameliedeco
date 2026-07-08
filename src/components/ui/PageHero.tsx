import { Container } from '@/components/ui/Container';
import { Reveal } from '@/animations/Reveal';
import { Breadcrumbs, type Crumb } from '@/components/ui/Breadcrumbs';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumb?: Crumb[];
}

/**
 * En-tête d'intro des pages internes (sans hero sombre). Fond sable, titre
 * display (h1 unique de la page). Padding haut généreux pour passer sous le
 * header fixe (h-18 = 72px), qui est déjà solide hors accueil.
 */
export function PageHero({ eyebrow, title, description, breadcrumb }: PageHeroProps) {
  return (
    <section className="border-b border-border bg-sand-50 pb-14 pt-32 sm:pb-16 sm:pt-40">
      <Container size="wide">
        {breadcrumb && (
          <div className="mb-8">
            <Breadcrumbs items={breadcrumb} />
          </div>
        )}
        <Reveal>
          {eyebrow && (
            <p className="font-sans text-sm uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
          )}
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight sm:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-muted">
              {description}
            </p>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
