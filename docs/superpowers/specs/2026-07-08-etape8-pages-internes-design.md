# Étape 8 — Pages internes publiques (Amélie Déco)

> Design validé le 2026-07-08. Objectif : supprimer la rupture « nav → 404 » en
> livrant les pages publiques internes, en cohérence avec le design system
> existant et le prompt original (SEO local, WCAG AA, réutilisation des sections).
>
> **Hors périmètre (projets séparés) :** dashboard privé, base de données, auth,
> upload d'images, vrais articles de blog. Sitemap / robots / opengraph-image /
> favicons restent en étape 9. Lighthouse/axe complet en étape 10.

## Objectif & critères de succès

- Tous les liens de `mainNav`, du Footer, du Hero et de la page 404 mènent à une
  page réelle (plus aucun 404 sur la navigation).
- `npm run typecheck` et `npm run build` passent : toutes les routes compilent,
  `generateStaticParams` valides, aucune image cassée (placeholders `Figure` si
  asset absent).
- Contenu **réel uniquement** (prestations, identité). Aucun faux article ni fausse
  prose. Les informations légales inconnues sont marquées « à compléter ».

## Routes (App Router, toutes SSG)

```
src/app/
  prestations/page.tsx              Liste des 6 prestations
  prestations/[slug]/page.tsx       Détail prestation
  realisations/page.tsx             Portfolio filtrable + pagination « Voir plus »
  realisations/[slug]/page.tsx      Détail projet (galerie placeholder)
  a-propos/page.tsx                 Bio réelle + portrait + diplôme
  blog/page.tsx                     Coquille + état vide soigné
  contact/page.tsx                  PageHero + <ContactSection/>
  mentions-legales/page.tsx         Page légale
  confidentialite/page.tsx          Politique RGPD
```

## Briques partagées (nouvelles)

### `components/ui/PageHero.tsx`
En-tête d'intro pour les pages sans hero sombre. Fond crème/sable, `eyebrow`
optionnel + titre `font-display` + `description` optionnelle + slot `Breadcrumbs`.
**Padding haut** suffisant pour dégager le header fixe (`h-18` = 72px) — règle le
décalage noté au WORKLOG. Le header est déjà solide hors accueil (`transparent =
pathname === '/'`).

Props : `{ eyebrow?, title, description?, breadcrumb?: BreadcrumbItem[] }`.

### `components/ui/Breadcrumbs.tsx`
Fil d'ariane visuel (`<nav aria-label="Fil d'ariane">`, séparateurs décoratifs
`aria-hidden`, dernier élément `aria-current="page"`) **+** JSON-LD
`BreadcrumbList` (réutilise le helper breadcrumb déjà présent dans
`lib/structured-data.ts`). Props : `items: { label: string; href?: string }[]`.

### `components/realisations/RealisationsGallery.tsx` (extraction)
Extraire la grille filtrable actuellement enfermée dans
`sections/home/RealisationsSection.tsx` vers un composant client réutilisable.
Consommé par la home **et** `/realisations`. Évite la duplication.

