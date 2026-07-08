import Link from 'next/link';
import { Instagram, Facebook, Mail } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { siteConfig, mainNav, serviceAreas } from '@/lib/site';

/**
 * Pied de page sobre. Rassemble navigation, zones d'intervention (SEO local),
 * contact et mentions légales. Le bloc adresse alimente aussi le référencement.
 */
export function Footer() {
  const year = new Date().getFullYear();

  const legalNav = [
    { label: 'Mentions légales', href: '/mentions-legales' },
    { label: 'Politique de confidentialité', href: '/confidentialite' },
  ];

  return (
    <footer className="border-t border-border bg-surface" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Pied de page
      </h2>
      <Container size="wide" className="py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Marque */}
          <div className="lg:col-span-4">
            <p className="font-display text-3xl">Amélie Déco</p>
            <p className="mt-4 max-w-xs font-sans text-sm leading-relaxed text-muted">
              {siteConfig.tagline}. Décoratrice d&apos;intérieur à {siteConfig.address.locality},
              en {siteConfig.address.region}.
            </p>
            <div className="mt-6 flex items-center gap-3">
              <a
                href={siteConfig.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram d'Amélie Déco"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border transition-colors hover:bg-sand-50"
              >
                <Instagram size={18} strokeWidth={1.5} />
              </a>
              <a
                href={siteConfig.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook d'Amélie Déco"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border transition-colors hover:bg-sand-50"
              >
                <Facebook size={18} strokeWidth={1.5} />
              </a>
            </div>
          </div>

          {/* Navigation */}
          <nav aria-label="Liens de pied de page" className="lg:col-span-3">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted">Navigation</p>
            <ul className="mt-4 space-y-2.5">
              {mainNav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="font-sans text-sm text-foreground/90 transition-colors hover:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Zones d'intervention (SEO local) */}
          <div className="lg:col-span-3">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted">
              Zones d&apos;intervention
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
              {serviceAreas.map((city) => (
                <li key={city} className="font-sans text-sm text-foreground/90">
                  {city}
                </li>
              ))}
            </ul>
            <p className="mt-4 font-sans text-xs leading-relaxed text-muted">
              Et dans un rayon de {siteConfig.serviceRadiusKm}&nbsp;km autour de{' '}
              {siteConfig.address.locality} ({siteConfig.address.postalCode}).
            </p>
          </div>

          {/* Contact */}
          <div className="lg:col-span-2">
            <p className="font-sans text-xs uppercase tracking-[0.2em] text-muted">Contact</p>
            <a
              href={`mailto:${siteConfig.email}`}
              className="mt-4 inline-flex items-center gap-2 font-sans text-sm text-foreground/90 transition-colors hover:text-accent"
            >
              <Mail size={16} strokeWidth={1.5} />
              <span className="break-all">{siteConfig.email}</span>
            </a>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sans text-xs text-muted">
            © {year} Amélie Megdad — Amélie Déco. Tous droits réservés.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="font-sans text-xs text-muted transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
