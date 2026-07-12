# Sous-projet A — MongoDB + lecture publique : Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Brancher avis + réalisations sur MongoDB Atlas en lecture (ISR), supprimer les données fictives, avec des états vides propres et résilients.

**Architecture:** Un client MongoDB en singleton (`lib/db/mongodb.ts`) alimente des repositories asynchrones (`lib/db/*.ts`) qui ne renvoient que les documents `published`, triés par `order`, et **capturent toute erreur pour renvoyer du vide**. Les sections/pages publiques deviennent des composants serveur `async` qui masquent la section si vide (accueil) ou affichent un message (page dédiée). ISR `revalidate = 60`.

**Tech Stack:** Next.js 15 (App Router, params async, ISR), React 19, TypeScript strict, driver `mongodb` (officiel), Tailwind v4.

## Global Constraints

- **Vérification (pas de tests unitaires dans ce repo)** : chaque tâche se valide par `npm run typecheck` (0 erreur) + `npm run lint` (0 erreur) + contrôle ciblé. `npm run build` aux jalons. Ne PAS ajouter de framework de test.
- **npm/next via PowerShell** avec `$env:NODE_EXTRA_CA_CERTS = "c:\Projets Web\ameliedeco\ameliedeco-www\system-ca.pem"` (next/font fetch TLS). Le build lit aussi MongoDB Atlas → connexion via `.env.local` (`MONGODB_URI`, `MONGODB_DB`, déjà présents). **Ne pas supprimer `.next`.**
- **Résilience** : chaque fonction repo entoure l'accès Mongo d'un `try/catch` → `console.error` + valeur vide (`[]`/`undefined`). Aucune exception ne remonte : le build et le rendu réussissent **même Atlas injoignable ou base vide**.
- **Rendu ISR** : `export const revalidate = 60` sur `/`, `/realisations`, `/realisations/[slug]`. `export const dynamicParams = true` sur `[slug]`.
- **Lecture publique** : filtre `{ published: true }`, tri `{ order: 1 }`. Objets renvoyés **sérialisables** (pas de `_id` ObjectId dans le rendu).
- **États vides** : accueil → section `return null` si vide ; `/realisations` → message « bientôt » si vide.
- **Séparation client/serveur** : le driver `mongodb` ne doit être importé que par des composants serveur / repos. Les composants client n'importent que **des types** (`import type`).
- TypeScript strict, aucune emoji (icônes lucide), tokens de marque uniquement, WCAG AA (états vides accessibles). reduced-motion via MotionConfig/Reveal existants.
- Commits terminés par : `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

---

## File Structure

**Créés :**
- `src/lib/db/mongodb.ts` — client singleton + `getDb()`.
- `src/lib/db/testimonials.ts` — `getPublishedTestimonials()`.
- `src/lib/db/realisations.ts` — `getPublishedRealisations()`, `getPublishedRealisationSlugs()`, `getRealisationBySlug()`.
- `src/components/testimonials/TestimonialsSlider.tsx` — slider client (reçoit `items` en props).

**Modifiés :**
- `src/lib/testimonials.ts` — garder le type `Testimonial` ; supprimer l'array.
- `src/lib/realisations.ts` — garder `Realisation`, `projectCategories`, `ProjectCategory` ; supprimer l'array + `getAllRealisations`/`getRealisation`.
- `src/sections/home/TestimonialsSection.tsx` — wrapper serveur (async, null si vide).
- `src/sections/home/RealisationsSection.tsx` — async, null si vide.
- `src/app/realisations/page.tsx` — async, message vide, `revalidate`.
- `src/app/realisations/[slug]/page.tsx` — async, `generateStaticParams` Mongo, `revalidate`, `dynamicParams`.
- `src/app/page.tsx` — `revalidate = 60`.

---

## Task 1 : Driver mongodb + client singleton

**Files:**
- Create: `src/lib/db/mongodb.ts`
- Modify: `package.json` (dépendance `mongodb` via npm)

**Interfaces:**
- Produces: `getDb(): Promise<Db>` (depuis `@/lib/db/mongodb`).

- [ ] **Step 1 : Installer le driver** (PowerShell)

```
$env:NODE_EXTRA_CA_CERTS = "c:\Projets Web\ameliedeco\ameliedeco-www\system-ca.pem"
npm install mongodb
```
Expected: `mongodb` ajouté à `dependencies` dans `package.json`, install OK.

- [ ] **Step 2 : Écrire `src/lib/db/mongodb.ts`**

```ts
import { MongoClient, type Db } from 'mongodb';

