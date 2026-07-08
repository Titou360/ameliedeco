/**
 * Données structurées Schema.org (JSON-LD) pour le SEO local.
 * Génère les graphes LocalBusiness / ProfessionalService injectés dans les pages.
 */
import { siteConfig, serviceAreas } from './site';

/** URL absolue à partir d'un chemin relatif. */
export function absoluteUrl(path = '/'): string {
  return new URL(path, siteConfig.url).toString();
}

/**
 * Graphe principal : l'entreprise en tant que ProfessionalService
 * (spécialisation de LocalBusiness), avec zone de chalandise et contact.
 */
export function localBusinessJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${siteConfig.url}/#business`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    description: siteConfig.description,
    url: siteConfig.url,
    email: siteConfig.email,
    ...(siteConfig.phone ? { telephone: siteConfig.phone } : {}),
    image: absoluteUrl('/opengraph-image'),
    priceRange: '€€',
    address: {
      '@type': 'PostalAddress',
      addressLocality: siteConfig.address.locality,
      postalCode: siteConfig.address.postalCode,
      addressRegion: siteConfig.address.region,
      addressCountry: siteConfig.address.country,
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: siteConfig.geo.latitude,
      longitude: siteConfig.geo.longitude,
    },
    areaServed: serviceAreas.map((city) => ({
      '@type': 'City',
      name: city,
    })),
    serviceType: [
      'Décoration intérieure',
      "Architecture d'intérieur",
      'Aménagement 3D',
      'Home staging',
      "Relooking d'intérieur",
      'Conseil en décoration',
    ],
    knowsLanguage: 'fr-FR',
    sameAs: [siteConfig.socials.instagram, siteConfig.socials.facebook],
  } as const;
}

/** Fil d'Ariane structuré pour une page donnée. */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  } as const;
}
