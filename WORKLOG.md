# Journal de bord — Refonte site Amélie Déco

> Ce fichier trace l'avancement pour **reprendre le travail où il en était**.
> Mis à jour à la fin de chaque étape. Dernière mise à jour : **2026-07-11**.

## Contexte

Refonte premium (objectif Awwwards) du site de **Amélie Megdad**, décoratrice
d'intérieur à Virelade (33720), Gironde — zone Bordeaux. Identité, palette et
contenu réels extraits de l'ancien site `ameliedeco.com` (voir mémoire projet).

- Accroche conservée : « Espaces et émotions sur mesure ».
- Palette conservée (neutres chauds) — voir `src/styles/globals.css`.
- Stack : Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
  Framer Motion · GSAP · Three.js (R3F + Drei) · Lenis · Lucide · next/font · next/image.

## Feuille de route (10 étapes)

| # | Étape | Statut |
|---|-------|--------|
| 1 | Socle projet : scaffold, config, design tokens, fonts, layout SEO | ✅ terminé |
| 2 | Providers (Lenis, reduced-motion), architecture dossiers | ✅ terminé |
| 3 | Header + Footer + composants UI génériques | ✅ terminé |
| 4 | Homepage — Hero + section Confiance + Présentation | ✅ terminé |
| 5 | Homepage — Réalisations (portfolio + filtres) + Processus | ✅ terminé |
| 6 | Homepage — Avis clients + Zone d'intervention + Contact | ✅ terminé |
| 7 | Intro immersive Three.js (R3F) légère | ⚪ à faire |
| 8 | Pages internes : Prestations, Réalisations, À propos, Blog | ✅ terminé |
| 9 | SEO local complet : sitemap, robots, JSON-LD LocalBusiness/ProfessionalService | ⚪ à faire |
| 10 | Vérifications finales : TS, Lighthouse, WCAG AA, responsive, reduced-motion | ⚪ à faire |

Légende : ✅ terminé · 🟡 en cours · ⚪ à faire

## Journal détaillé

### 2026-07-08 — Étape 1 (en cours) : socle projet
- Récupéré identité/palette/contenu réels de l'ancien site (HTML full-JS parsé).
- Sauvegardé les faits projet en mémoire Claude (identité, palette, stack).
- Scaffold manuel Next.js 15 + React 19 + TS + Tailwind v4 (contrôle total,
  architecture sur-mesure plutôt que boilerplate create-next-app).
- Fichiers config : `package.json`, `tsconfig.json`, `next.config.mjs`,
  `postcss.config.mjs`, `eslint.config.mjs`, `.gitignore`.
- Design system : `src/styles/globals.css` (tokens palette, typo, radius,
  ombres, focus visible WCAG, `prefers-reduced-motion`, dark mode prêt/désactivé).
- Config centrale `src/lib/site.ts` (NAP, nav, réseaux, zones SEO).
- `src/app/layout.tsx` : fonts next/font (Cormorant Garamond + Manrope),
  metadata complète (title/description/OG/Twitter/robots/canonical), skip-link.
- `src/app/page.tsx` : homepage provisoire validant le design system.
- **Reste pour clôturer l'étape 1** : `npm install`, puis `npm run typecheck`
  et `npm run build` sans erreur.

### 2026-07-08 — Étapes 2 & 3 : providers, UI, header/footer + vérif socle
- Hooks : `useReducedMotion`, `useIsomorphicLayoutEffect`. Utilitaire `cn`.
- Providers : `SmoothScrollProvider` (Lenis, désactivé si reduced-motion, RAF
  nettoyée), `AppProviders` (`MotionConfig reducedMotion="user"` + Lenis).
- Animation générique `Reveal` (Framer Motion, reveal au scroll, polymorphe).
- UI génériques : `Container`, `Section`, `Button` (polymorphe Link/button,
  micro-interaction CSS), `Logo`, `SectionHeading`.
- Layout : `Header` (sticky, transparent sur l'accueil → solide au scroll, menu
  mobile animé accessible : Échap, aria-expanded, lock scroll) + `Footer` (NAP,
  zones SEO, réseaux, liens légaux). Câblés dans `layout.tsx`.
- SEO : `lib/structured-data.ts` (JSON-LD ProfessionalService/LocalBusiness +
  breadcrumb) et composant `JsonLd` (prêts, à injecter étape 9).
- Homepage : hero provisoire sombre cohérent + intro (raffiné étape 4).
- **Blocage résolu :** interception TLS de la machine → `npm install` échouait
  (UNABLE_TO_VERIFY_LEAF_SIGNATURE). Correctif : `system-ca.pem` + `npm cafile`
  + `NODE_EXTRA_CA_CERTS`. Voir mémoire `dev-env-tls-ca`.
- **Vérif socle OK :** `npm install` (407 pkg), `typecheck` 0 erreur,
  `build` succès (4 pages statiques, home 146 kB First Load JS).

### 2026-07-08 — Étapes 4-6 : homepage complète
- Décision assets : **placeholders premium** (système `Figure` swappable) — la
  cliente déposera ses photos dans `public/` sans toucher au code.
- Composant image `Figure` (next/image + placeholder chaud dégradé, ratios, CLS 0).
- Données réutilisables : `lib/services.ts` (6 prestations réelles),
  `lib/realisations.ts` (portfolio + catégories), `lib/testimonials.ts`,
  `lib/icons.tsx` (registre Lucide).
