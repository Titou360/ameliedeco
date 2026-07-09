import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { PageHero } from '@/components/ui/PageHero';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: "Politique de confidentialité et traitement des données personnelles — Amélie Déco.",
  alternates: { canonical: '/confidentialite' },
  robots: { index: false, follow: true },
};

export default function ConfidentialitePage() {
  return (
    <>
      <PageHero
        title="Politique de confidentialité"
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'Politique de confidentialité', href: '/confidentialite' },
        ]}
      />
      <Section tone="background" spacing="lg">
        <Container size="narrow">
          <div className="space-y-8 font-sans text-base leading-relaxed text-muted">
            <div>
              <h2 className="font-display text-2xl text-foreground">Données collectées</h2>
              <p className="mt-3">
                Via le formulaire de contact, les données suivantes sont collectées : nom, adresse
                e-mail, téléphone (facultatif) et contenu de votre message.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl text-foreground">Finalité et base légale</h2>
              <p className="mt-3">
                Ces données sont utilisées uniquement pour répondre à votre demande de contact. La
                base légale est votre consentement, exprimé par l&apos;envoi du formulaire.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl text-foreground">Durée de conservation</h2>
              <p className="mt-3">
                Vos données sont conservées le temps nécessaire au traitement de votre demande, puis
                archivées ou supprimées <em>(durée à compléter)</em>.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl text-foreground">Cookies</h2>
              <p className="mt-3">
                Ce site n&apos;utilise pas de cookies de suivi ni d&apos;outils de mesure
                d&apos;audience tiers. <em>(À réviser en cas d&apos;ajout ultérieur.)</em>
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl text-foreground">Vos droits</h2>
              <p className="mt-3">
                Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification,
                d&apos;effacement et d&apos;opposition sur vos données. Pour les exercer, écrivez à{' '}
                {siteConfig.email}.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
