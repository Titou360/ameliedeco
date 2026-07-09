import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { PageHero } from '@/components/ui/PageHero';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: "Mentions légales du site d'Amélie Déco, décoratrice d'intérieur à Bordeaux.",
  alternates: { canonical: '/mentions-legales' },
  robots: { index: false, follow: true },
};

export default function MentionsLegalesPage() {
  return (
    <>
      <PageHero
        title="Mentions légales"
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'Mentions légales', href: '/mentions-legales' },
        ]}
      />
      <Section tone="background" spacing="lg">
        <Container size="narrow">
          <div className="space-y-8 font-sans text-base leading-relaxed text-muted">
            <div>
              <h2 className="font-display text-2xl text-foreground">Éditeur du site</h2>
              <p className="mt-3">
                {siteConfig.legalName} — {siteConfig.name}
                <br />
                {siteConfig.address.locality} ({siteConfig.address.postalCode}),{' '}
                {siteConfig.address.region}, France
                <br />
                E-mail : {siteConfig.email}
              </p>
              <p className="mt-3">
                Statut juridique, numéro SIRET et directeur de la publication :{' '}
                <em>à compléter</em>.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl text-foreground">Hébergement</h2>
              <p className="mt-3">
                Ce site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789,
                États-Unis — vercel.com.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl text-foreground">Propriété intellectuelle</h2>
              <p className="mt-3">
                L&apos;ensemble des contenus (textes, visuels, éléments graphiques) présents sur ce
                site est protégé par le droit d&apos;auteur. Toute reproduction, même partielle, est
                soumise à autorisation préalable.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl text-foreground">Données personnelles</h2>
              <p className="mt-3">
                Le traitement des données transmises via le formulaire de contact est détaillé dans
                la{' '}
                <a href="/confidentialite" className="text-foreground underline hover:text-accent">
                  politique de confidentialité
                </a>
                .
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
