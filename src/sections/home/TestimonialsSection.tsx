import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { TestimonialsSlider } from '@/components/testimonials/TestimonialsSlider';
import { getPublishedTestimonials } from '@/lib/db/testimonials';

/**
 * Section « Avis clients » : récupère les avis publiés (serveur). Masquée s'il
 * n'y en a aucun ; sinon en-tête + slider client.
 */
export async function TestimonialsSection() {
  const items = await getPublishedTestimonials();
  if (items.length === 0) return null;

  return (
    <Section tone="background" spacing="lg" aria-labelledby="avis-title">
      <Container size="wide">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-sans text-sm uppercase tracking-[0.2em] text-accent">Témoignages</p>
          <h2 id="avis-title" className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
            Ce que disent mes clients
          </h2>
        </div>
        <TestimonialsSlider items={items} />
      </Container>
    </Section>
  );
}
