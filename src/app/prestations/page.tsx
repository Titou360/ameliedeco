import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Reveal } from '@/animations/Reveal';
import { PageHero } from '@/components/ui/PageHero';
import { getAllServices } from '@/lib/services';
import { iconMap } from '@/lib/icons';

export const metadata: Metadata = {
  title: 'Prestations',
  description:
    "Conseil déco, aménagement 3D, relooking, home staging, detox déco et déco événementielle à Bordeaux et en Gironde.",
  alternates: { canonical: '/prestations' },
};

export default function PrestationsPage() {
  const services = getAllServices();
  return (
    <>
      <PageHero
        eyebrow="Prestations"
        title="Un accompagnement pour chaque projet"
        description="Du simple conseil à la prise en charge complète, je vous accompagne pour créer des lieux qui vous ressemblent."
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'Prestations', href: '/prestations' },
        ]}
      />
      <Section tone="background" spacing="lg">
        <Container size="wide">
          <ul className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => {
              const Icon = iconMap[service.icon];
              return (
                <Reveal as="li" key={service.slug} delay={i * 0.05}>
                  <Link
                    href={`/prestations/${service.slug}`}
                    className="group flex h-full flex-col rounded-xl border border-border bg-surface p-6 transition-colors duration-300 hover:border-accent/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <span className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-sand-50 text-espresso">
                      <Icon size={22} strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <h2 className="mt-5 font-display text-2xl transition-colors group-hover:text-accent">
                      {service.title}
                    </h2>
                    <p className="mt-3 font-sans text-sm leading-relaxed text-muted">
                      {service.summary}
                    </p>
                    <span className="mt-5 inline-flex items-center gap-1 font-sans text-sm text-foreground">
                      En savoir plus
                      <ArrowUpRight
                        size={16}
                        strokeWidth={1.5}
                        className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                      />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </ul>
        </Container>
      </Section>
    </>
  );
}
