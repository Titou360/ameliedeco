# Amélie Déco — Site web premium

Site vitrine de **Amélie Megdad**, décoratrice d'intérieur à Bordeaux / Gironde.
Refonte haut de gamme (objectif Awwwards) : sobre, rapide, au service du contenu.

## Stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Framer Motion · GSAP (ScrollTrigger) · Three.js (React Three Fiber + Drei) ·
Lenis · Lucide · next/font · next/image. Déployable sur Vercel.

## Démarrage

```bash
npm install
npm run dev      # http://localhost:3000
```

Copier `.env.example` vers `.env.local` et renseigner `NEXT_PUBLIC_SITE_URL`.

## Scripts

| Script | Rôle |
|--------|------|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Serveur de production |
| `npm run lint` | ESLint (next/core-web-vitals) |
| `npm run typecheck` | Vérification TypeScript stricte |

## Architecture

```
src/
  app/          Routes App Router, layout, metadata, page.tsx
  components/   Composants UI génériques réutilisables
  sections/     Sections de page (Hero, Réalisations, …)
  animations/   Wrappers d'animation (GSAP / Framer Motion)
  hooks/        Hooks React (smooth scroll, reduced-motion, …)
  lib/          Config du site, données, helpers métier
  utils/        Fonctions utilitaires pures
  types/        Types partagés
  styles/       globals.css (design tokens Tailwind v4)
public/         Assets statiques (images, og, favicons)
```

## Suivi du projet

- [`WORKLOG.md`](./WORKLOG.md) — avancement étape par étape.
- [`INSTALLATIONS.md`](./INSTALLATIONS.md) — plugins/agents Claude Code & dépendances.
