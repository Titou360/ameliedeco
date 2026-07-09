/**
 * Données structurées Schema.org (JSON-LD) pour le SEO local.
 * Génère les graphes LocalBusiness / ProfessionalService injectés dans les pages.
 */
import { siteConfig, serviceAreas } from './site';
import type { Service } from './services';
import type { Realisation } from './realisations';

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
    ...(siteConfig.phoneHref ? { telephone: siteConfig.phoneHref } : {}),
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

/** JSON-LD Service pour une page prestation. */
export function serviceJsonLd(service: Service) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.description,
    url: absoluteUrl(`/prestations/${service.slug}`),
    serviceType: service.title,
    provider: { '@id': `${siteConfig.url}/#business` },
    areaServed: serviceAreas.map((city) => ({ '@type': 'City', name: city })),
  } as const;
}

/** JSON-LD CreativeWork léger pour une page réalisation. */
export function realisationJsonLd(r: Realisation) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: r.title,
    url: absoluteUrl(`/realisations/${r.slug}`),
    creator: { '@id': `${siteConfig.url}/#business` },
    locationCreated: { '@type': 'Place', name: r.city },
    about: r.projectType,
  } as const;
}
