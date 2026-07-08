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
        <Hero />
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