/**
 * Client MongoDB partagé. Réutilisé entre invocations serverless et entre
 * rechargements à chaud (dev) via un cache sur `globalThis`. Timeout de
 * sélection court pour échouer vite si le cluster est injoignable (le repo
 * appelant capte l'erreur et renvoie du vide).
 */
const globalForMongo = globalThis as unknown as {
  _mongoClientPromise?: Promise<MongoClient>;
};

function clientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI manquant (voir .env.local).');
  if (!globalForMongo._mongoClientPromise) {
    globalForMongo._mongoClientPromise = new MongoClient(uri, {
      serverSelectionTimeoutMS: 5000,
    }).connect();
  }
  return globalForMongo._mongoClientPromise;
}

export async function getDb(): Promise<Db> {
  const dbName = process.env.MONGODB_DB;
  if (!dbName) throw new Error('MONGODB_DB manquant (voir .env.local).');
  const client = await clientPromise();
  return client.db(dbName);
}
```

- [ ] **Step 3 : Vérifier** — `npm run typecheck` (PowerShell) → 0 erreur.

- [ ] **Step 4 : Commit**

```bash
git add package.json package-lock.json src/lib/db/mongodb.ts
git commit -m "feat(db): driver mongodb + client singleton getDb()

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2 : Repositories avis + réalisations

**Files:**
- Create: `src/lib/db/testimonials.ts`, `src/lib/db/realisations.ts`

**Interfaces:**
- Consumes: `getDb` (Task 1) ; types `Testimonial` (`@/lib/testimonials`), `Realisation` (`@/lib/realisations`).
- Produces:
  - `getPublishedTestimonials(): Promise<Testimonial[]>`
  - `getPublishedRealisations(): Promise<Realisation[]>`
  - `getPublishedRealisationSlugs(): Promise<string[]>`
  - `getRealisationBySlug(slug: string): Promise<Realisation | undefined>`

- [ ] **Step 1 : `src/lib/db/testimonials.ts`**

```ts
import type { Document } from 'mongodb';
import { getDb } from './mongodb';
import type { Testimonial } from '@/lib/testimonials';

function toTestimonial(d: Document): Testimonial {
  return {
    name: d.name,
    city: d.city,
    rating: d.rating,
    quote: d.quote,
    photo: d.photo ?? undefined,
  };
}

/** Avis publiés, triés par `order`. Renvoie `[]` en cas d'erreur. */
export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  try {
    const db = await getDb();
    const docs = await db
      .collection('testimonials')
      .find({ published: true })
      .sort({ order: 1 })
      .toArray();
    return docs.map(toTestimonial);
  } catch (err) {
    console.error('[db] getPublishedTestimonials a échoué :', err);
    return [];
  }
}
```

- [ ] **Step 2 : `src/lib/db/realisations.ts`**

```ts
import type { Document } from 'mongodb';
import { getDb } from './mongodb';
import type { Realisation } from '@/lib/realisations';

function toRealisation(d: Document): Realisation {
  return {
    slug: d.slug,
    title: d.title,
    city: d.city,
    surface: d.surface,
    category: d.category,
    projectType: d.projectType,
    year: d.year,
    description: d.description ?? undefined,
    gallery: d.gallery ?? undefined,
    image: d.image ?? undefined,
  };
}

/** Réalisations publiées, triées par `order`. Renvoie `[]` en cas d'erreur. */
export async function getPublishedRealisations(): Promise<Realisation[]> {
  try {
    const db = await getDb();
    const docs = await db
      .collection('realisations')
      .find({ published: true })
      .sort({ order: 1 })
      .toArray();
    return docs.map(toRealisation);
  } catch (err) {
    console.error('[db] getPublishedRealisations a échoué :', err);
    return [];
  }
}

/** Slugs publiés (pour generateStaticParams). Renvoie `[]` en cas d'erreur. */
export async function getPublishedRealisationSlugs(): Promise<string[]> {
  try {
    const db = await getDb();
    const docs = await db
      .collection('realisations')
      .find({ published: true }, { projection: { slug: 1 } })
      .toArray();
    return docs.map((d) => d.slug as string);
  } catch (err) {
    console.error('[db] getPublishedRealisationSlugs a échoué :', err);
    return [];
  }
}

/** Une réalisation publiée par slug, ou `undefined` (absente / brouillon / erreur). */
export async function getRealisationBySlug(slug: string): Promise<Realisation | undefined> {
  try {
    const db = await getDb();
    const doc = await db.collection('realisations').findOne({ slug, published: true });
    return doc ? toRealisation(doc) : undefined;
  } catch (err) {
    console.error('[db] getRealisationBySlug a échoué :', err);
    return undefined;
  }
}
```

