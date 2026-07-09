import type { IconKey } from './icons';

/**
 * Prestations d'Amélie Déco — contenu réel repris du site existant.
 * Source unique réutilisée par la homepage et la page « Prestations ».
 */
export interface Service {
  slug: string;
  title: string;
  icon: IconKey;
  /** Accroche courte (cartes, aperçus). */
  summary: string;
  /** Description longue (page prestation). */
  description: string;
  /** Points clés de la prestation. */
  points: string[];
}

export const services: Service[] = [
  {
    slug: 'conseil-deco',
    title: 'Conseil Déco',
    icon: 'palette',
    summary:
      "Une visite conseil à votre domicile ou en visio pour exposer vos envies, vos goûts et vos besoins.",
    description:
      "La visite conseil vous permet d'exposer vos envies, vos goûts, vos idées et vos besoins afin de répondre au mieux à vos attentes. En présentiel (1h ou 2h à votre domicile) ou en visio si nous ne pouvons pas nous rencontrer.",
    points: [
      'Harmonie et mariage des couleurs et des matières',
      'Choix des matériaux, du mobilier et des accessoires',
      "Agencement et organisation de l'espace",
      'Mise en lumière',
    ],
  },
  {
    slug: 'projet-deco-amenagement-3d',
    title: 'Projet Déco & Aménagement 3D',
    icon: 'ruler',
    summary:
      "Une étude complète avec plans 2D, vues 3D réalistes et préconisations d'agencement sur mesure.",
    description:
      "Suite à une visite conseil approfondie avec prise de mesures, je vous propose une étude de décoration pour votre aménagement d'espace : une proposition de plan en 2D, des prises de vue en 3D et un compte rendu avec propositions d'agencement, matériaux, mobilier, tissus, luminaires et accessoires.",
    points: [
      'Plan 2D + vues 3D réalistes',
      "Compte rendu d'agencement détaillé",
      'Option shopping list (catalogue précis avec prix et adresses)',
      'Option suivi de travaux et de chantier',
    ],
  },
  {
    slug: 'relooking-interieur',
    title: 'Relooking Intérieur',
    icon: 'sparkles',
    summary:
      'Un rafraîchissement de votre intérieur, du conseil à la mise en scène finale.',
    description:
      "Un accompagnement en trois temps : rendez-vous conseil à votre domicile, coaching shopping ou shopping list, puis mise en scène finale. Je vous oriente vers du mobilier et des objets qui viendront compléter ou remplacer ce que vous possédez déjà.",
    points: [
      'Rendez-vous conseil à domicile',
      'Coaching shopping ou shopping list',
      'Mise en scène finale',
      'Sélection de boutiques selon votre budget et vos goûts',
    ],
  },
  {
    slug: 'detox-deco',
    title: 'Detox & Déco',
    icon: 'wind',
    summary:
      "Désencombrer, trier et réaménager pour vous sentir mieux chez vous.",
    description:
      "Marre d'un espace trop encombré ? Je vous aide à ranger, trier, jeter et réutiliser, dans la bienveillance et le respect de vos choix, pour retrouver un lieu de vie apaisé. En simple detox ou avec réaménagement de l'espace.",
    points: [
      'Tri et désencombrement accompagnés',
      'Réutilisation de vos éléments existants',
      "Réaménagement de l'espace",
      'Approche bienveillante et respectueuse',
    ],
  },
  {
    slug: 'home-staging',
    title: 'Home Staging',
    icon: 'house',
    summary:
      'Valoriser votre bien pour une vente plus rapide : les acquéreurs se projettent.',
    description:
      "Désencombrer l'espace pour le rendre attractif à la vente, épurer et redécorer pour que les futurs acquéreurs se projettent. Trois formules selon vos besoins, du simple diagnostic à la prise en charge totale de la valorisation.",
    points: [
      'Formule 1 : diagnostic + conseil par pièce',
      'Formule 2 : plan 3D et exemples de styles',
      'Formule 3 : prise en charge totale de la valorisation',
      'Réaménagement sans travaux (travaux sur devis)',
    ],
  },
  {
    slug: 'deco-evenementielle',
    title: 'Déco Événementielle',
    icon: 'gift',
    summary:
      "Des décors sur mesure pour vos moments inoubliables : anniversaires, mariages, baptêmes.",
    description:
      "Parce que la déco est aussi l'âme de vos événements, je décore vos espaces pour des moments et des souvenirs inoubliables : anniversaire, baptême, mariage, soirée à thème… Toujours dans le respect de vos goûts et de vos besoins. À prévoir environ 5 semaines avant la date.",
    points: [
      'Rendez-vous pour cerner vos besoins',
      'Achat des éléments de décoration',
      'Installation le jour J',
      'Désinstallation des éléments en location',
    ],
  },
];

export function getService(slug: string): Service | undefined {
  return services.find((s) => s.slug === slug);
}

export function getAllServices(): Service[] {
  return services;
}
