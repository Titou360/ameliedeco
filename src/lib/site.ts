/**
 * Configuration centrale du site — source unique de vérité.
 * NAP (Name / Address / Phone), navigation, réseaux, SEO local.
 * Réutilisée par le layout, le header/footer, les métadonnées et le JSON-LD.
 */

export const siteConfig = {
  name: 'Amélie Déco',
  legalName: 'Amélie Megdad',
  tagline: 'Espaces et émotions sur mesure',
  description:
    "Amélie Megdad, décoratrice d'intérieur à Bordeaux et en Gironde. " +
    "Conseil déco, aménagement 3D, home staging et relooking d'intérieur sur mesure.",
  // À renseigner avec le domaine de production avant déploiement Vercel.
  url: 'https://www.ameliedeco.com',
  locale: 'fr_FR',
  email: 'Amelie.megdad@gmail.com',
  // Téléphone non confirmé (les numéros du site actuel sont générés). À compléter.
  phone: '',
  address: {
    locality: 'Virelade',
    region: 'Gironde',
    postalCode: '33720',
    country: 'FR',
  },
  // Rayon d'intervention principal (km) autour de Virelade.
  serviceRadiusKm: 30,
  geo: {
    latitude: 44.6667,
    longitude: -0.3167,
  },
  socials: {
    instagram: 'https://www.instagram.com/amelie_megdad/',
    facebook: 'https://www.facebook.com/profile.php?id=61580025085633',
  },
} as const;

/** Villes ciblées pour le SEO local (référencement de zone). */
export const serviceAreas = [
  'Bordeaux',
  'Mérignac',
  'Pessac',
  'Cestas',
  'Langon',
  'Beautiran',
  'Virelade',
] as const;

/** Navigation principale (header + footer). */
export const mainNav = [
  { label: 'Accueil', href: '/' },
  { label: 'Prestations', href: '/prestations' },
  { label: 'Réalisations', href: '/realisations' },
  { label: 'À propos', href: '/a-propos' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
] as const;

export const primaryCta = {
  label: 'Demander un rendez-vous',
  href: '/contact',
} as const;

export type NavItem = (typeof mainNav)[number];
