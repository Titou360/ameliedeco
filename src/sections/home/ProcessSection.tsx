import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/animations/Reveal';

interface Step {
  number: string;
  title: string;
  text: string;
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Échange & écoute',
    text: "Un premier rendez-vous pour comprendre vos besoins, vos goûts, votre mode de vie et votre budget.",
  },
  {
    number: '02',
    title: 'Conception',
    text: "Plans 2D, vues 3D réalistes et sélection des matériaux, couleurs et mobilier pour vous projeter.",
  },
  {
    number: '03',
    title: 'Sélection & shopping',
    text: "Choix du mobilier et des accessoires, shopping list détaillée ou coaching shopping accompagné.",
  },
  {
    number: '04',
    title: 'Mise en scène & suivi',
    text: "Installation, mise en scène finale et suivi de chantier pour un résultat fidèle à vos envies.",
  },
];

/**
 * Processus en quatre étapes. Timeline responsive (horizontale ≥ lg, verticale
 * sinon), chaque étape révélée en cascade au scroll.
 */
export function ProcessSection() {
  return (
    <Section tone="surface" spacing="lg" aria-labelledby="processus-title">
      <Container size="wide">
        <SectionHeading
          id="processus-title"
          eyebrow="Méthode"
          title="Un accompagnement en quatre temps"
          intro="Une démarche claire et rassurante, de la première idée à la mise en scène finale."
        />

        <ol className="mt-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal as="li" key={step.number} delay={i * 0.1} className="relative">
              <div className="flex items-center gap-4">
                <span className="font-display text-5xl text-accent/70">{step.number}</span>
                <span
                  aria-hidden="true"
                  className="h-px flex-1 bg-border last:hidden lg:block"
                />
              </div>
              <h3 className="mt-6 font-display text-2xl">{step.title}</h3>
              <p className="mt-3 font-sans text-sm leading-relaxed text-muted">{step.text}</p>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
