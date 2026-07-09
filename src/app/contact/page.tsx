import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { ContactSection } from '@/sections/home/ContactSection';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    "Contactez Amélie Megdad, décoratrice d'intérieur à Bordeaux et en Gironde, pour discuter de votre projet de décoration ou d'aménagement.",
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Discutons de votre projet"
        description="Parlez-moi de votre espace et de vos envies. Je vous réponds avec plaisir."
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'Contact', href: '/contact' },
        ]}
      />
      <ContactSection />
    </>
  );
}