Props : `{ initialCount?: number; step?: number; paginate?: boolean }`.
- **Home** : `RealisationsSection` conserve son en-tête + le lien « Toutes les
  réalisations », mais délègue filtres+grille à `<RealisationsGallery
  initialCount={6} paginate={false} />`. (6 réalisations aujourd'hui → tout tient.)
- **`/realisations`** : `<RealisationsGallery initialCount={6} step={6} paginate />`.

Comportement pagination (uniquement si `paginate`) :
- Affiche `initialCount` vignettes, puis un bouton **« Voir plus »** révèle `step`
  (=6) vignettes de plus à chaque clic, jusqu'à épuisement (le bouton disparaît).
- Le compteur `visibleCount` **se réinitialise à `initialCount` au changement de
  filtre**.
- Annonce `aria-live="polite"` : « X réalisations affichées sur Y ».

### Couche d'accès aux données (`lib/*.ts`)
Toutes les lectures passent par des getters, pour swap DB futur sans toucher aux
pages :
- `lib/services.ts` : `getService(slug)` existe déjà ; ajouter `getAllServices()`.
- `lib/realisations.ts` : ajouter `getAllRealisations()` et `getRealisation(slug)`.
  Ajouter des champs **optionnels** à `interface Realisation` : `description?: string`
  et `gallery?: string[]` (accueillent le vrai contenu plus tard ; aujourd'hui vides
  → galerie en placeholders).

## Convention d'assets (`public/images/`)

```
public/images/
  hero.jpg                     Hero accueil — paysage ~2400×1350 (16:9), < 400 Ko
  a-propos/
    portrait-amelie.jpg        Portrait vertical ~1000×1250 (4:5)
    diplome.jpg                Photo du diplôme (ratio libre)
  realisations/<slug>/
    cover.jpg                  Vignette de couverture (4:3)
    01.jpg, 02.jpg …           Galerie page détail
```

Le hero est câblé via `<Hero image="/images/hero.jpg" />` ; si le fichier est
absent, le dégradé espresso reste affiché. `Figure` gère le placeholder chaud
partout ailleurs. Aucune image cassée quel que soit l'état de `public/`.

## Contenu & mise en page par page

### `/prestations` (liste)
`PageHero` (eyebrow « Prestations », titre, intro) + grille des 6 prestations
(`getAllServices()`) : carte = icône Lucide (`service.icon`), `title`, `summary`,
lien vers `/prestations/[slug]`. Réutilise `Container`, `Section`, `Reveal`.

### `/prestations/[slug]` (détail)
`generateStaticParams` sur les slugs, `generateMetadata` (title = `service.title`,
description = `service.summary`, canonical). Contenu : `PageHero` +
breadcrumb (Accueil › Prestations › titre) + `description` longue + liste `points`
+ CTA « Demander un rendez-vous » (`/contact`) + liens vers les autres prestations.
JSON-LD `Service` (provider = ProfessionalService du site). `notFound()` si slug
inconnu.

### `/realisations` (liste)
`PageHero` + `<RealisationsGallery initialCount={6} step={6} paginate />`.
`generateMetadata` (title, description, canonical).

### `/realisations/[slug]` (détail)
`generateStaticParams` + `generateMetadata`. Contenu : `PageHero` (titre projet) +
breadcrumb + méta (ville, surface, année, `projectType`, `category`) présentées
proprement + **galerie** : si `gallery` renseignée, `Figure` par image ; sinon
2–3 blocs `Figure` placeholder. CTA contact. JSON-LD `CreativeWork` léger.
`notFound()` si slug inconnu. Pas de prose inventée : uniquement les métadonnées
réelles + `description?` si un jour fournie.

### `/a-propos`
`PageHero` + contenu **réel** (mémoire identité) : reconversion depuis la petite
enfance vers la décoration, ~5 ans créatrice artisanale + formation déco &
conception 3D, ton sensible/bienveillant, « chaque intérieur raconte une histoire ».
Mise en page : bio + **portrait** (`Figure` → `/images/a-propos/portrait-amelie.jpg`)
+ bloc « Formation & parcours » avec le **diplôme** en médaillon encadré (`Figure`
→ `/images/a-propos/diplome.jpg`, alt descriptif) + citation + CTA. JSON-LD
`Person`/`AboutPage` optionnel.

### `/blog`
`PageHero` (« Journal ») + **état vide soigné** : message « Les premiers articles
arrivent bientôt » + CTA contact + lien Instagram. Aucune fausse entrée.
Architecture prête à recevoir une liste d'articles plus tard. Indexable.

### `/contact`
`PageHero` (« Contact ») + `<ContactSection />` réutilisée telle quelle (déjà
ancrée `id="contact"`). `generateMetadata`. Aucun code dupliqué. L'ancre
`/#contact` de la home continue de fonctionner.

### `/mentions-legales` & `/confidentialite`
Pages sobres (`PageHero` + prose lisible, `max-w` confortable).
- **Mentions légales** : éditeur (Amélie Megdad, Virelade 33720), contact e-mail,
  hébergeur (Vercel Inc.), propriété intellectuelle. Champs inconnus (statut
  juridique, SIRET, directeur de publication) → placeholders **« à compléter »**
  explicites.
- **Confidentialité** : données collectées via le formulaire de contact (nom,
  e-mail, téléphone, message), finalité (réponse à la demande), base légale,
  durée de conservation, absence de cookies tiers/analytics (à réviser si ajout
  ultérieur), droits RGPD + contact pour les exercer.

## SEO local & accessibilité (appliqués dès l'étape 8)

- `generateMetadata` par page/slug : `title`, `description`, `alternates.canonical`.
- JSON-LD : `Service` (prestation détail), `BreadcrumbList` (toutes pages internes),
  `CreativeWork` (réalisation détail).
- A11y : hiérarchie de titres correcte (un seul `h1` par page via `PageHero`),
  breadcrumb `aria`, `alt` descriptif sur `Figure`, focus visibles (global déjà en
  place), navigation clavier, filtres/pagination annoncés (`aria-live`).

## Vérification

1. `npm run typecheck` → 0 erreur.
2. `npm run build` → succès ; vérifier que les routes `[slug]` sont bien
   pré-rendues (generateStaticParams).
3. Parcours manuel : chaque lien de Header, Footer, Hero et 404 ouvre une page
   réelle (aucun 404).
4. `/realisations` : « Voir plus » révèle 6 vignettes de plus par clic et
   disparaît en fin de liste ; le compteur se réinitialise au changement de filtre.
5. `public/` vide → aucune image cassée (placeholders).

## Notes de reprise

- Repo non initialisé en git → le spec n'est pas committé (à faire quand git sera
  initialisé).
- Projet suivant (séparé) : **dashboard privé + DB + auth** pour gérer articles,
  avis et réalisations (sans commentaires). Aura son propre brainstorm → spec → plan.
```
