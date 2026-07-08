import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Figure } from '@/components/ui/Figure';
import { Button } from '@/components/ui/Button';
import { Reveal } from '@/animations/Reveal';

/**
 * Section de présentation d'Amélie : portrait + récit (contenu réel, reconversion
 * « de la passion à la profession »). Texte et image révélés au scroll.
 */
export function PresentationSection() {
  return (
    <Section tone="sand" spacing="lg" aria-labelledby="presentation-title">
      <Container size="wide">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal direction="right" className="lg:col-span-5">
            <Figure
              ratio="portrait"
              alt="Portrait d'Amélie Megdad, décoratrice d'intérieur"
              sizes="(max-width: 1024px) 100vw, 40vw"
            />
          </Reveal>

          <div className="lg:col-span-7">
            <Reveal>
              <p className="font-sans text-sm uppercase tracking-[0.2em] text-accent">
                À propos
              </p>
              <h2
                id="presentation-title"
                className="mt-4 font-display text-4xl leading-tight sm:text-5xl"
              >
                De la passion à la profession, une reconversion pleine de sens.
              </h2>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="mt-6 space-y-4 font-sans text-base leading-relaxed text-muted">
                <p>
                  Portée par un sens inné pour la conception et le détail, j&apos;ai développé
                  mes compétences en tant que créatrice artisanale avant de compléter mon
                  parcours par une formation en décoration d&apos;intérieur et conception 3D.
                </p>
                <p>
                  Aujourd&apos;hui, je mets mon approche sensible au service de mes clients :
                  une expertise bienveillante et un grand sens de l&apos;écoute pour créer des
                  lieux qui vous ressemblent, où l&apos;esthétisme et le bien-être se rencontrent.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <p className="mt-8 font-display text-2xl italic text-espresso">
                « Chaque intérieur raconte une histoire. »
              </p>
              <div className="mt-8">
                <Button href="/a-propos" variant="outline">
                  Découvrir mon parcours
                </Button>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
