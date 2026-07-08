/**
 * Réalisations (portfolio) — structure de données prête à recevoir les vraies
 * photos et projets d'Amélie. Les `image` non renseignées affichent un
 * placeholder élégant (voir composant Figure).
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
  /** Chemin image (public/) — placeholder si absent. */
  image?: string;
  year: number;
}

export const realisations: Realisation[] = [
  {
    slug: 'appartement-lumiere-bordeaux',
    title: 'Appartement Lumière',
    city: 'Bordeaux',
    surface: '78 m²',
    category: 'Appartement',
    projectType: 'Rénovation complète',
    year: 2025,
  },
  {
    slug: 'maison-familiale-merignac',
    title: 'Maison Familiale',
    city: 'Mérignac',
    surface: '140 m²',
    category: 'Maison',
    projectType: 'Aménagement 3D',
    year: 2025,
  },
  {
    slug: 'cuisine-chaleureuse-pessac',
    title: 'Cuisine Chaleureuse',
    city: 'Pessac',
    surface: '22 m²',
    category: 'Cuisine',
    projectType: 'Conception & décoration',
    year: 2024,
  },
  {
    slug: 'salon-contemporain-cestas',
    title: 'Salon Contemporain',
    city: 'Cestas',
    surface: '35 m²',
    category: 'Salon',
    projectType: 'Relooking intérieur',
    year: 2024,
  },
  {
    slug: 'bureau-atelier-langon',
    title: 'Bureau & Atelier',
    city: 'Langon',
    surface: '60 m²',
    category: 'Professionnel',
    projectType: 'Aménagement professionnel',
    year: 2024,
  },
  {
    slug: 'appartement-nature-beautiran',
    title: 'Appartement Nature',
    city: 'Beautiran',
    surface: '52 m²',
    category: 'Appartement',
    projectType: 'Home staging',
    year: 2023,
  },
];
