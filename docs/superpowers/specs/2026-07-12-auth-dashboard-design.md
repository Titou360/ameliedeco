# Sous-projet B — Auth complète + coquille dashboard (Amélie Déco)

> Design validé le 2026-07-12. **Deuxième des 4 sous-projets** du chantier
> « MongoDB + dashboard privé » (voir `ameliedeco-roadmap-dashboard`).
> A (lecture publique) est fait. B = **auth + coquille `/admin`**.
> C (CRUD) et D (upload) suivront.

## Objectif

Authentification complète pour 2 comptes admin (Amélie + Clément, mêmes droits),
avec **réinitialisation autonome du mot de passe par email**, une zone `/admin`
protégée (coquille), et l'**envoi d'emails via Brevo** (reset + confirmation +
formulaire de contact).

## Décisions (validées)

- **Auth : Auth.js v5** (`next-auth@beta`), provider **Credentials**, session
  **JWT** (cookie httpOnly, pas de collection sessions). Split edge-safe :
  `auth.config.ts` (middleware) + `auth.ts` (Node, bcrypt + Mongo).
- **Hachage : `bcryptjs`**, coût 12.
- **Emails : Brevo** (API transactionnelle via un wrapper `fetch`).
- **2 comptes, pas de rôles** : Amélie (login `Amelie.megdad@gmail.com`) et
  `clement@nemosolutions.fr`, droits identiques.
- **Mots de passe initiaux** : script de seed lisant l'environnement (jamais en
  dur), exécuté une fois.
- **Formulaire de contact** : câblé sur Brevo dans ce sous-projet.
- **Politique mot de passe fort** (checklist visuelle en direct + validation
  serveur) : ≥ 12 caractères, ≥ 1 majuscule, ≥ 1 minuscule, ≥ 1 chiffre,
  ≥ 1 caractère spécial, et **les 2 saisies identiques**.

## Modèle de données (MongoDB)

- **`users`** : `{ _id, email (unique, lowercase), passwordHash, name,
  createdAt, updatedAt }`. Aucun champ rôle.
- **`password_reset_tokens`** : `{ _id, userId, tokenHash, expiresAt, usedAt? }`.
  Le token brut n'est jamais stocké (hash SHA-256). **Usage unique**,
  **expiration 1 h**.

## Architecture & fichiers

