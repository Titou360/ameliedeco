# Sous-projet A — Couche données MongoDB + lecture publique (Amélie Déco)

> Design validé le 2026-07-10. **Premier des 4 sous-projets** du chantier
> « MongoDB + dashboard privé » (voir mémoire `ameliedeco-roadmap-dashboard`).
> Ordre : **A. données + lecture publique** → B. auth + coquille dashboard →
> C. CRUD dashboard → D. upload d'images.

## Objectif

Brancher les **avis** et **réalisations** sur MongoDB Atlas en lecture,
**supprimer les données fictives**, avec des **états vides** propres, sans
casser les pages publiques ni les performances.

## Décisions (validées)

- **Rendu : ISR.** `revalidate = 60` sur l'accueil, `/realisations`,
  `/realisations/[slug]`. `dynamicParams = true` pour rendre à la volée une
  réalisation ajoutée après le build. Rafraîchissement immédiat à la sauvegarde
  = plus tard (sous-projet C, via `revalidatePath`/`revalidateTag`).
- **États vides :** sur l'accueil, une section sans données **est masquée**
  (`return null`). La page `/realisations` (liée au menu) affiche un **message
  discret** « bientôt » quand elle est vide.
- **Schéma CMS :** chaque document a `published: boolean` + `order: number`
  (+ `createdAt`/`updatedAt`). La lecture publique ne renvoie que
  `published: true`, triée par `order` croissant.

## Architecture & fichiers

**Créés :**
- `src/lib/db/mongodb.ts` — client `MongoClient` en singleton mis en cache
  (réutilisé entre invocations serverless / HMR via un `global`). Lit
  `MONGODB_URI` et `MONGODB_DB`.
- `src/lib/db/testimonials.ts` — `getPublishedTestimonials(): Promise<Testimonial[]>`.
- `src/lib/db/realisations.ts` — `getPublishedRealisations()`,
  `getPublishedRealisationSlugs()`, `getRealisationBySlug(slug)`.

**Modifiés :**
- `src/lib/testimonials.ts` — garder **le type `Testimonial`** ; supprimer
  l'array fictif.
- `src/lib/realisations.ts` — garder **le type `Realisation`**,
  `projectCategories` et `ProjectCategory` (taxonomie fixe) ; supprimer l'array
  fictif + `getAllRealisations`/`getRealisation` (remplacés par les repos db).
- `src/sections/home/TestimonialsSection.tsx` — devient un wrapper **serveur**
  qui récupère les avis ; si vide → `null` ; sinon rend un nouveau
  `TestimonialsSlider` (client) avec les items en props.
- `src/components/testimonials/TestimonialsSlider.tsx` (créé) — le slider client actuel,
  recevant `items: Testimonial[]` en props (plus d'import direct de données).
- `src/sections/home/RealisationsSection.tsx` — `await getPublishedRealisations()` ;
  vide → `null`.
- `src/app/realisations/page.tsx` — `await getPublishedRealisations()` ; vide →
  message « bientôt » ; sinon `RealisationsGallery`. `revalidate = 60`.
- `src/app/realisations/[slug]/page.tsx` — `generateStaticParams` via
  `getPublishedRealisationSlugs()` ; `getRealisationBySlug` async ; `notFound()`
  si absent/brouillon ; `dynamicParams = true` ; `revalidate = 60`.
- `src/app/page.tsx` — `revalidate = 60`.

## Modèle de données

Collection `testimonials` :
```
{ _id, published: boolean, order: number,
  name: string, city: string, rating: number, quote: string, photo?: string,
  createdAt: Date, updatedAt: Date }
```
Collection `realisations` :
```
{ _id, published: boolean, order: number,
  slug: string, title: string, city: string, surface: string,
  category: ProjectCategory, projectType: string, year: number,
  description?: string, gallery?: string[], image?: string,
  createdAt: Date, updatedAt: Date }
```
Les types TS `Testimonial` / `Realisation` restent la source de vérité des
formes applicatives (sans les champs purement Mongo `_id`/`createdAt` côté rendu
public — les repos renvoient des objets sérialisables typés).

## Lecture publique — détail par surface

- **Accueil** (`page.tsx`, `revalidate = 60`) : `TestimonialsSection` et
  `RealisationsSection` récupèrent leurs données ; **section masquée si vide**.
- **`TestimonialsSection`** : wrapper serveur → `getPublishedTestimonials()`.
  Vide → `null`. Sinon `<TestimonialsSlider items={...} />` (le comportement
  slider/clavier/aria-live actuel est déplacé tel quel dans le composant client).
- **`RealisationsSection`** : serveur → `getPublishedRealisations()`. Vide →
  `null`. Sinon en-tête + `<RealisationsGallery items={...} initialCount={6} />`
  + lien « Toutes les réalisations ».
- **`/realisations`** : `getPublishedRealisations()`. Vide → `PageHero` + carte
  message « Les réalisations arrivent bientôt » (même esprit que `/blog`).
  Sinon `<RealisationsGallery items={...} initialCount={6} step={6} paginate />`.
- **`/realisations/[slug]`** : `getPublishedRealisationSlugs()` pour
  `generateStaticParams` ; `getRealisationBySlug(slug)` ; `notFound()` si absent.

## Résilience

Chaque fonction repo entoure l'accès Mongo d'un `try/catch` : en cas d'erreur
(connexion, réseau), elle **journalise** (`console.error`) et renvoie une valeur
vide (`[]` ou `undefined`). Le site dégrade alors proprement vers les **états
vides** au lieu de casser le build ou le rendu. Aucune exception ne remonte aux
composants.

## Vérification

- `npm run typecheck` + `npm run lint` (0 erreur).
- `npm run build` (via PowerShell) réussit **même base vide** : accueil sans
  sections avis/réalisations, `/realisations` en message vide, aucune page
  `[slug]` générée (liste de slugs vide) — build vert.
- Test manuel : insérer un document `published: true` dans Atlas → il apparaît
  après revalidation (≤ 60 s) sur l'accueil et `/realisations`, et sa page
  `/realisations/<slug>` se rend.

## Hors périmètre (sous-projets suivants)

- **B** : auth + zone `/admin`. **C** : CRUD dashboard + revalidation à la
  sauvegarde. **D** : upload d'images (choix stockage) + `images.remotePatterns`
  dans `next.config` pour les URLs distantes.
- **Blog** : modèle article + lecture + CRUD, extension ultérieure.

## Notes d'exécution

- **Atlas** : le build/serveur doit pouvoir joindre le cluster → autoriser l'IP
  (Network Access) et fournir `MONGODB_URI`/`MONGODB_DB` (déjà en `.env.local`
  local ; à configurer côté Vercel pour la prod). Build **via PowerShell**
  (réseau + `NODE_EXTRA_CA_CERTS` pour next/font).
- **Saisie intérimaire** : via l'interface MongoDB Atlas tant que le dashboard
  (C) n'existe pas. Pas de script de seed (départ à vide assumé).
- ⚠️ Le mot de passe de connexion a été transmis en clair → **à faire tourner**.
