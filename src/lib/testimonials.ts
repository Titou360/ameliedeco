/**
 * Avis clients — à remplacer par de vrais témoignages (avec accord des clients).
 * Contenus d'exemple représentatifs du ton d'Amélie Déco.
 */
export interface Testimonial {
  name: string;
  city: string;
  rating: number;
  quote: string;
  /** Photo (public/) — placeholder si absente. */
  photo?: string;
}

export const testimonials: Testimonial[] = [
  {
    name: 'Camille R.',
    city: 'Bordeaux',
    rating: 5,
    quote:
      "Amélie a su transformer notre appartement en un lieu chaleureux et lumineux. Une écoute rare et des idées justes, dans le respect de notre budget.",
  },
  {
    name: 'Julien & Sophie',
    city: 'Mérignac',
    rating: 5,
    quote:
      "Les vues 3D nous ont permis de nous projeter immédiatement. Le résultat dépasse ce que nous imaginions. Un accompagnement bienveillant du début à la fin.",
  },
  {
    name: 'Nathalie B.',
    city: 'Pessac',
    rating: 5,
    quote:
      "Un home staging efficace : notre maison s'est vendue en deux semaines. Merci pour ce regard professionnel et ces conseils précieux.",
  },
];