- [ ] **Step 3 : Vérifier** — `npm run typecheck` + `npm run lint` → 0 erreur.

- [ ] **Step 4 : Commit**

```bash
git add src/lib/db/testimonials.ts src/lib/db/realisations.ts
git commit -m "feat(db): repositories avis + réalisations (published, tri order, résilients)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3 : Chemin de lecture Réalisations (Mongo) + retrait des données fictives

**Files:**
- Modify: `src/lib/realisations.ts`, `src/sections/home/RealisationsSection.tsx`, `src/app/realisations/page.tsx`, `src/app/realisations/[slug]/page.tsx`

**Interfaces:**
- Consumes: `getPublishedRealisations`, `getPublishedRealisationSlugs`, `getRealisationBySlug` (Task 2).

- [ ] **Step 1 : `src/lib/realisations.ts` — retirer les données fictives, garder types + taxonomie**

Remplacer TOUT le contenu par :

```ts
/**
 * Types et taxonomie des réalisations. Les DONNÉES viennent de MongoDB
 * (voir `src/lib/db/realisations.ts`). Ce fichier ne contient plus de données.
 */

export const projectCategories = [
  'Appartement',
  'Maison',
  'Cuisine',
  'Salon',
  'Professionnel',
] as const;

export type ProjectCategory = (typeof projectCategories)[number];

export interface Realisation {
  slug: string;
  title: string;
  city: string;
  /** Surface indicative (ex. « 75 m² »). */
  surface: string;
  category: ProjectCategory;
  /** Type de projet affiché (ex. « Rénovation complète »). */
  projectType: string;
  /** Chemin/URL image (placeholder si absent). */
  image?: string;
  year: number;
  /** Description longue (page détail). */
  description?: string;
  /** Galerie (chemins/URL) — placeholders si vide. */
  gallery?: string[];
}
```

- [ ] **Step 2 : `src/sections/home/RealisationsSection.tsx` — async, masquée si vide**

Remplacer le contenu par :

```tsx
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { Button } from '@/components/ui/Button';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { RealisationsGallery } from '@/components/realisations/RealisationsGallery';
import { getPublishedRealisations } from '@/lib/db/realisations';

/**
 * Aperçu du portfolio sur la home : en-tête + grille filtrable (6 max) déléguée
 * à RealisationsGallery. Masquée s'il n'y a aucune réalisation publiée.
 */
