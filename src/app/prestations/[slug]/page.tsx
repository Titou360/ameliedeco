import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/ui/PageHero';
import { JsonLd } from '@/components/seo/JsonLd';
import { services, getService, getAllServices } from '@/lib/services';
import { iconMap } from '@/lib/icons';
import { serviceJsonLd } from '@/lib/structured-data';

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return {};
  return {
    title: service.title,
    description: service.summary,
    alternates: { canonical: `/prestations/${service.slug}` },
  };
}

export default async function PrestationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  const others = getAllServices().filter((s) => s.slug !== service.slug);

  return (
    <>
      <JsonLd data={serviceJsonLd(service)} />
      <PageHero
        eyebrow="Prestation"
        title={service.title}
        description={service.summary}
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'Prestations', href: '/prestations' },
          { label: service.title, href: `/prestations/${service.slug}` },
        ]}
      />
      <Section tone="background" spacing="lg">
        <Container size="default">
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <p className="font-sans text-lg leading-relaxed text-foreground">
                {service.description}
              </p>
            </div>
            <div className="lg:col-span-5">
              <h2 className="font-display text-2xl">Ce que comprend cette prestation</h2>
              <ul className="mt-5 space-y-3">
                {service.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 font-sans text-sm text-foreground">
                    <Check size={18} strokeWidth={1.5} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button href="/contact" size="lg">
                  Demander un rendez-vous
                </Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
      <Section tone="sand" spacing="md" aria-labelledby="autres-prestations">
        <Container size="wide">
          <h2 id="autres-prestations" className="font-display text-3xl">
            Autres prestations
          </h2>
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((s) => {
              const Icon = iconMap[s.icon];
              return (
                <li key={s.slug}>
                  <Link
                    href={`/prestations/${s.slug}`}
                    className="group flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-accent/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <Icon size={20} strokeWidth={1.5} className="shrink-0 text-espresso" aria-hidden="true" />
                    <span className="font-sans text-sm transition-colors group-hover:text-accent">
                      {s.title}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Container>
      </Section>
    </>
  );
}
