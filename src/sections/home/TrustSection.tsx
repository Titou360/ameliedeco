import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/animations/Reveal';
import { iconMap, type IconKey } from '@/lib/icons';

interface TrustItem {
  icon: IconKey;
  title: string;
  text: string;
}

const items: TrustItem[] = [
  {
    icon: 'heart-handshake',
    title: 'Accompagnement sur mesure',
    text: "Une écoute attentive et bienveillante pour comprendre vos besoins et vos envies.",
  },
  {
    icon: 'pencil-ruler',
    title: 'Projets personnalisés',
    text: "Des espaces uniques qui vous ressemblent, pensés jusque dans le moindre détail.",
  },
  {
    icon: 'gem',
    title: 'Matériaux de qualité',
    text: "Un choix exigeant de matières, mobilier et accessoires pour un rendu durable.",
  },
  {
    icon: 'list-checks',
    title: 'Suivi complet',
    text: "De la première idée à la mise en scène finale, un accompagnement de bout en bout.",
  },
];

/**
 * Section « Confiance » : quatre engagements avec icônes fines et micro-
 * interaction au survol (élévation + accent). Révélés en cascade au scroll.
 */
export function TrustSection() {
  return (
    <Section tone="background" spacing="md" aria-labelledby="confiance-title">
      <Container size="wide">
        <h2 id="confiance-title" className="sr-only">
          Nos engagements
        </h2>
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => {
            const Icon = iconMap[item.icon];
            return (
              <Reveal as="li" key={item.title} delay={i * 0.08}>
                <article className="group h-full rounded-lg border border-border bg-surface p-7 transition-[transform,box-shadow,border-color] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-accent/50 hover:shadow-lift">
                  <span className="inline-flex h-12 w-12 items-center justify-center rounded-md bg-sand-50 text-espresso transition-colors duration-500 group-hover:bg-espresso group-hover:text-cream">
                    <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 font-display text-2xl">{item.title}</h3>
                  <p className="mt-3 font-sans text-sm leading-relaxed text-muted">{item.text}</p>
                </article>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
