import type { Metadata } from 'next';
import { Instagram } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/ui/PageHero';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Journal',
  description:
    "Conseils déco, inspirations et coulisses des projets d'Amélie Déco, décoratrice d'intérieur à Bordeaux. Bientôt disponible.",
  alternates: { canonical: '/blog' },
};

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Journal"
        title="Inspirations & conseils déco"
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'Journal', href: '/blog' },
        ]}
      />
      <Section tone="background" spacing="lg">
        <Container size="narrow">
          <div className="rounded-xl border border-border bg-surface p-10 text-center sm:p-14">
            <p className="font-display text-2xl">Les premiers articles arrivent bientôt</p>
            <p className="mx-auto mt-4 max-w-md font-sans text-base leading-relaxed text-muted">
              Je prépare un journal pour partager mes conseils, mes inspirations et les coulisses
              de mes projets. En attendant, suivez mon actualité sur Instagram ou écrivez-moi
              directement.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button href="/contact" size="lg">
                Me contacter
              </Button>
              <Button
                href={siteConfig.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
                variant="outline"
              >
                <Instagram size={18} strokeWidth={1.5} />
                Suivre sur Instagram
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
