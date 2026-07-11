import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { PageHero } from '@/components/ui/PageHero';
import { RealisationsGallery } from '@/components/realisations/RealisationsGallery';
import { getPublishedRealisations } from '@/lib/db/realisations';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Réalisations',
  description:
    "Une sélection de projets de décoration et d'aménagement d'intérieur réalisés à Bordeaux et en Gironde.",
  alternates: { canonical: '/realisations' },
};

export default async function RealisationsPage() {
  const items = await getPublishedRealisations();

  return (
    <>
      <PageHero
        eyebrow="Réalisations"
        title="Des intérieurs qui racontent une histoire"
        description="Chaque projet est unique, pensé sur mesure entre esthétisme et bien-être. Filtrez par type de lieu."
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'Réalisations', href: '/realisations' },
        ]}
      />
      <Section tone="background" spacing="lg">
        <Container size="wide">
          {items.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-xl border border-border bg-surface p-10 text-center sm:p-14">
              <p className="font-display text-2xl">Les réalisations arrivent bientôt</p>
              <p className="mx-auto mt-4 max-w-md font-sans text-base leading-relaxed text-muted">
                Les premiers projets seront présentés ici très prochainement.
              </p>
            </div>
          ) : (
            <RealisationsGallery items={items} initialCount={6} step={6} paginate />
          )}
        </Container>
      </Section>
    </>
  );
}
