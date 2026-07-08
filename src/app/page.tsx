import type { Metadata } from 'next';
import { Hero } from '@/sections/home/Hero';
import { TrustSection } from '@/sections/home/TrustSection';
import { PresentationSection } from '@/sections/home/PresentationSection';
import { RealisationsSection } from '@/sections/home/RealisationsSection';
import { ProcessSection } from '@/sections/home/ProcessSection';
import { TestimonialsSection } from '@/sections/home/TestimonialsSection';
import { ServiceAreaSection } from '@/sections/home/ServiceAreaSection';
import { ContactSection } from '@/sections/home/ContactSection';
import { JsonLd } from '@/components/seo/JsonLd';
import { localBusinessJsonLd } from '@/lib/structured-data';
import { siteConfig } from '@/lib/site';
import { assetExists } from '@/lib/assets';

/**
 * Image de fond du hero. Pour changer de format, modifie UNIQUEMENT cette
 * constante (ex. '/images/hero.webp' ou '/images/hero.png'). Si le fichier
 * n'existe pas, le hero retombe automatiquement sur son dégradé espresso.
 */
const HERO_IMAGE = '/images/hero.jpg';

export const metadata: Metadata = {
  title: `${siteConfig.legalName} — Décoratrice d'intérieur à Bordeaux`,
  description: siteConfig.description,
  alternates: { canonical: '/' },
};

/**
 * Page d'accueil. Récit en sections : Hero → Confiance → Présentation →
 * Réalisations → Processus → Avis → Zone d'intervention → Contact.
 */
export default function HomePage() {
  return (
    <>
      <JsonLd data={localBusinessJsonLd()} />
      <main id="contenu">
        <Hero image={assetExists(HERO_IMAGE) ? HERO_IMAGE : undefined} />
        <TrustSection />
        <PresentationSection />
        <RealisationsSection />
        <ProcessSection />
        <TestimonialsSection />
        <ServiceAreaSection />
        <ContactSection />
      </main>
    </>
  );
}
