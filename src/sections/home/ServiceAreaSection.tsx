import { MapPin } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { Reveal } from '@/animations/Reveal';
import { Button } from '@/components/ui/Button';
import { siteConfig, serviceAreas } from '@/lib/site';

/** Points indicatifs (stylisés, non géographiquement exacts) pour la carte. */
const points = [
  { name: 'Bordeaux', x: 52, y: 34 },
  { name: 'Mérignac', x: 38, y: 40 },
  { name: 'Pessac', x: 44, y: 50 },
  { name: 'Cestas', x: 40, y: 62 },
  { name: 'Beautiran', x: 60, y: 66 },
  { name: 'Langon', x: 74, y: 80 },
  { name: 'Virelade', x: 62, y: 72 },
];

/**
 * Zone d'intervention. Carte stylisée (SVG décoratif, léger) accompagnée de la
 * liste réelle des villes pour l'accessibilité et le SEO local.
 */
export function ServiceAreaSection() {
  return (
    <Section tone="sand" spacing="lg" aria-labelledby="zone-title">
      <Container size="wide">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <SectionHeading
              id="zone-title"
              eyebrow="Zone d'intervention"
              title="Bordeaux, sa métropole et la Gironde"
              intro={`Basée à ${siteConfig.address.locality} (${siteConfig.address.postalCode}), j'interviens dans un rayon de ${siteConfig.serviceRadiusKm} km, et au-delà sur demande.`}
            />

            <Reveal delay={0.1}>
              <ul className="mt-8 flex flex-wrap gap-2">
                {serviceAreas.map((city) => (
                  <li
                    key={city}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-1.5 font-sans text-sm"
                  >
                    <MapPin size={14} strokeWidth={1.5} className="text-accent" aria-hidden="true" />
                    {city}
                  </li>
                ))}
              </ul>

              <div className="mt-10">
                <Button href="/contact">Discutons de votre projet</Button>
              </div>
            </Reveal>
          </div>

          {/* Carte stylisée */}
          <Reveal direction="left">
            <div className="rounded-xl border border-border bg-surface p-6 shadow-soft">
              <svg
                viewBox="0 0 100 100"
                className="h-auto w-full"
                role="img"
                aria-labelledby="carte-title carte-desc"
              >
                <title id="carte-title">Carte de la zone d&apos;intervention</title>
                <desc id="carte-desc">
                  Bordeaux, sa métropole et la Gironde, autour de Virelade.
                </desc>

                {/* Cercles de rayon */}
                {[34, 24, 14].map((r) => (
                  <circle
                    key={r}
                    cx="58"
                    cy="60"
                    r={r}
                    fill="none"
                    stroke="var(--color-taupe)"
                    strokeWidth="0.4"
                    strokeDasharray="1.5 1.5"
                    opacity="0.6"
                  />
                ))}

                {/* Liaisons douces vers Virelade */}
                {points.map((p) => (
                  <line
                    key={`l-${p.name}`}
                    x1="62"
                    y1="72"
                    x2={p.x}
                    y2={p.y}
                    stroke="var(--color-sage)"
                    strokeWidth="0.3"
                    opacity="0.5"
                  />
                ))}

                {/* Villes */}
                {points.map((p) => {
                  const isHub = p.name === 'Virelade';
                  return (
                    <g key={p.name}>
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={isHub ? 2.2 : 1.4}
                        fill={isHub ? 'var(--color-espresso)' : 'var(--color-slate)'}
                      />
                      <text
                        x={p.x + 3}
                        y={p.y + 1}
                        fontSize="3"
                        fill="var(--color-foreground)"
                        className="font-sans"
                      >
                        {p.name}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