export async function RealisationsSection() {
  const items = await getPublishedRealisations();
  if (items.length === 0) return null;

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
          <RealisationsGallery items={items} initialCount={6} />
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

- [ ] **Step 3 : `src/app/realisations/page.tsx` — async, message vide, ISR**

Remplacer le contenu par :

```tsx
import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { PageHero } from '@/components/ui/PageHero';
import { RealisationsGallery } from '@/components/realisations/RealisationsGallery';
import { getPublishedRealisations } from '@/lib/db/realisations';

export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Réalisations',
  description:
    "Une sélection de projets de décoration et d'aménagement d'intérieur réalisés à Bordeaux et en Gironde.",
  alternates: { canonical: '/realisations' },
};

export default async function RealisationsPage() {
  const items = await getPublishedRealisations();

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
          {items.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-xl border border-border bg-surface p-10 text-center sm:p-14">
              <p className="font-display text-2xl">Les réalisations arrivent bientôt</p>
              <p className="mx-auto mt-4 max-w-md font-sans text-base leading-relaxed text-muted">
                Les premiers projets seront présentés ici très prochainement.
              </p>
            </div>
          ) : (
            <RealisationsGallery items={items} initialCount={6} step={6} paginate />
          )}
        </Container>
      </Section>
    </>
  );
}
```

- [ ] **Step 4 : `src/app/realisations/[slug]/page.tsx` — async Mongo, generateStaticParams, ISR**

Remplacer le contenu par :

```tsx
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
```

- [ ] **Step 5 : Vérifier** — `npm run typecheck` + `npm run lint` → 0 erreur. Puis **build milestone** (PowerShell, CA cert) : `npm run build` réussit. Comme la base est vide (ou Atlas injoignable → repos renvoient `[]`), attendu : `/realisations` en mode message vide, **aucune** page `/realisations/[slug]` pré-générée, accueil sans section réalisations, build **vert**.

- [ ] **Step 6 : Commit**

```bash
git add src/lib/realisations.ts src/sections/home/RealisationsSection.tsx src/app/realisations/page.tsx "src/app/realisations/[slug]/page.tsx"
git commit -m "feat(realisations): lecture MongoDB + états vides + ISR, retrait données fictives

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4 : Chemin de lecture Avis (Mongo) + slider client

**Files:**
- Create: `src/components/testimonials/TestimonialsSlider.tsx`
- Modify: `src/sections/home/TestimonialsSection.tsx`, `src/lib/testimonials.ts`

**Interfaces:**
- Consumes: `getPublishedTestimonials` (Task 2), type `Testimonial`.
- Produces: `TestimonialsSlider({ items }: { items: Testimonial[] })`.

- [ ] **Step 1 : `src/lib/testimonials.ts` — garder le type, retirer l'array**

Remplacer TOUT le contenu par :

```ts
/**
 * Type des avis clients. Les DONNÉES viennent de MongoDB
 * (voir `src/lib/db/testimonials.ts`). Ce fichier ne contient plus de données.
 */
export interface Testimonial {
  name: string;
  city: string;
  rating: number;
  quote: string;
  /** Photo (chemin/URL) — placeholder si absente. */
  photo?: string;
}
```

- [ ] **Step 2 : `src/components/testimonials/TestimonialsSlider.tsx` — slider client (items en props)**

```tsx
'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Figure } from '@/components/ui/Figure';
import type { Testimonial } from '@/lib/testimonials';
import { cn } from '@/utils/cn';

/**
 * Slider d'avis clients (reçoit les données en props). Transitions douces
 * (Framer Motion), navigation clavier via boutons, zone annoncée (aria-live).
 */
export function TestimonialsSlider({ items }: { items: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const count = items.length;

  const go = (dir: number) => {
    setDirection(dir);
    setIndex((prev) => (prev + dir + count) % count);
  };

  const current = items[index];

  return (
    <div className="relative mx-auto mt-14 max-w-3xl">
      <div className="min-h-64" aria-live="polite">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.figure
            key={index}
            custom={direction}
            initial={{ opacity: 0, x: direction * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * -40 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center"
          >
            <div
              className="flex gap-1 text-accent"
              role="img"
              aria-label={`Note : ${current.rating} sur 5`}
            >
              {Array.from({ length: current.rating }).map((_, i) => (
                <Star key={i} size={18} className="fill-current" strokeWidth={0} />
              ))}
            </div>
            <blockquote className="mt-6 font-display text-2xl leading-snug sm:text-3xl">
              « {current.quote} »
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-4">
              <div className="h-12 w-12 overflow-hidden rounded-full">
                <Figure
                  src={current.photo}
                  alt={`Photo de ${current.name}`}
                  ratio="square"
                  sizes="48px"
                  className="rounded-full shadow-none"
                />
              </div>
              <div className="text-left">
                <p className="font-sans text-sm font-medium text-foreground">{current.name}</p>
                <p className="font-sans text-sm text-muted">{current.city}</p>
              </div>
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>

      {count > 1 && (
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Avis précédent"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border transition-colors hover:bg-sand-50"
          >
            <ChevronLeft size={18} strokeWidth={1.5} />
          </button>

          <div className="flex gap-2" role="tablist" aria-label="Choisir un avis">
            {items.map((t, i) => (
              <button
                key={t.name}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Avis ${i + 1} sur ${count}`}
                onClick={() => {
                  setDirection(i > index ? 1 : -1);
                  setIndex(i);
                }}
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  i === index ? 'w-6 bg-espresso' : 'w-2 bg-border hover:bg-accent/60',
                )}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Avis suivant"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border transition-colors hover:bg-sand-50"
          >
            <ChevronRight size={18} strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  );
}
```

> Amélioration incidente : les contrôles ne s'affichent que s'il y a plus d'un avis (`count > 1`), inutile pour un seul.

- [ ] **Step 3 : `src/sections/home/TestimonialsSection.tsx` — wrapper serveur (async, null si vide)**

Remplacer TOUT le contenu par :

```tsx
import { Container } from '@/components/ui/Container';
import { Section } from '@/components/ui/Section';
import { TestimonialsSlider } from '@/components/testimonials/TestimonialsSlider';
import { getPublishedTestimonials } from '@/lib/db/testimonials';

/**
 * Section « Avis clients » : récupère les avis publiés (serveur). Masquée s'il
 * n'y en a aucun ; sinon en-tête + slider client.
 */
export async function TestimonialsSection() {
  const items = await getPublishedTestimonials();
  if (items.length === 0) return null;

  return (
    <Section tone="background" spacing="lg" aria-labelledby="avis-title">
      <Container size="wide">
        <div className="mx-auto max-w-3xl text-center">
          <p className="font-sans text-sm uppercase tracking-[0.2em] text-accent">Témoignages</p>
          <h2 id="avis-title" className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
            Ce que disent mes clients
          </h2>
        </div>
        <TestimonialsSlider items={items} />
      </Container>
    </Section>
  );
}
```

- [ ] **Step 4 : Vérifier** — `npm run typecheck` + `npm run lint` → 0 erreur. Puis **build milestone** (PowerShell, CA cert) : `npm run build` réussit ; accueil sans section avis (base vide).

- [ ] **Step 5 : Commit**

```bash
git add src/lib/testimonials.ts src/components/testimonials/TestimonialsSlider.tsx src/sections/home/TestimonialsSection.tsx
git commit -m "feat(testimonials): lecture MongoDB + slider client + état vide, retrait données fictives

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5 : ISR accueil + vérification finale

**Files:**
- Modify: `src/app/page.tsx`, `WORKLOG.md`

- [ ] **Step 1 : `src/app/page.tsx` — activer l'ISR**

Ajouter, juste après les imports (avant `export const metadata`) :

```tsx
export const revalidate = 60;
```

- [ ] **Step 2 : Build final** (PowerShell, CA cert) : `npm run build`.
Attendu : succès. Base vide → l'accueil ne contient ni section avis ni section réalisations ; `/realisations` en message vide ; aucune route `/realisations/[slug]` pré-rendue. Vérifier qu'aucune erreur Mongo ne casse le build (les repos captent et renvoient vide).

- [ ] **Step 3 : Contrôle manuel de fraîcheur (optionnel si Atlas accessible)** — insérer dans Atlas un document `realisations` `{ published: true, order: 1, slug: "test", title: "Test", city: "Bordeaux", surface: "50 m²", category: "Appartement", projectType: "Test", year: 2025 }`, puis `npm run dev` : après ≤ 60 s / rechargement, la réalisation apparaît sur `/realisations` et `/realisations/test` se rend. **Supprimer ce document de test ensuite.**

- [ ] **Step 4 : WORKLOG** — ajouter une entrée datée résumant le sous-projet A (lecture MongoDB avis+réalisations, ISR, états vides, données fictives retirées ; dashboard = sous-projets B→D à venir).

- [ ] **Step 5 : Commit**

```bash
git add src/app/page.tsx WORKLOG.md
git commit -m "feat(home): ISR revalidate 60 + doc sous-projet A terminé

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-review (couverture spec)

- Client singleton + `getDb` → Task 1. Repos published/order/résilients → Task 2. ✅
- Suppression données fictives (avis + réalisations) → Task 3 (réal.) + Task 4 (avis). ✅
- États vides (accueil masqué / page message) → Tasks 3 & 4. ✅
- ISR `revalidate=60` + `dynamicParams` + generateStaticParams Mongo → Tasks 3 & 5. ✅
- Séparation client/serveur (slider = `import type`) → Task 4. ✅
- Résilience (build vert base vide / Atlas injoignable) → Tasks 3, 4, 5 (build milestones). ✅

## Notes d'exécution

- Build **via PowerShell** (`NODE_EXTRA_CA_CERTS` + accès Atlas). Ne pas supprimer `.next`.
- Atlas : autoriser l'IP (Network Access) sinon les repos renvoient vide (build reste vert, mais rien ne s'affiche). ⚠️ Mot de passe transmis en clair → à faire tourner.
- Images des réalisations (URLs distantes) : `images.remotePatterns` sera ajouté au sous-projet D (upload), pas ici.
