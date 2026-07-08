import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Figure } from '@/components/ui/Figure';
import { Reveal } from '@/animations/Reveal';
import { PageHero } from '@/components/ui/PageHero';
import { assetExists } from '@/lib/assets';

export const metadata: Metadata = {
  title: 'À propos',
  description:
    "Amélie Megdad, décoratrice d'intérieur à Bordeaux : une reconversion pleine de sens, une approche sensible et bienveillante du bien-être chez soi.",
  alternates: { canonical: '/a-propos' },
};

const PORTRAIT = '/images/a-propos/portrait-amelie.jpg';
const DIPLOME = '/images/a-propos/diplome.jpg';

export default function AProposPage() {
  const portrait = assetExists(PORTRAIT) ? PORTRAIT : undefined;
  const diplome = assetExists(DIPLOME) ? DIPLOME : undefined;

  return (
    <>
      <PageHero
        eyebrow="À propos"
        title="De la passion à la profession, une reconversion pleine de sens"
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'À propos', href: '/a-propos' },
        ]}
      />

      <Section tone="background" spacing="lg">
        <Container size="wide">
          <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal direction="right" className="lg:col-span-5">
              <Figure
                src={portrait}
                ratio="portrait"
                alt="Portrait d'Amélie Megdad, décoratrice d'intérieur"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </Reveal>

            <div className="lg:col-span-7">
              <Reveal>
                <div className="space-y-4 font-sans text-base leading-relaxed text-muted">
                  <p>
                    Après un parcours dans le secteur de la petite enfance, j&apos;ai choisi de
                    suivre ce qui m&apos;anime depuis toujours : créer des espaces qui font du bien.
                    Portée par un sens inné pour la conception et le détail, j&apos;ai d&apos;abord
                    développé mes compétences comme créatrice artisanale pendant près de cinq ans.
                  </p>
                  <p>
                    J&apos;ai ensuite complété ce parcours par une formation en décoration
                    d&apos;intérieur et conception 3D, pour transformer cette passion en métier et
                    vous accompagner de l&apos;idée à la réalisation.
                  </p>
                  <p>
                    Aujourd&apos;hui, je mets mon approche sensible au service de mes clients : une
                    expertise bienveillante et un grand sens de l&apos;écoute, pour créer des lieux
                    qui vous ressemblent, où l&apos;esthétisme et le bien-être se rencontrent.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-8 font-display text-2xl italic text-espresso">
                  « Chaque intérieur raconte une histoire. »
                </p>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="sand" spacing="md" aria-labelledby="parcours-title">
        <Container size="wide">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <h2 id="parcours-title" className="font-display text-3xl sm:text-4xl">
                Formation &amp; parcours
              </h2>
              <p className="mt-5 max-w-xl font-sans text-base leading-relaxed text-muted">
                Une formation certifiante en décoration d&apos;intérieur et conception 3D est venue
                structurer une sensibilité développée au fil des années. De quoi conjuguer intuition
                créative et méthode, à chaque étape de votre projet.
              </p>
              <div className="mt-8">
                <Button href="/prestations" variant="outline">
                  Découvrir mes prestations
                </Button>
              </div>
            </div>
            <Reveal direction="left" className="lg:col-span-5">
              <Figure
                src={diplome}
                ratio="landscape"
                alt="Diplôme de décoration d'intérieur et conception 3D d'Amélie Megdad"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
