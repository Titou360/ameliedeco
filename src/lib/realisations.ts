/**
 * Types et taxonomie des réalisations. Les DONNÉES viennent de MongoDB
 * (voir `src/lib/db/realisations.ts`). Ce fichier ne contient plus de données.
 */

export const projectCategories = [
  'Appartement',
  'Maison',
  'Cuisine',
  'Salon',
  'Professionnel',
] as const;

export type ProjectCategory = (typeof projectCategories)[number];

export interface Realisation {
  slug: string;
  title: string;
  city: string;
  /** Surface indicative (ex. « 75 m² »). */
  surface: string;
  category: ProjectCategory;
  /** Type de projet affiché (ex. « Rénovation complète »). */
  projectType: string;
  /** Chemin/URL image (placeholder si absent). */
  image?: string;
  year: number;
  /** Description longue (page détail). */
  description?: string;
  /** Galerie (chemins/URL) — placeholders si vide. */
  gallery?: string[];
}
