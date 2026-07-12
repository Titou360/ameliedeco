import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { RealisationsGallery } from '@/components/realisations/RealisationsGallery';
import { getPublishedRealisations } from '@/lib/db/realisations';

/**
 * Aperçu du portfolio sur la home : en-tête + grille filtrable (6 max) déléguée
 * à RealisationsGallery. Masquée s'il n'y a aucune réalisation publiée.
 */
export async function RealisationsSection() {
  const items = await getPublishedRealisations();
  if (items.length === 0) return null;

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

        <div className="mt-10">
          <RealisationsGallery items={items} initialCount={6} />
        </div>

        <div className="mt-12 lg:hidden">
          <Button href="/realisations" variant="outline" className="w-full">
            Toutes les réalisations
          </Button>
        </div>
      </Container>
    </Section>
  );
}
