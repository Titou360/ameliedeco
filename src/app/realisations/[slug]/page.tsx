import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Figure } from '@/components/ui/Figure';
import { PageHero } from '@/components/ui/PageHero';
import { JsonLd } from '@/components/seo/JsonLd';
import { getPublishedRealisationSlugs, getRealisationBySlug } from '@/lib/db/realisations';
import { realisationJsonLd } from '@/lib/structured-data';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getPublishedRealisationSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = await getRealisationBySlug(slug);
  if (!r) return {};
  return {
    title: `${r.title} — ${r.city}`,
    description: `${r.projectType} à ${r.city} (${r.surface}). Projet de décoration d'intérieur signé Amélie Déco.`,
    alternates: { canonical: `/realisations/${r.slug}` },
  };
}

export default async function RealisationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const r = await getRealisationBySlug(slug);
  if (!r) notFound();

  const gallery = r.gallery && r.gallery.length > 0 ? r.gallery : [undefined, undefined, undefined];

  const meta = [
    { label: 'Ville', value: r.city },
    { label: 'Surface', value: r.surface },
    { label: 'Type de projet', value: r.projectType },
    { label: 'Catégorie', value: r.category },
    { label: 'Année', value: String(r.year) },
  ];

  return (
    <>
      <JsonLd data={realisationJsonLd(r)} />
      <PageHero
        eyebrow={r.projectType}
        title={r.title}
        description={r.description}
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'Réalisations', href: '/realisations' },
          { label: r.title, href: `/realisations/${r.slug}` },
        ]}
      />
      <Section tone="background" spacing="lg">
        <Container size="wide">
          <dl className="grid grid-cols-2 gap-6 border-b border-border pb-10 sm:grid-cols-3 lg:grid-cols-5">
            {meta.map((m) => (
              <div key={m.label}>
                <dt className="font-sans text-xs uppercase tracking-[0.2em] text-muted">{m.label}</dt>
                <dd className="mt-1 font-display text-xl">{m.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {gallery.map((src, i) => (
              <Figure
                key={src ?? `placeholder-${i}`}
                src={src}
                alt={`${r.title} — ${r.projectType} à ${r.city}, vue ${i + 1}`}
                ratio={i === 0 ? 'wide' : 'landscape'}
                className={i === 0 ? 'sm:col-span-2' : undefined}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            ))}
          </div>

          <div className="mt-14">
            <Button href="/contact" size="lg">
              Discuter d&apos;un projet similaire
            </Button>
          </div>
        </Container>
      </Section>
    </>
  );
}
