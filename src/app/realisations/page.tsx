import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { PageHero } from '@/components/ui/PageHero';
import { RealisationsGallery } from '@/components/realisations/RealisationsGallery';
import { getAllRealisations } from '@/lib/realisations';

export const metadata: Metadata = {
  title: 'Réalisations',
  description:
    "Une sélection de projets de décoration et d'aménagement d'intérieur réalisés à Bordeaux et en Gironde.",
  alternates: { canonical: '/realisations' },
};

export default function RealisationsPage() {
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
          <RealisationsGallery items={getAllRealisations()} initialCount={6} step={6} paginate />
        </Container>
      </Section>
    </>
  );
}
