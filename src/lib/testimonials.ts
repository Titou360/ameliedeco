/**
 * Type des avis clients. Les DONNÉES viennent de MongoDB
 * (voir `src/lib/db/testimonials.ts`). Ce fichier ne contient plus de données.
 */
export interface Testimonial {
  name: string;
  city: string;
  rating: number;
  quote: string;
  /** Photo (chemin/URL) — placeholder si absente. */
  photo?: string;
}