**Auth (racine / Node & edge) :**
- `auth.config.ts` — config Auth.js edge-safe : `pages.signIn = '/login'`,
  callback `authorized` (protège l'accès), callbacks `jwt`/`session`. Aucun
  import bcrypt/mongo.
- `auth.ts` — instancie Auth.js avec le provider Credentials (`authorize` :
  cherche l'utilisateur, vérifie bcrypt). Exporte `handlers`, `auth`, `signIn`,
  `signOut`. Runtime Node.
- `middleware.ts` — applique `auth.config` pour protéger `/admin/*` et rediriger
  les connectés hors `/login`.
- `src/app/api/auth/[...nextauth]/route.ts` — `export { GET, POST } = handlers`.

**Domaine :**
- `src/lib/auth/users.ts` — repo Mongo : `getUserByEmail`, `getUserById`,
  `updateUserPassword`. (Réutilise `getDb` du sous-projet A.)
- `src/lib/auth/password.ts` — `hashPassword`, `verifyPassword` (bcryptjs) +
  `validatePasswordPolicy(pw): { ok, checks }` (règles ci-dessus, réutilisée
  client + serveur).
- `src/lib/auth/reset-tokens.ts` — `createResetToken(userId)` (renvoie le token
  brut + stocke le hash+expiration), `consumeResetToken(uid, rawToken)` (valide,
  marque `usedAt`, renvoie userId ou null).
- `src/lib/email/brevo.ts` — `sendEmail({ to, subject, html })` via l'API Brevo
  (`BREVO_API_KEY`, `BREVO_SENDER`). Échec journalisé, renvoie un booléen.
- `src/lib/email/templates.ts` — HTML sobre (marque) : `resetLinkEmail(url)`,
  `passwordChangedEmail()`, `contactEmail(payload)`.

**Pages & routes :**
- `src/app/(auth)/login/page.tsx` — formulaire login (email + mot de passe),
  `signIn('credentials')`.
- `src/app/(auth)/mot-de-passe-oublie/page.tsx` — saisie email → `POST
  /api/password/forgot`.
- `src/app/(auth)/reinitialiser/page.tsx` — nouveau mot de passe ×2 avec
  **checklist en direct** (composant `PasswordStrength`) → `POST
  /api/password/reset`.
- `src/components/auth/PasswordStrength.tsx` — checklist visuelle (client) basée
  sur `validatePasswordPolicy`, + indicateur d'égalité des 2 saisies.
- `src/app/api/password/forgot/route.ts` — génère le token, envoie l'email de
  lien via Brevo. **Réponse toujours générique** (anti-énumération). Rate-limit
  best-effort (mémoire).
- `src/app/api/password/reset/route.ts` — valide le token + la politique,
  met à jour le hash, invalide le token, envoie l'email de confirmation.
- `src/app/admin/layout.tsx` — coquille protégée (en-tête, nav placeholder,
  bouton déconnexion via `signOut`).
- `src/app/admin/page.tsx` — accueil « Bienvenue » (le CRUD = sous-projet C).
- `scripts/seed-users.ts` — upsert des 2 comptes depuis `SEED_AMELIE_PASSWORD` /
  `SEED_CLEMENT_PASSWORD` (hachés). Idempotent.

**Modifié :**
- `src/app/api/contact/route.ts` — envoi de l'email de contact via
  `lib/email/brevo` (le TODO existant est résolu).

## Flux « mot de passe oublié »

1. `/mot-de-passe-oublie` : email → `POST /api/password/forgot`.
2. Serveur : si l'utilisateur existe, `createResetToken` + `sendEmail` (lien
   `${SITE_URL}/reinitialiser?uid=<id>&token=<raw>`). **Réponse identique quoi
   qu'il arrive** : « Si un compte existe, un email a été envoyé. »
3. `/reinitialiser?uid&token` : mot de passe ×2 (checklist verte requise) →
   `POST /api/password/reset` avec `{ uid, token, password }`.
4. Serveur : `consumeResetToken` (non expiré, non utilisé) + `validatePasswordPolicy`
   → `updateUserPassword` → `sendEmail` de confirmation. Puis redirection
   `/login` avec message succès.

## Sécurité

Bcrypt coût 12 ; réponses génériques (anti-énumération) sur forgot ; token reset
hashé (SHA-256), usage unique, expiration 1 h ; politique mot de passe forte
appliquée **serveur** (pas seulement client) ; `AUTH_SECRET` fort ; cookies
httpOnly/secure/SameSite ; rate-limit best-effort sur `/api/password/forgot`.
Pas de 2FA (YAGNI). Les messages de login restent génériques (« identifiants
invalides »).

## Variables d'environnement

Nouvelles (`.env.local`, non versionnées ; documentées sans secret dans
`.env.example`) :
- `AUTH_SECRET` — secret Auth.js (généré, ex. `openssl rand -base64 32`).
- `BREVO_API_KEY`, `BREVO_SENDER` (expéditeur vérifié).
- `SEED_AMELIE_PASSWORD`, `SEED_CLEMENT_PASSWORD` — mots de passe initiaux (seed).
- Réutilise `NEXT_PUBLIC_SITE_URL` (base des liens de reset) et `MONGODB_URI`/
  `MONGODB_DB` (déjà présents).

## Vérification

- `npm run typecheck` + `npm run lint` + `npm run build` (via PowerShell, CA cert)
  — verts. Le middleware et l'auth ne doivent pas casser le build.
- Tests manuels (Brevo + seed configurés) : login OK / mauvais identifiants
  rejetés ; `/admin` inaccessible sans session ; forgot → email de lien →
  reinitialiser (checklist) → email de confirmation → login avec le nouveau mot
  de passe ; formulaire de contact → email reçu.

## Hors périmètre (sous-projets suivants)

- **C** : CRUD dashboard (avis, réalisations, articles) + revalidation à la
  sauvegarde (`revalidatePath`). **D** : upload d'images.
- Gestion d'utilisateurs via UI (ajout/suppression de comptes) : non requis
  (2 comptes seedés suffisent).

## Notes d'exécution

- Auth.js v5 : le **middleware tourne sur Edge** → il n'importe QUE `auth.config`
  (aucun bcrypt/mongo). `authorize` (bcrypt+mongo) reste dans `auth.ts` (Node).
- Brevo : compte + expéditeur vérifié + clé API à créer (voir guide). Sans ces
  valeurs, l'envoi échoue proprement (journalisé) sans casser le rendu.
- ⚠️ Le mot de passe MongoDB reste à faire tourner (transmis en clair).