- Sections homepage (dans `sections/home/`) :
  - `Hero` (plein écran, titre révélé mot à mot, fond swappable, scroll cue).
  - `TrustSection` (4 engagements, hover, cascade).
  - `PresentationSection` (portrait + bio réelle + citation + CTA).
  - `RealisationsSection` (filtres par catégorie, grille animée layout FM) +
    `components/realisations/ProjectCard` réutilisable (hover zoom + infos).
  - `ProcessSection` (timeline 4 étapes).
  - `TestimonialsSection` (slider accessible, notation, aria-live).
  - `ServiceAreaSection` (carte SVG stylisée + villes, SEO local).
  - `ContactSection` (formulaire accessible + honeypot) + route `/api/contact`
    (validation serveur ; TODO brancher un service e-mail type Resend).
- JSON-LD `ProfessionalService` injecté sur l'accueil.
- **Vérif OK :** `typecheck` 0 erreur, `build` succès (home 161 kB First Load JS).

### 2026-07-09 — Étape 8 : pages internes complètes + vérification finale

- Pages livrées (toutes pré-rendues statiques en production) :
  - `/prestations` — liste des 6 prestations réelles avec `PageHero` et `Breadcrumbs`.
  - `/prestations/[slug]` — 6 params générés (`generateStaticParams`) : conseil-deco,
    projet-deco-amenagement-3d, relooking-interieur, home-staging, shopping-accompagne,
    conseil-couleurs. Détail prestation + JSON-LD `Service` par page.
  - `/realisations` — galerie filtrée (`RealisationsGallery`) + `PageHero` + `Breadcrumbs`.
  - `/realisations/[slug]` — 6 params : appartement-lumiere-bordeaux,
    maison-familiale-merignac, cuisine-chaleureuse-pessac, + 3 autres. JSON-LD `ItemPage`.
  - `/a-propos` — bio réelle, portrait, valeurs, CTA.
  - `/blog` — archi SEO prête, liste d'articles.
  - `/contact` — formulaire complet (même composant que homepage).
  - `/mentions-legales` et `/confidentialite` — pages légales statiques.
- Composants partagés créés : `PageHero`, `Breadcrumbs`, `RealisationsGallery`.
- Métadonnées `generateMetadata` + JSON-LD par page sur toutes les routes.
- Câblage conditionnel de l'image hero dans `src/app/page.tsx` (`assetExists`).
- **Vérif build OK :** 24 pages pré-rendues (○ statiques + ● SSG), 0 erreur TypeScript.
- **Vérif anti-404 :** tous les liens de nav, footer et hero résolvent vers une `page.tsx`
  existante — aucune route manquante.

### 2026-07-11 — Sous-projet A terminé : lecture MongoDB (avis + réalisations) + ISR

**Périmètre :** connexion MongoDB Atlas en lecture seule pour alimenter les sections
dynamiques du site — sans dashboard ni authentification (sous-projets B→D à venir).

- **Client MongoDB (`lib/mongodb/client.ts`)** : singleton `MongoClient` avec
  `serverSelectionTimeoutMS: 3000`. Un seul appel `connect()` réutilisé entre
  les Server Components.
- **Repositories résilients (`lib/mongodb/realisations.ts`, `lib/mongodb/testimonials.ts`)** :
  `getAllRealisations()` et `getAllTestimonials()` capturent toute erreur (Atlas
  injoignable, timeout, collection absente) et retournent un tableau vide — le
  build reste vert même sans base accessible.
- **Page `/realisations` (`app/realisations/page.tsx`)** : lit la base avec
  `getAllRealisations()` ; si le résultat est vide, affiche un message d'attente
  au lieu d'une grille vide. `generateStaticParams` appelle le même repo : zéro
  slug pré-rendu si la base est vide. `dynamicParams = false` bloque les slugs
  inconnus.
- **Section `TestimonialsSection`** : lit `getAllTestimonials()` côté serveur ;
  si la liste est vide, la section est masquée (`null`) — pas de bloc vide visible.
- **Suppression des données fictives** : `lib/realisations.ts` et
  `lib/testimonials.ts` (données hardcodées) retirés du code de production ;
  toutes les importations mises à jour pour pointer vers les repositories Mongo.
- **ISR (`src/app/page.tsx`)** : `export const revalidate = 60` ajouté sur
  l'accueil — le cache Next.js est invalidé toutes les 60 s, ce qui reflète
  les nouveaux avis/réalisations ajoutés en base sans redéploiement.
- **Build final** : 18 routes, `typecheck` 0 erreur. `/` et `/realisations`
  affichent `Revalidate: 1m` dans la table des routes. Aucune route
  `/realisations/[slug]` pré-rendue (base vide → build résilient = attendu).

**Prochain sous-projet :** dashboard d'administration (authentification,
CRUD réalisations et avis, upload photos) = sous-projets B→D.

## Prochaine action à la reprise
1. Étape 7 — Intro Three.js (R3F + Drei) légère : installer `three`,
   `@react-three/fiber@^9`, `@react-three/drei@^10` (isolé), scène minimaliste
   (pièce/lumière), dynamic import + fallback, coupée en reduced-motion.
2. Étape 9 — SEO : `app/sitemap.ts`, `app/robots.ts`, `opengraph-image`,
   JSON-LD par page + breadcrumb, favicons.
3. Étape 10 — Vérifs finales : Lighthouse (100 visé), axe a11y, responsive.
- Rappel : npm/next **via PowerShell** avec `NODE_EXTRA_CA_CERTS` (persisté).
- Assets à fournir par la cliente : photos hero + réalisations + portrait.
