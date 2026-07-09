# Étape 8 — Pages internes publiques : Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Livrer les pages publiques internes (Prestations + détail, Réalisations + détail, À propos, Blog, Contact, mentions légales, confidentialité) pour supprimer toute rupture « nav → 404 ».

**Architecture:** App Router, pages statiques (SSG). Trois briques partagées nouvelles (`PageHero`, `Breadcrumbs`, `RealisationsGallery` extrait de la section home) + des getters de données découplés dans `lib/*.ts`. Les images absentes retombent sur des placeholders (`Figure` ou dégradé), garantie « zéro image cassée ».

**Tech Stack:** Next.js 15 (App Router, params async), React 19, TypeScript strict, Tailwind CSS v4 (tokens `@theme`), Framer Motion, Lucide.

## Global Constraints

- **Vérification (pas de tests unitaires dans ce repo)** : chaque tâche se valide par `npm run typecheck` (0 erreur), `npm run lint` (0 erreur), et un contrôle de rendu ciblé. `npm run build` aux jalons indiqués. Ne PAS ajouter de framework de test (hors périmètre).
- **npm/next via PowerShell** (le sandbox Bash n'a pas de réseau ; `NODE_EXTRA_CA_CERTS` est persisté). Voir INSTALLATIONS.md.
- **Contenu réel uniquement** — aucune prose inventée. Prestations = données de `lib/services.ts`. À propos = récit réel (reconversion petite enfance → déco, ~5 ans créatrice artisanale + formation déco & 3D). Infos légales inconnues (statut, SIRET, directeur de publication) = placeholder explicite « à compléter ».
- **Palette de marque uniquement** (tokens `globals.css` : `espresso`, `cream`, `sand-*`, `taupe`, `sage`, `accent`…). Pas de nouvelles couleurs.
- **Aucune emoji.** Icônes via `lucide-react` uniquement.
- **A11y WCAG AA** : un seul `<h1>` par page (fourni par `PageHero`), `alt` descriptif sur chaque `Figure`, focus visibles (déjà global), navigation clavier, filtres/pagination annoncés `aria-live`.
- **reduced-motion** : réutiliser `Reveal` / `MotionConfig` existants (déjà neutralisés) — ne pas écrire d'animation JS brute.
- **Params async** : dans Next 15, `params` est une `Promise` → `const { slug } = await params;`.
- **Commits fréquents**, un par tâche, terminés par le trailer :
  `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

---

## File Structure

**Créés :**
- `src/lib/assets.ts` — helper `assetExists()` (server-only, fs) pour n'afficher une image que si le fichier existe.
- `src/components/ui/Breadcrumbs.tsx` — fil d'ariane visuel + JSON-LD `BreadcrumbList`.
- `src/components/ui/PageHero.tsx` — en-tête d'intro des pages internes (dégage le header fixe).
- `src/components/realisations/RealisationsGallery.tsx` — grille filtrable + pagination « Voir plus » (client).
- `src/app/prestations/page.tsx`, `src/app/prestations/[slug]/page.tsx`
- `src/app/realisations/page.tsx`, `src/app/realisations/[slug]/page.tsx`
- `src/app/a-propos/page.tsx`, `src/app/blog/page.tsx`, `src/app/contact/page.tsx`
- `src/app/mentions-legales/page.tsx`, `src/app/confidentialite/page.tsx`

**Modifiés :**
- `src/lib/services.ts` — ajouter `getAllServices()`.
- `src/lib/realisations.ts` — ajouter champs `description?`/`gallery?`, `getAllRealisations()`, `getRealisation()`.
- `src/lib/structured-data.ts` — ajouter `serviceJsonLd()`, `realisationJsonLd()`.
- `src/sections/home/RealisationsSection.tsx` — déléguer filtres+grille à `RealisationsGallery`.
- `src/app/page.tsx` — câbler l'image du hero via `assetExists`.

---

## Task 1: Fondations données & assets

**Files:**
- Create: `src/lib/assets.ts`
- Modify: `src/lib/services.ts`, `src/lib/realisations.ts`, `src/lib/structured-data.ts`

**Interfaces:**
- Produces:
  - `assetExists(publicPath: string): boolean`
  - `getAllServices(): Service[]`
  - `interface Realisation` étendue : `description?: string; gallery?: string[]`
  - `getAllRealisations(): Realisation[]`, `getRealisation(slug: string): Realisation | undefined`
  - `serviceJsonLd(service: Service)`, `realisationJsonLd(r: Realisation)`

- [ ] **Step 1: `assets.ts`**

```ts
import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Vrai si le fichier existe dans `public/` (résolu au build).
 * SERVER-ONLY (utilise fs) : à n'importer que dans des composants serveur.
 * Permet d'afficher une vraie image uniquement quand la cliente l'a déposée,
 * sinon on laisse le placeholder — jamais d'image cassée.
 */
export function assetExists(publicPath: string): boolean {
  const rel = publicPath.replace(/^\//, '');
  return existsSync(join(process.cwd(), 'public', rel));
}
```

- [ ] **Step 2: `services.ts` — ajouter le getter (après `getService`)**

```ts
export function getAllServices(): Service[] {
  return services;
}
```

- [ ] **Step 3: `realisations.ts` — étendre l'interface**

Ajouter dans `interface Realisation`, après `year: number;` :

```ts
  /** Description longue (page détail) — vide tant que non fournie. */
  description?: string;
  /** Galerie (chemins public/) — placeholders si vide. */
  gallery?: string[];
```

- [ ] **Step 4: `realisations.ts` — ajouter les getters (en fin de fichier)**

```ts
export function getAllRealisations(): Realisation[] {
  return realisations;
}

export function getRealisation(slug: string): Realisation | undefined {
  return realisations.find((r) => r.slug === slug);
}
```

- [ ] **Step 5: `structured-data.ts` — ajouter les helpers JSON-LD (en fin de fichier)**

```ts
import type { Service } from './services';
import type { Realisation } from './realisations';

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
```

> Note : mettre les deux `import type` en haut du fichier avec les autres imports, pas en fin de fichier.

- [ ] **Step 6: Vérifier**

Run (PowerShell) : `npm run typecheck`
Expected: 0 erreur.

- [ ] **Step 7: Commit**

```bash
git add src/lib/assets.ts src/lib/services.ts src/lib/realisations.ts src/lib/structured-data.ts
git commit -m "feat(lib): getters données + assetExists + JSON-LD service/réalisation

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: Composant `Breadcrumbs`

**Files:**
- Create: `src/components/ui/Breadcrumbs.tsx`

**Interfaces:**
- Consumes: `breadcrumbJsonLd` (structured-data), `JsonLd` (components/seo).
- Produces: `interface Crumb { label: string; href: string }` ; `Breadcrumbs({ items }: { items: Crumb[] })`. Le dernier item est la page courante (rendu en texte, `aria-current`), tous les items portent un `href` (nécessaire au JSON-LD).

- [ ] **Step 1: Écrire le composant**

```tsx
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd } from '@/lib/structured-data';

export interface Crumb {
  label: string;
  href: string;
}

/**
 * Fil d'ariane : navigation visuelle + JSON-LD BreadcrumbList.
 * Le dernier élément représente la page courante (non cliquable, aria-current).
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Fil d'ariane">
      <JsonLd data={breadcrumbJsonLd(items.map((i) => ({ name: i.label, path: i.href })))} />
      <ol className="flex flex-wrap items-center gap-1.5 font-sans text-sm text-muted">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1.5">
              {isLast ? (
                <span aria-current="page" className="text-foreground">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="transition-colors hover:text-accent">
                  {item.label}
                </Link>
              )}
              {!isLast && (
                <ChevronRight size={14} strokeWidth={1.5} aria-hidden="true" className="text-muted/60" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

- [ ] **Step 2: Vérifier** — `npm run typecheck` → 0 erreur.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/Breadcrumbs.tsx
git commit -m "feat(ui): composant Breadcrumbs (visuel + JSON-LD BreadcrumbList)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: Composant `PageHero`

**Files:**
- Create: `src/components/ui/PageHero.tsx`

**Interfaces:**
- Consumes: `Container`, `Reveal`, `Breadcrumbs` + `Crumb`.
- Produces: `PageHero({ eyebrow?, title, description?, breadcrumb? }: { eyebrow?: string; title: string; description?: string; breadcrumb?: Crumb[] })`. Fournit le `<h1>` de la page. `pt` suffisant pour dégager le header fixe (`h-18`).

- [ ] **Step 1: Écrire le composant**

```tsx
import { Container } from '@/components/ui/Container';
import { Reveal } from '@/animations/Reveal';
import { Breadcrumbs, type Crumb } from '@/components/ui/Breadcrumbs';

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumb?: Crumb[];
}

/**
 * En-tête d'intro des pages internes (sans hero sombre). Fond sable, titre
 * display (h1 unique de la page). Padding haut généreux pour passer sous le
 * header fixe (h-18 = 72px), qui est déjà solide hors accueil.
 */
export function PageHero({ eyebrow, title, description, breadcrumb }: PageHeroProps) {
  return (
    <section className="border-b border-border bg-sand-50 pb-14 pt-32 sm:pb-16 sm:pt-40">
      <Container size="wide">
        {breadcrumb && (
          <div className="mb-8">
            <Breadcrumbs items={breadcrumb} />
          </div>
        )}
        <Reveal>
          {eyebrow && (
            <p className="font-sans text-sm uppercase tracking-[0.2em] text-accent">{eyebrow}</p>
          )}
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight sm:text-6xl">
            {title}
          </h1>
          {description && (
            <p className="mt-6 max-w-2xl font-sans text-lg leading-relaxed text-muted">
              {description}
            </p>
          )}
        </Reveal>
      </Container>
    </section>
  );
}
```

- [ ] **Step 2: Vérifier** — `npm run typecheck` → 0 erreur.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/PageHero.tsx
git commit -m "feat(ui): composant PageHero (en-tête pages internes)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: Extraire `RealisationsGallery` + refactor de la section home

**Files:**
- Create: `src/components/realisations/RealisationsGallery.tsx`
- Modify: `src/sections/home/RealisationsSection.tsx`

**Interfaces:**
- Consumes: `ProjectCard`, `projectCategories`, `type Realisation`, `type ProjectCategory`.
- Produces: `RealisationsGallery({ items, initialCount?, step?, paginate? }: { items: Realisation[]; initialCount?: number; step?: number; paginate?: boolean })`.
  - `initialCount` défaut 6, `step` défaut 6, `paginate` défaut `false`.
  - Sans `paginate` : affiche `initialCount` max. Avec `paginate` : bouton « Voir plus » (+`step`), `visibleCount` réinitialisé à `initialCount` au changement de filtre.

- [ ] **Step 1: Écrire `RealisationsGallery.tsx` (client)**

```tsx
'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { ProjectCard } from '@/components/realisations/ProjectCard';
import { projectCategories, type Realisation, type ProjectCategory } from '@/lib/realisations';
import { cn } from '@/utils/cn';

type Filter = 'Tous' | ProjectCategory;
const filters: Filter[] = ['Tous', ...projectCategories];

interface RealisationsGalleryProps {
  items: Realisation[];
  initialCount?: number;
  step?: number;
  paginate?: boolean;
}

/**
 * Grille de réalisations filtrable par catégorie. Optionnellement paginée
 * (« Voir plus », +step). Animation de layout douce, neutralisée en
 * reduced-motion via MotionConfig. Réutilisée par la home et /realisations.
 */
export function RealisationsGallery({
  items,
  initialCount = 6,
  step = 6,
  paginate = false,
}: RealisationsGalleryProps) {
  const [active, setActive] = useState<Filter>('Tous');
  const [visibleCount, setVisibleCount] = useState(initialCount);

  const filtered = useMemo(
    () => (active === 'Tous' ? items : items.filter((r) => r.category === active)),
    [active, items],
  );

  const cap = paginate ? visibleCount : initialCount;
  const shown = filtered.slice(0, cap);
  const canLoadMore = paginate && shown.length < filtered.length;

  function selectFilter(filter: Filter) {
    setActive(filter);
    setVisibleCount(initialCount);
  }

  return (
    <div>
      {/* Filtres */}
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrer par catégorie">
        {filters.map((filter) => {
          const isActive = active === filter;
          return (
            <button
              key={filter}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => selectFilter(filter)}
              className={cn(
                'cursor-pointer rounded-full border px-4 py-2 font-sans text-sm transition-colors duration-300',
                isActive
                  ? 'border-espresso bg-espresso text-cream'
                  : 'border-border bg-transparent text-foreground hover:border-accent/60',
              )}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* Grille */}
      <motion.ul layout className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {shown.map((project, i) => (
            <motion.li
              key={project.slug}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <ProjectCard project={project} priority={i < 3} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>

      {/* Compteur accessible + pagination */}
      {paginate && (
        <div className="mt-12 flex flex-col items-center gap-4">
          <p aria-live="polite" className="font-sans text-sm text-muted">
            {shown.length} réalisation{shown.length > 1 ? 's' : ''} affichée
            {shown.length > 1 ? 's' : ''} sur {filtered.length}
          </p>
          {canLoadMore && (
            <Button variant="outline" onClick={() => setVisibleCount((c) => c + step)}>
              Voir plus
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
```

> `Button` rend un `<button>` quand `href` est absent : `onClick` est accepté via les props HTML.

- [ ] **Step 2: Refactor `RealisationsSection.tsx` (devient serveur, délègue à la galerie)**

Remplacer TOUT le contenu du fichier par :

```tsx
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { RealisationsGallery } from '@/components/realisations/RealisationsGallery';
import { getAllRealisations } from '@/lib/realisations';

/**
 * Aperçu du portfolio sur la home : en-tête + grille filtrable (6 max) déléguée
 * à RealisationsGallery, avec lien vers la page Réalisations complète.
 */
export function RealisationsSection() {
  return (
    <Section tone="background" spacing="lg" aria-labelledby="realisations-title">
      <Container size="wide">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="realisations-title"
            eyebrow="Réalisations"
            title="Des intérieurs qui racontent une histoire"
            intro="Une sélection de projets pensés sur mesure, entre esthétisme et bien-être."
          />
          <div className="hidden lg:block">
            <Button href="/realisations" variant="outline">
              Toutes les réalisations
            </Button>
          </div>
        </div>

        <div className="mt-10">
          <RealisationsGallery items={getAllRealisations()} initialCount={6} />
        </div>

        <div className="mt-12 lg:hidden">
          <Button href="/realisations" variant="outline" className="w-full">
            Toutes les réalisations
          </Button>
        </div>
      </Container>
    </Section>
  );
}
```

- [ ] **Step 3: Vérifier** — `npm run typecheck` && `npm run lint` → 0 erreur. Puis `npm run build` → succès (jalon : la home doit toujours compiler).

- [ ] **Step 4: Contrôle de rendu** — `npm run dev`, ouvrir `/` : la grille Réalisations s'affiche (6 vignettes), les filtres fonctionnent, le lien « Toutes les réalisations » pointe vers `/realisations`.

- [ ] **Step 5: Commit**

```bash
git add src/components/realisations/RealisationsGallery.tsx src/sections/home/RealisationsSection.tsx
git commit -m "refactor(realisations): extraire RealisationsGallery (filtres + pagination)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Page `/prestations` (liste)

**Files:**
- Create: `src/app/prestations/page.tsx`

**Interfaces:**
- Consumes: `PageHero`, `getAllServices`, `iconMap`, `Section`, `Container`, `Reveal`.

- [ ] **Step 1: Écrire la page**

```tsx
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
```

- [ ] **Step 2: Vérifier** — `npm run typecheck` && `npm run lint` → 0 erreur. `/prestations` s'ouvre (dev), 6 cartes, header dégagé.

- [ ] **Step 3: Commit**

```bash
git add src/app/prestations/page.tsx
git commit -m "feat(prestations): page liste des prestations

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: Page `/prestations/[slug]` (détail)

**Files:**
- Create: `src/app/prestations/[slug]/page.tsx`

**Interfaces:**
- Consumes: `services`, `getService`, `getAllServices`, `iconMap`, `serviceJsonLd`, `JsonLd`, `PageHero`, `Button`, `Section`, `Container`.

- [ ] **Step 1: Écrire la page**

```tsx
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
```

- [ ] **Step 2: Vérifier** — `npm run typecheck` && `npm run lint` → 0 erreur. `/prestations/conseil-deco` s'ouvre ; un slug inconnu (`/prestations/xxx`) rend la page 404.

- [ ] **Step 3: Commit**

```bash
git add "src/app/prestations/[slug]/page.tsx"
git commit -m "feat(prestations): page détail [slug] + JSON-LD Service

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: Page `/realisations` (liste paginée)

**Files:**
- Create: `src/app/realisations/page.tsx`

**Interfaces:**
- Consumes: `PageHero`, `Section`, `Container`, `RealisationsGallery`, `getAllRealisations`.

- [ ] **Step 1: Écrire la page**

```tsx
import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { PageHero } from '@/components/ui/PageHero';
import { RealisationsGallery } from '@/components/realisations/RealisationsGallery';
import { getAllRealisations } from '@/lib/realisations';

export const metadata: Metadata = {
  title: 'Réalisations',
  description:
    "Une sélection de projets de décoration et d'aménagement d'intérieur réalisés à Bordeaux et en Gironde.",
  alternates: { canonical: '/realisations' },
};

export default function RealisationsPage() {
  return (
    <>
      <PageHero
        eyebrow="Réalisations"
        title="Des intérieurs qui racontent une histoire"
        description="Chaque projet est unique, pensé sur mesure entre esthétisme et bien-être. Filtrez par type de lieu."
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'Réalisations', href: '/realisations' },
        ]}
      />
      <Section tone="background" spacing="lg">
        <Container size="wide">
          <RealisationsGallery items={getAllRealisations()} initialCount={6} step={6} paginate />
        </Container>
      </Section>
    </>
  );
}
```

- [ ] **Step 2: Vérifier** — `npm run typecheck` && `npm run lint` → 0 erreur. `/realisations` : 6 vignettes ; comme il y a 6 réalisations, le bouton « Voir plus » ne s'affiche pas (normal). Le compteur affiche « 6 réalisations affichées sur 6 ». Changer de filtre réinitialise l'affichage.

> Vérif pagination réelle : ajouter temporairement 2 entrées factices dans `realisations.ts` → « Voir plus » apparaît et révèle les suivantes ; **retirer les entrées factices avant commit**.

- [ ] **Step 3: Commit**

```bash
git add src/app/realisations/page.tsx
git commit -m "feat(realisations): page liste filtrable + pagination Voir plus

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: Page `/realisations/[slug]` (détail)

**Files:**
- Create: `src/app/realisations/[slug]/page.tsx`

**Interfaces:**
- Consumes: `realisations`, `getRealisation`, `PageHero`, `Figure`, `Button`, `JsonLd`, `realisationJsonLd`, `Section`, `Container`.

- [ ] **Step 1: Écrire la page**

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Figure } from '@/components/ui/Figure';
import { PageHero } from '@/components/ui/PageHero';
import { JsonLd } from '@/components/seo/JsonLd';
import { realisations, getRealisation } from '@/lib/realisations';
import { realisationJsonLd } from '@/lib/structured-data';

export function generateStaticParams() {
  return realisations.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const r = getRealisation(slug);
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
  const r = getRealisation(slug);
  if (!r) notFound();

  // Galerie : images fournies, sinon 3 emplacements placeholder.
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
```

- [ ] **Step 2: Vérifier** — `npm run typecheck` && `npm run lint` → 0 erreur. `/realisations/appartement-lumiere-bordeaux` s'ouvre (galerie en placeholders), slug inconnu → 404. Depuis `/realisations`, cliquer une vignette mène bien à sa page détail.

- [ ] **Step 3: Commit**

```bash
git add "src/app/realisations/[slug]/page.tsx"
git commit -m "feat(realisations): page détail [slug] + galerie placeholder + JSON-LD

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Page `/a-propos`

**Files:**
- Create: `src/app/a-propos/page.tsx`

**Interfaces:**
- Consumes: `PageHero`, `Figure`, `Button`, `Section`, `Container`, `Reveal`, `assetExists`.

- [ ] **Step 1: Écrire la page**

```tsx
import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { Figure } from '@/components/ui/Figure';
import { Reveal } from '@/animations/Reveal';
import { PageHero } from '@/components/ui/PageHero';
import { assetExists } from '@/lib/assets';

export const metadata: Metadata = {
  title: 'À propos',
  description:
    "Amélie Megdad, décoratrice d'intérieur à Bordeaux : une reconversion pleine de sens, une approche sensible et bienveillante du bien-être chez soi.",
  alternates: { canonical: '/a-propos' },
};

const PORTRAIT = '/images/a-propos/portrait-amelie.jpg';
const DIPLOME = '/images/a-propos/diplome.jpg';

export default function AProposPage() {
  const portrait = assetExists(PORTRAIT) ? PORTRAIT : undefined;
  const diplome = assetExists(DIPLOME) ? DIPLOME : undefined;

  return (
    <>
      <PageHero
        eyebrow="À propos"
        title="De la passion à la profession, une reconversion pleine de sens"
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'À propos', href: '/a-propos' },
        ]}
      />

      <Section tone="background" spacing="lg">
        <Container size="wide">
          <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
            <Reveal direction="right" className="lg:col-span-5">
              <Figure
                src={portrait}
                ratio="portrait"
                alt="Portrait d'Amélie Megdad, décoratrice d'intérieur"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </Reveal>

            <div className="lg:col-span-7">
              <Reveal>
                <div className="space-y-4 font-sans text-base leading-relaxed text-muted">
                  <p>
                    Après un parcours dans le secteur de la petite enfance, j&apos;ai choisi de
                    suivre ce qui m&apos;anime depuis toujours : créer des espaces qui font du bien.
                    Portée par un sens inné pour la conception et le détail, j&apos;ai d&apos;abord
                    développé mes compétences comme créatrice artisanale pendant près de cinq ans.
                  </p>
                  <p>
                    J&apos;ai ensuite complété ce parcours par une formation en décoration
                    d&apos;intérieur et conception 3D, pour transformer cette passion en métier et
                    vous accompagner de l&apos;idée à la réalisation.
                  </p>
                  <p>
                    Aujourd&apos;hui, je mets mon approche sensible au service de mes clients : une
                    expertise bienveillante et un grand sens de l&apos;écoute, pour créer des lieux
                    qui vous ressemblent, où l&apos;esthétisme et le bien-être se rencontrent.
                  </p>
                </div>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="mt-8 font-display text-2xl italic text-espresso">
                  « Chaque intérieur raconte une histoire. »
                </p>
              </Reveal>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone="sand" spacing="md" aria-labelledby="parcours-title">
        <Container size="wide">
          <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <h2 id="parcours-title" className="font-display text-3xl sm:text-4xl">
                Formation &amp; parcours
              </h2>
              <p className="mt-5 max-w-xl font-sans text-base leading-relaxed text-muted">
                Une formation certifiante en décoration d&apos;intérieur et conception 3D est venue
                structurer une sensibilité développée au fil des années. De quoi conjuguer intuition
                créative et méthode, à chaque étape de votre projet.
              </p>
              <div className="mt-8">
                <Button href="/prestations" variant="outline">
                  Découvrir mes prestations
                </Button>
              </div>
            </div>
            <Reveal direction="left" className="lg:col-span-5">
              <Figure
                src={diplome}
                ratio="landscape"
                alt="Diplôme de décoration d'intérieur et conception 3D d'Amélie Megdad"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}
```

- [ ] **Step 2: Vérifier** — `npm run typecheck` && `npm run lint` → 0 erreur. `/a-propos` : portrait + diplôme en placeholders tant que les fichiers sont absents (pas d'image cassée). Un seul `<h1>` (via PageHero).

- [ ] **Step 3: Commit**

```bash
git add src/app/a-propos/page.tsx
git commit -m "feat(a-propos): page bio réelle + portrait + diplôme (placeholders)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 10: Page `/blog` (état vide)

**Files:**
- Create: `src/app/blog/page.tsx`

**Interfaces:**
- Consumes: `PageHero`, `Section`, `Container`, `Button`, `siteConfig`.

- [ ] **Step 1: Écrire la page**

```tsx
import type { Metadata } from 'next';
import { Instagram } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { PageHero } from '@/components/ui/PageHero';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Journal',
  description:
    "Conseils déco, inspirations et coulisses des projets d'Amélie Déco, décoratrice d'intérieur à Bordeaux. Bientôt disponible.",
  alternates: { canonical: '/blog' },
};

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Journal"
        title="Inspirations & conseils déco"
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'Journal', href: '/blog' },
        ]}
      />
      <Section tone="background" spacing="lg">
        <Container size="narrow">
          <div className="rounded-xl border border-border bg-surface p-10 text-center sm:p-14">
            <p className="font-display text-2xl">Les premiers articles arrivent bientôt</p>
            <p className="mx-auto mt-4 max-w-md font-sans text-base leading-relaxed text-muted">
              Je prépare un journal pour partager mes conseils, mes inspirations et les coulisses
              de mes projets. En attendant, suivez mon actualité sur Instagram ou écrivez-moi
              directement.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Button href="/contact" size="lg">
                Me contacter
              </Button>
              <Button
                href={siteConfig.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                size="lg"
                variant="outline"
              >
                <Instagram size={18} strokeWidth={1.5} />
                Suivre sur Instagram
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
```

- [ ] **Step 2: Vérifier** — `npm run typecheck` && `npm run lint` → 0 erreur. `/blog` affiche l'état vide, aucun faux article.

- [ ] **Step 3: Commit**

```bash
git add src/app/blog/page.tsx
git commit -m "feat(blog): coquille + état vide soigné

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 11: Page `/contact`

**Files:**
- Create: `src/app/contact/page.tsx`

**Interfaces:**
- Consumes: `PageHero`, `ContactSection` (section home existante, `id="contact"`).

- [ ] **Step 1: Écrire la page**

```tsx
import type { Metadata } from 'next';
import { PageHero } from '@/components/ui/PageHero';
import { ContactSection } from '@/sections/home/ContactSection';

export const metadata: Metadata = {
  title: 'Contact',
  description:
    "Contactez Amélie Megdad, décoratrice d'intérieur à Bordeaux et en Gironde, pour discuter de votre projet de décoration ou d'aménagement.",
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Discutons de votre projet"
        description="Parlez-moi de votre espace et de vos envies. Je vous réponds avec plaisir."
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'Contact', href: '/contact' },
        ]}
      />
      <ContactSection />
    </>
  );
}
```

> `ContactSection` contient déjà son propre `<h2 id="contact-title">` et son formulaire ; la page ajoute uniquement le `PageHero` (h1). Pas de duplication de code.

- [ ] **Step 2: Vérifier** — `npm run typecheck` && `npm run lint` → 0 erreur. `/contact` affiche l'en-tête + le formulaire ; l'ancre `/#contact` de la home fonctionne toujours.

- [ ] **Step 3: Commit**

```bash
git add src/app/contact/page.tsx
git commit -m "feat(contact): page /contact réutilisant ContactSection

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 12: Pages légales (`/mentions-legales` + `/confidentialite`)

**Files:**
- Create: `src/app/mentions-legales/page.tsx`, `src/app/confidentialite/page.tsx`

**Interfaces:**
- Consumes: `PageHero`, `Section`, `Container`, `siteConfig`.

- [ ] **Step 1: `mentions-legales/page.tsx`**

```tsx
import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { PageHero } from '@/components/ui/PageHero';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Mentions légales',
  description: "Mentions légales du site d'Amélie Déco, décoratrice d'intérieur à Bordeaux.",
  alternates: { canonical: '/mentions-legales' },
  robots: { index: false, follow: true },
};

export default function MentionsLegalesPage() {
  return (
    <>
      <PageHero
        title="Mentions légales"
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'Mentions légales', href: '/mentions-legales' },
        ]}
      />
      <Section tone="background" spacing="lg">
        <Container size="narrow">
          <div className="space-y-8 font-sans text-base leading-relaxed text-muted">
            <div>
              <h2 className="font-display text-2xl text-foreground">Éditeur du site</h2>
              <p className="mt-3">
                {siteConfig.legalName} — {siteConfig.name}
                <br />
                {siteConfig.address.locality} ({siteConfig.address.postalCode}),{' '}
                {siteConfig.address.region}, France
                <br />
                E-mail : {siteConfig.email}
              </p>
              <p className="mt-3">
                Statut juridique, numéro SIRET et directeur de la publication :{' '}
                <em>à compléter</em>.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl text-foreground">Hébergement</h2>
              <p className="mt-3">
                Ce site est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789,
                États-Unis — vercel.com.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl text-foreground">Propriété intellectuelle</h2>
              <p className="mt-3">
                L&apos;ensemble des contenus (textes, visuels, éléments graphiques) présents sur ce
                site est protégé par le droit d&apos;auteur. Toute reproduction, même partielle, est
                soumise à autorisation préalable.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl text-foreground">Données personnelles</h2>
              <p className="mt-3">
                Le traitement des données transmises via le formulaire de contact est détaillé dans
                la{' '}
                <a href="/confidentialite" className="text-foreground underline hover:text-accent">
                  politique de confidentialité
                </a>
                .
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
```

- [ ] **Step 2: `confidentialite/page.tsx`**

```tsx
import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { PageHero } from '@/components/ui/PageHero';
import { siteConfig } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Politique de confidentialité',
  description: "Politique de confidentialité et traitement des données personnelles — Amélie Déco.",
  alternates: { canonical: '/confidentialite' },
  robots: { index: false, follow: true },
};

export default function ConfidentialitePage() {
  return (
    <>
      <PageHero
        title="Politique de confidentialité"
        breadcrumb={[
          { label: 'Accueil', href: '/' },
          { label: 'Politique de confidentialité', href: '/confidentialite' },
        ]}
      />
      <Section tone="background" spacing="lg">
        <Container size="narrow">
          <div className="space-y-8 font-sans text-base leading-relaxed text-muted">
            <div>
              <h2 className="font-display text-2xl text-foreground">Données collectées</h2>
              <p className="mt-3">
                Via le formulaire de contact, les données suivantes sont collectées : nom, adresse
                e-mail, téléphone (facultatif) et contenu de votre message.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl text-foreground">Finalité et base légale</h2>
              <p className="mt-3">
                Ces données sont utilisées uniquement pour répondre à votre demande de contact. La
                base légale est votre consentement, exprimé par l&apos;envoi du formulaire.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl text-foreground">Durée de conservation</h2>
              <p className="mt-3">
                Vos données sont conservées le temps nécessaire au traitement de votre demande, puis
                archivées ou supprimées <em>(durée à compléter)</em>.
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl text-foreground">Cookies</h2>
              <p className="mt-3">
                Ce site n&apos;utilise pas de cookies de suivi ni d&apos;outils de mesure
                d&apos;audience tiers. <em>(À réviser en cas d&apos;ajout ultérieur.)</em>
              </p>
            </div>
            <div>
              <h2 className="font-display text-2xl text-foreground">Vos droits</h2>
              <p className="mt-3">
                Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de rectification,
                d&apos;effacement et d&apos;opposition sur vos données. Pour les exercer, écrivez à{' '}
                {siteConfig.email}.
              </p>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
```

- [ ] **Step 3: Vérifier** — `npm run typecheck` && `npm run lint` → 0 erreur. `/mentions-legales` et `/confidentialite` s'ouvrent ; les liens légaux du Footer ne sont plus en 404.

- [ ] **Step 4: Commit**

```bash
git add src/app/mentions-legales/page.tsx src/app/confidentialite/page.tsx
git commit -m "feat(legal): pages mentions légales + confidentialité

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 13: Câblage image du hero + vérification finale

**Files:**
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `assetExists`.

- [ ] **Step 1: Câbler l'image du hero (rendu conditionnel)**

Dans `src/app/page.tsx`, ajouter l'import :

```tsx
import { assetExists } from '@/lib/assets';
```

Et remplacer `<Hero />` par :

```tsx
        <Hero image={assetExists('/images/hero.jpg') ? '/images/hero.jpg' : undefined} />
```

> Ainsi : si `public/images/hero.jpg` existe, il s'affiche ; sinon le dégradé espresso reste. Aucune image cassée.

- [ ] **Step 2: Build complet** — `npm run build`.
Expected: succès. Vérifier dans la sortie que les routes suivantes sont pré-rendues (statiques) :
`/prestations`, `/prestations/[slug]` (6 slugs), `/realisations`, `/realisations/[slug]` (6 slugs), `/a-propos`, `/blog`, `/contact`, `/mentions-legales`, `/confidentialite`, `/_not-found`.

- [ ] **Step 3: Parcours anti-404 (dev)** — `npm run dev`, puis cliquer/visiter :
  - Header (desktop + menu mobile) : Accueil, Prestations, Réalisations, À propos, Blog, Contact + bouton « Demander un rendez-vous » → aucune 404.
  - Footer : liens de nav + Mentions légales + Politique de confidentialité → aucune 404.
  - Hero : « Voir les réalisations » → `/realisations` ; CTA principal → `/contact`.
  - Page 404 (`/xxx`) : CTA « Retour à l'accueil » et « Me contacter » (`/#contact`) fonctionnent.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat(home): câblage conditionnel de l'image du hero (assetExists)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

- [ ] **Step 5: Mettre à jour le WORKLOG** — cocher l'étape 8 (statut ✅) dans `WORKLOG.md`, résumer les pages livrées, puis :

```bash
git add WORKLOG.md
git commit -m "docs: WORKLOG étape 8 terminée

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Notes de reprise / hors périmètre

- **Étape 9 (SEO)** : `sitemap.ts` (inclure les nouvelles routes + slugs), `robots.ts`, `opengraph-image`, favicons. Le helper `localBusinessJsonLd` référence déjà `/opengraph-image` (à créer en étape 9).
- **Étape 7 (Three.js)** et **étape 10 (Lighthouse/axe)** inchangées.
- **Images réalisations** : pilotées par les champs `image`/`gallery` de `lib/realisations.ts` (data-driven) jusqu'à la mise en place du **dashboard** (projet séparé — voir mémoire `ameliedeco-roadmap-dashboard`).
