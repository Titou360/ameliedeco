# Sous-projet B — Auth + coquille dashboard : Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Authentification complète (2 comptes admin, login + reset autonome par email Brevo) + zone `/admin` protégée (coquille), et formulaire de contact fonctionnel.

**Architecture:** Auth.js v5 (Credentials, JWT) avec split edge-safe (`auth.config.ts` pour le middleware, `auth.ts` pour bcrypt+Mongo). Utilisateurs et jetons de reset dans MongoDB (via `getDb` existant). Emails transactionnels via un wrapper `fetch` sur l'API Brevo. Le header/footer marketing sont masqués sur `/admin` et les pages d'auth via un composant `SiteChrome`.

**Tech Stack:** Next.js 15 (App Router, middleware, route groups), React 19, TypeScript strict, `next-auth@beta` (v5), `bcryptjs`, MongoDB, Brevo API, `tsx` (script de seed).

## Global Constraints

- **Vérification (pas de tests unitaires)** : chaque tâche = `npm run typecheck` (0) + `npm run lint` (0) + contrôle ciblé. `npm run build` aux jalons (Tasks 4, 6, 7). Ne PAS ajouter de framework de test.
- **npm/next via PowerShell** avec `$env:NODE_EXTRA_CA_CERTS = "c:\Projets Web\ameliedeco\ameliedeco-www\system-ca.pem"`. Ne pas supprimer `.next` (si erreur transitoire `/_document` ou `/_not-found`, relancer le build ; si ça persiste, purger `.next` PUIS rebuild avec le CA cert).
- **Auth.js v5 edge/Node split** : le **middleware** n'importe QUE `auth.config` (aucun `bcryptjs`/`mongodb`). `authorize` (bcrypt+Mongo) vit dans `auth.ts` (Node).
- **Sécurité** : bcrypt coût **12** ; réponses **génériques** sur `/api/password/forgot` (anti-énumération) ; token reset **haché SHA-256, usage unique, expiration 1 h** ; **politique mot de passe forte appliquée serveur** (pas seulement client) ; `AUTH_SECRET` fort ; `trustHost: true`.
- **Politique mot de passe** : ≥ **12** caractères, ≥ 1 majuscule, ≥ 1 minuscule, ≥ 1 chiffre, ≥ 1 caractère spécial, et les 2 saisies identiques. La logique pure vit dans `password-policy.ts` (importable côté client) — **jamais** importer `bcryptjs`/le repo depuis un composant client.
- **Comptes** : `amelie.megdad@gmail.com` (Amélie Megdad) et `clement@nemosolutions.fr` (Clément), **mêmes droits, pas de rôle**. Emails stockés/loookupés en **lowercase**.
- **Secrets** : uniquement dans `.env.local` (git-ignoré). `.env.example` documente les noms sans valeur.
- TypeScript strict (pas de `any`), aucune emoji dans l'UI (icônes lucide), tokens de marque (exception admise : `text-green-700`/`text-red-700` pour les retours de validation, comme l'existant). reduced-motion via l'existant.
- Commits terminés par : `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>`

---

## File Structure

**Créés :**
- `src/auth.config.ts` — config Auth.js edge-safe (pages, `authorized`, `trustHost`).
- `src/auth.ts` — instance NextAuth (Credentials + bcrypt/Mongo) → `handlers`, `auth`, `signIn`, `signOut`.
- `src/middleware.ts` — protège `/admin/*`, bloque `/login` si connecté.
- `src/app/api/auth/[...nextauth]/route.ts` — handlers Auth.js.
- `src/lib/auth/password-policy.ts` — `checkPassword`, `isPasswordValid` (pur).
- `src/lib/auth/password.ts` — `hashPassword`, `verifyPassword` (bcryptjs, serveur).
- `src/lib/auth/users.ts` — repo `users` (getByEmail/getById/updatePassword).
- `src/lib/auth/reset-tokens.ts` — repo `password_reset_tokens` (create/consume).
- `src/lib/email/brevo.ts` — `sendEmail()`.
- `src/lib/email/templates.ts` — `resetLinkEmail`, `passwordChangedEmail`, `contactEmail`.
- `src/components/auth/PasswordStrength.tsx` — checklist client.
- `src/components/layout/SiteChrome.tsx` — masque header/footer sur admin/auth.
- `src/app/(auth)/login/page.tsx`, `src/app/(auth)/mot-de-passe-oublie/page.tsx`, `src/app/(auth)/reinitialiser/page.tsx`.
- `src/app/api/password/forgot/route.ts`, `src/app/api/password/reset/route.ts`.
- `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`.
- `scripts/seed-users.ts`.

**Modifiés :**
- `src/app/layout.tsx` — envelopper header/footer dans `SiteChrome`.
- `src/app/api/contact/route.ts` — envoi via Brevo.
- `.env.example`, `package.json` (deps + script `seed`).

---

## Task 1 : Dépendances, env, politique + hachage mot de passe

**Files:**
- Create: `src/lib/auth/password-policy.ts`, `src/lib/auth/password.ts`
- Modify: `package.json` (deps), `.env.example`

**Interfaces:**
- Produces: `checkPassword(pw): PasswordChecks`, `isPasswordValid(pw): boolean` (policy) ; `hashPassword(pw): Promise<string>`, `verifyPassword(pw, hash): Promise<boolean>` (bcrypt).

- [ ] **Step 1 : Installer les dépendances** (PowerShell + CA cert)

```
$env:NODE_EXTRA_CA_CERTS = "c:\Projets Web\ameliedeco\ameliedeco-www\system-ca.pem"
npm install next-auth@beta bcryptjs
npm install -D @types/bcryptjs tsx
```

- [ ] **Step 2 : `src/lib/auth/password-policy.ts`** (pur, client+serveur)

```ts
/** Règles de robustesse du mot de passe (partagées client + serveur). */
export interface PasswordChecks {
  length: boolean;
  upper: boolean;
  lower: boolean;
  digit: boolean;
  special: boolean;
}

export function checkPassword(pw: string): PasswordChecks {
  return {
    length: pw.length >= 12,
    upper: /[A-Z]/.test(pw),
    lower: /[a-z]/.test(pw),
    digit: /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw),
  };
}

export function isPasswordValid(pw: string): boolean {
  const c = checkPassword(pw);
  return c.length && c.upper && c.lower && c.digit && c.special;
}
```

- [ ] **Step 3 : `src/lib/auth/password.ts`** (serveur, bcryptjs)

```ts
import bcrypt from 'bcryptjs';

/** Hachage bcrypt (coût 12). Server-only. */
export async function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, 12);
}

export async function verifyPassword(pw: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pw, hash);
}
```

- [ ] **Step 4 : `.env.example`** — ajouter (sans valeurs) après les variables MongoDB :

```
# Auth.js (secret fort : openssl rand -base64 32)
AUTH_SECRET=
# Brevo (email transactionnel) — expéditeur = adresse vérifiée dans Brevo
BREVO_API_KEY=
BREVO_SENDER=
# Mots de passe initiaux des comptes admin (script de seed, à usage unique)
SEED_AMELIE_PASSWORD=
SEED_CLEMENT_PASSWORD=
```

- [ ] **Step 5 : `package.json`** — ajouter le script de seed dans `"scripts"` :

```json
"seed": "tsx --env-file=.env.local scripts/seed-users.ts"
```

- [ ] **Step 6 : `.env.local`** — ajouter une valeur `AUTH_SECRET` (générer : PowerShell `[Convert]::ToBase64String((1..32|%{Get-Random -Max 256}))` ou `openssl rand -base64 32`). Laisser les autres vars vides pour l'instant (Brevo/seed non requis pour le build). Ne PAS committer `.env.local`.

- [ ] **Step 7 : Vérifier** — `npm run typecheck` → 0 erreur.

- [ ] **Step 8 : Commit**

```bash
git add package.json package-lock.json .env.example src/lib/auth/password-policy.ts src/lib/auth/password.ts
git commit -m "feat(auth): deps (next-auth v5, bcryptjs, tsx) + politique/hachage mot de passe

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2 : Repos users + reset-tokens

**Files:**
- Create: `src/lib/auth/users.ts`, `src/lib/auth/reset-tokens.ts`

**Interfaces:**
- Consumes: `getDb` (`@/lib/db/mongodb`).
- Produces:
  - `interface AppUser { id, email, name, passwordHash }`
  - `getUserByEmail(email): Promise<AppUser | null>`, `getUserById(id): Promise<AppUser | null>`, `updateUserPassword(id, passwordHash): Promise<void>`
  - `createResetToken(userId): Promise<string>` (renvoie le token brut), `consumeResetToken(userId, rawToken): Promise<boolean>`

- [ ] **Step 1 : `src/lib/auth/users.ts`**

```ts
import { ObjectId, type Document } from 'mongodb';
import { getDb } from '@/lib/db/mongodb';

export interface AppUser {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
}

function toUser(d: Document): AppUser {
  return { id: d._id.toString(), email: d.email, name: d.name, passwordHash: d.passwordHash };
}

export async function getUserByEmail(email: string): Promise<AppUser | null> {
  const db = await getDb();
  const doc = await db.collection('users').findOne({ email: email.toLowerCase() });
  return doc ? toUser(doc) : null;
}

export async function getUserById(id: string): Promise<AppUser | null> {
  if (!ObjectId.isValid(id)) return null;
  const db = await getDb();
  const doc = await db.collection('users').findOne({ _id: new ObjectId(id) });
  return doc ? toUser(doc) : null;
}

export async function updateUserPassword(id: string, passwordHash: string): Promise<void> {
  const db = await getDb();
  await db.collection('users').updateOne(
    { _id: new ObjectId(id) },
    { $set: { passwordHash, updatedAt: new Date() } },
  );
}
```

- [ ] **Step 2 : `src/lib/auth/reset-tokens.ts`**

```ts
import { createHash, randomBytes } from 'node:crypto';
import { getDb } from '@/lib/db/mongodb';

const TTL_MS = 60 * 60 * 1000; // 1 heure

function hashToken(raw: string): string {
  return createHash('sha256').update(raw).digest('hex');
}

/** Crée un jeton de reset (stocke son hash + expiration), renvoie le jeton BRUT. */
export async function createResetToken(userId: string): Promise<string> {
  const raw = randomBytes(32).toString('hex');
  const db = await getDb();
  await db.collection('password_reset_tokens').insertOne({
    userId,
    tokenHash: hashToken(raw),
    expiresAt: new Date(Date.now() + TTL_MS),
    createdAt: new Date(),
  });
  return raw;
}

/** Valide un jeton (non expiré, non utilisé) et le consomme (usage unique). */
export async function consumeResetToken(userId: string, rawToken: string): Promise<boolean> {
  const db = await getDb();
  const coll = db.collection('password_reset_tokens');
  const doc = await coll.findOne({
    userId,
    tokenHash: hashToken(rawToken),
    usedAt: { $exists: false },
    expiresAt: { $gt: new Date() },
  });
  if (!doc) return false;
  await coll.updateOne({ _id: doc._id }, { $set: { usedAt: new Date() } });
  return true;
}
```

- [ ] **Step 3 : Vérifier** — `npm run typecheck` + `npm run lint` → 0 erreur.

- [ ] **Step 4 : Commit**

```bash
git add src/lib/auth/users.ts src/lib/auth/reset-tokens.ts
git commit -m "feat(auth): repos MongoDB users + jetons de reset (hachés, usage unique, TTL 1h)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3 : Emails Brevo + templates

**Files:**
- Create: `src/lib/email/brevo.ts`, `src/lib/email/templates.ts`

**Interfaces:**
- Produces: `sendEmail({ to, toName?, subject, html }): Promise<boolean>` ; `resetLinkEmail(url): string`, `passwordChangedEmail(): string`, `contactEmail(p): string`.

- [ ] **Step 1 : `src/lib/email/brevo.ts`**

```ts
interface SendArgs {
  to: string;
  toName?: string;
  subject: string;
  html: string;
}

/**
 * Envoi d'un email transactionnel via l'API Brevo. Renvoie `false` (sans lever)
 * si la config est absente ou si l'API échoue — l'appelant décide de la suite.
 */
export async function sendEmail({ to, toName, subject, html }: SendArgs): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  const sender = process.env.BREVO_SENDER;
  if (!apiKey || !sender) {
    console.error('[email] BREVO_API_KEY/BREVO_SENDER manquant — email non envoyé.');
    return false;
  }
  try {
    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: { email: sender, name: 'Amélie Déco' },
        to: [{ email: to, ...(toName ? { name: toName } : {}) }],
        subject,
        htmlContent: html,
      }),
    });
    if (!res.ok) {
      console.error('[email] Brevo a répondu', res.status, await res.text().catch(() => ''));
      return false;
    }
    return true;
  } catch (err) {
    console.error('[email] envoi Brevo échoué :', err);
    return false;
  }
}
```

- [ ] **Step 2 : `src/lib/email/templates.ts`**

```ts
const wrap = (title: string, body: string) => `
  <div style="font-family: Arial, Helvetica, sans-serif; color: #271a12; max-width: 560px; margin: 0 auto;">
    <h1 style="font-size: 20px; color: #271a12;">${title}</h1>
    ${body}
    <p style="font-size: 12px; color: #6f6455; margin-top: 32px;">Amélie Déco — Décoratrice d'intérieur</p>
  </div>`;

export function resetLinkEmail(url: string): string {
  return wrap(
    'Réinitialisation de votre mot de passe',
    `<p>Vous avez demandé à réinitialiser votre mot de passe. Ce lien est valable 1 heure et à usage unique :</p>
     <p><a href="${url}" style="color: #304254;">Choisir un nouveau mot de passe</a></p>
     <p style="font-size: 13px; color: #6f6455;">Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>`,
  );
}

export function passwordChangedEmail(): string {
  return wrap(
    'Votre mot de passe a bien été modifié',
    `<p>Votre mot de passe vient d'être modifié avec succès.</p>
     <p style="font-size: 13px; color: #6f6455;">Si vous n'êtes pas à l'origine de ce changement, contactez-nous immédiatement.</p>`,
  );
}

export function contactEmail(p: {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}): string {
  return wrap(
    'Nouveau message depuis le site',
    `<p><strong>Nom :</strong> ${p.name}</p>
     <p><strong>Email :</strong> ${p.email}</p>
     ${p.phone ? `<p><strong>Téléphone :</strong> ${p.phone}</p>` : ''}
     ${p.subject ? `<p><strong>Sujet :</strong> ${p.subject}</p>` : ''}
     <p><strong>Message :</strong></p>
     <p style="white-space: pre-wrap;">${p.message}</p>`,
  );
}
```

- [ ] **Step 3 : Vérifier** — `npm run typecheck` + `npm run lint` → 0 erreur.

- [ ] **Step 4 : Commit**

```bash
git add src/lib/email/brevo.ts src/lib/email/templates.ts
git commit -m "feat(email): wrapper Brevo + templates (reset, confirmation, contact)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4 : Cœur Auth.js (config, middleware, route, login)

**Files:**
- Create: `src/auth.config.ts`, `src/auth.ts`, `src/middleware.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/app/(auth)/login/page.tsx`

**Interfaces:**
- Consumes: `getUserByEmail` (Task 2), `verifyPassword` (Task 1).
- Produces: `handlers`, `auth`, `signIn`, `signOut` (depuis `@/auth`) ; `authConfig` (depuis `@/auth.config`).

- [ ] **Step 1 : `src/auth.config.ts`** (edge-safe — aucun import bcrypt/mongo)

```ts
import type { NextAuthConfig } from 'next-auth';

/**
 * Config Auth.js edge-safe, utilisée par le middleware. Ne contient AUCUN
 * accès base/bcrypt (le provider Credentials est ajouté dans auth.ts, Node).
 */
export const authConfig = {
  trustHost: true,
  pages: { signIn: '/login' },
  session: { strategy: 'jwt' },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAdmin = nextUrl.pathname.startsWith('/admin');
      const isOnLogin = nextUrl.pathname === '/login';
      if (isOnAdmin) return isLoggedIn;
      if (isOnLogin && isLoggedIn) return Response.redirect(new URL('/admin', nextUrl));
      return true;
    },
  },
} satisfies NextAuthConfig;
```

- [ ] **Step 2 : `src/auth.ts`** (Node — provider Credentials)

```ts
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from '@/auth.config';
import { getUserByEmail } from '@/lib/auth/users';
import { verifyPassword } from '@/lib/auth/password';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const email = String(credentials?.email ?? '').toLowerCase().trim();
        const password = String(credentials?.password ?? '');
        if (!email || !password) return null;
        try {
          const user = await getUserByEmail(email);
          if (!user) return null;
          const ok = await verifyPassword(password, user.passwordHash);
          if (!ok) return null;
          return { id: user.id, email: user.email, name: user.name };
        } catch (err) {
          console.error('[auth] authorize a échoué :', err);
          return null;
        }
      },
    }),
  ],
});
```

- [ ] **Step 3 : `src/middleware.ts`**

```ts
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  // Protège l'admin et intercepte /login ; ignore assets/_next.
  matcher: ['/admin/:path*', '/login'],
};
```

- [ ] **Step 4 : `src/app/api/auth/[...nextauth]/route.ts`**

```ts
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
```

- [ ] **Step 5 : `src/app/(auth)/login/page.tsx`** (client)

```tsx
'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

const fieldClasses =
  'w-full rounded-md border border-border bg-surface px-4 py-3 font-sans text-sm text-foreground ' +
  'placeholder:text-muted/70 transition-colors focus:border-accent';

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const res = await signIn('credentials', {
      email: String(form.get('email') ?? ''),
      password: String(form.get('password') ?? ''),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError('Identifiants invalides.');
      return;
    }
    router.push('/admin');
    router.refresh();
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-sand-50 px-6 py-24">
      <Container size="narrow" className="max-w-md">
        <div className="rounded-xl border border-border bg-background p-8">
          <h1 className="font-display text-3xl">Administration</h1>
          <p className="mt-2 font-sans text-sm text-muted">Connectez-vous pour accéder au tableau de bord.</p>
          <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block font-sans text-sm text-foreground">E-mail</label>
              <input id="email" name="email" type="email" required autoComplete="email" className={fieldClasses} />
            </div>
            <div>
              <label htmlFor="password" className="mb-2 block font-sans text-sm text-foreground">Mot de passe</label>
              <input id="password" name="password" type="password" required autoComplete="current-password" className={fieldClasses} />
            </div>
            {error && <p role="alert" className="font-sans text-sm text-red-700">{error}</p>}
            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              {loading ? 'Connexion…' : 'Se connecter'}
            </Button>
          </form>
          <p className="mt-6 font-sans text-sm text-muted">
            <Link href="/mot-de-passe-oublie" className="text-foreground underline hover:text-accent">
              Mot de passe oublié ?
            </Link>
          </p>
        </div>
      </Container>
    </div>
  );
}
```

- [ ] **Step 6 : Vérifier** — `npm run typecheck` + `npm run lint` → 0 erreur. **Build milestone** (PowerShell + CA cert + `AUTH_SECRET` présent dans `.env.local`) : `npm run build` réussit (le middleware compile ; `/login` rend).

- [ ] **Step 7 : Commit**

```bash
git add src/auth.config.ts src/auth.ts src/middleware.ts "src/app/api/auth/[...nextauth]/route.ts" "src/app/(auth)/login/page.tsx"
git commit -m "feat(auth): Auth.js v5 (Credentials, JWT) + middleware + page login

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5 : Flux mot de passe oublié (routes + pages + checklist)

**Files:**
- Create: `src/components/auth/PasswordStrength.tsx`, `src/app/(auth)/mot-de-passe-oublie/page.tsx`, `src/app/(auth)/reinitialiser/page.tsx`, `src/app/api/password/forgot/route.ts`, `src/app/api/password/reset/route.ts`

**Interfaces:**
- Consumes: `getUserByEmail`, `getUserById`, `updateUserPassword`, `createResetToken`, `consumeResetToken`, `hashPassword`, `isPasswordValid`, `checkPassword`, `sendEmail`, `resetLinkEmail`, `passwordChangedEmail`.

- [ ] **Step 1 : `src/app/api/password/forgot/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/auth/users';
import { createResetToken } from '@/lib/auth/reset-tokens';
import { sendEmail } from '@/lib/email/brevo';
import { resetLinkEmail } from '@/lib/email/templates';

const GENERIC = {
  ok: true,
  message: 'Si un compte existe pour cette adresse, un email de réinitialisation a été envoyé.',
};

// Rate-limit best-effort en mémoire (par email) : max 3 / 15 min.
const hits = new Map<string, number[]>();
function limited(key: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000;
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  return arr.length > 3;
}

export async function POST(request: Request) {
  let email = '';
  try {
    const body = (await request.json()) as { email?: string };
    email = String(body.email ?? '').toLowerCase().trim();
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }
  if (!email || limited(email)) return NextResponse.json(GENERIC);

  try {
    const user = await getUserByEmail(email);
    if (user) {
      const token = await createResetToken(user.id);
      const base = process.env.NEXT_PUBLIC_SITE_URL ?? '';
      const url = `${base}/reinitialiser?uid=${user.id}&token=${token}`;
      await sendEmail({
        to: user.email,
        toName: user.name,
        subject: 'Réinitialisation de votre mot de passe',
        html: resetLinkEmail(url),
      });
    }
  } catch (err) {
    console.error('[forgot] échec :', err);
  }
  return NextResponse.json(GENERIC);
}
```

- [ ] **Step 2 : `src/app/api/password/reset/route.ts`**

```ts
import { NextResponse } from 'next/server';
import { getUserById, updateUserPassword } from '@/lib/auth/users';
import { consumeResetToken } from '@/lib/auth/reset-tokens';
import { hashPassword } from '@/lib/auth/password';
import { isPasswordValid } from '@/lib/auth/password-policy';
import { sendEmail } from '@/lib/email/brevo';
import { passwordChangedEmail } from '@/lib/email/templates';

export async function POST(request: Request) {
  let uid = '';
  let token = '';
  let password = '';
  try {
    const body = (await request.json()) as { uid?: string; token?: string; password?: string };
    uid = String(body.uid ?? '');
    token = String(body.token ?? '');
    password = String(body.password ?? '');
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  if (!uid || !token) return NextResponse.json({ error: 'Lien invalide.' }, { status: 400 });
  if (!isPasswordValid(password))
    return NextResponse.json({ error: 'Le mot de passe ne respecte pas les critères.' }, { status: 422 });

  const ok = await consumeResetToken(uid, token);
  if (!ok)
    return NextResponse.json(
      { error: 'Lien expiré ou déjà utilisé. Merci de refaire une demande.' },
      { status: 400 },
    );

  const user = await getUserById(uid);
  if (!user) return NextResponse.json({ error: 'Compte introuvable.' }, { status: 400 });

  await updateUserPassword(uid, await hashPassword(password));
  await sendEmail({
    to: user.email,
    toName: user.name,
    subject: 'Votre mot de passe a été modifié',
    html: passwordChangedEmail(),
  });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3 : `src/components/auth/PasswordStrength.tsx`** (client)

```tsx
'use client';

import { Check, X } from 'lucide-react';
import { checkPassword } from '@/lib/auth/password-policy';
import { cn } from '@/utils/cn';

const RULES = [
  { key: 'length', label: 'Au moins 12 caractères' },
  { key: 'upper', label: 'Une lettre majuscule' },
  { key: 'lower', label: 'Une lettre minuscule' },
  { key: 'digit', label: 'Un chiffre' },
  { key: 'special', label: 'Un caractère spécial (!@#$…)' },
] as const;

/** Checklist en direct de la robustesse du mot de passe + égalité des saisies. */
export function PasswordStrength({ password, confirm }: { password: string; confirm: string }) {
  const checks = checkPassword(password);
  const match = password.length > 0 && password === confirm;

  const Item = ({ ok, label }: { ok: boolean; label: string }) => (
    <li className={cn('flex items-center gap-2 font-sans text-sm', ok ? 'text-green-700' : 'text-muted')}>
      {ok ? <Check size={16} strokeWidth={2} aria-hidden="true" /> : <X size={16} strokeWidth={2} aria-hidden="true" />}
      {label}
    </li>
  );

  return (
    <ul aria-live="polite" className="mt-3 space-y-1.5">
      {RULES.map((r) => <Item key={r.key} ok={checks[r.key]} label={r.label} />)}
      <Item ok={match} label="Les deux mots de passe sont identiques" />
    </ul>
  );
}
```

- [ ] **Step 4 : `src/app/(auth)/mot-de-passe-oublie/page.tsx`** (client)

```tsx
'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

const fieldClasses =
  'w-full rounded-md border border-border bg-surface px-4 py-3 font-sans text-sm text-foreground ' +
  'placeholder:text-muted/70 transition-colors focus:border-accent';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    const form = new FormData(event.currentTarget);
    const res = await fetch('/api/password/forgot', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: String(form.get('email') ?? '') }),
    });
    const body = (await res.json().catch(() => ({}))) as { message?: string };
    setMessage(body.message ?? 'Si un compte existe, un email a été envoyé.');
    setSent(true);
    setLoading(false);
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-sand-50 px-6 py-24">
      <Container size="narrow" className="max-w-md">
        <div className="rounded-xl border border-border bg-background p-8">
          <h1 className="font-display text-3xl">Mot de passe oublié</h1>
          {sent ? (
            <p className="mt-4 font-sans text-sm text-foreground">{message}</p>
          ) : (
            <>
              <p className="mt-2 font-sans text-sm text-muted">
                Renseignez votre e-mail : vous recevrez un lien pour choisir un nouveau mot de passe.
              </p>
              <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
                <div>
                  <label htmlFor="email" className="mb-2 block font-sans text-sm text-foreground">E-mail</label>
                  <input id="email" name="email" type="email" required autoComplete="email" className={fieldClasses} />
                </div>
                <Button type="submit" size="lg" className="w-full" disabled={loading}>
                  {loading ? 'Envoi…' : 'Envoyer le lien'}
                </Button>
              </form>
            </>
          )}
          <p className="mt-6 font-sans text-sm text-muted">
            <Link href="/login" className="text-foreground underline hover:text-accent">Retour à la connexion</Link>
          </p>
        </div>
      </Container>
    </div>
  );
}
```

- [ ] **Step 5 : `src/app/(auth)/reinitialiser/page.tsx`** (client, `useSearchParams` sous Suspense)

```tsx
'use client';

import { Suspense, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { PasswordStrength } from '@/components/auth/PasswordStrength';
import { isPasswordValid } from '@/lib/auth/password-policy';

const fieldClasses =
  'w-full rounded-md border border-border bg-surface px-4 py-3 font-sans text-sm text-foreground ' +
  'placeholder:text-muted/70 transition-colors focus:border-accent';

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const uid = params.get('uid') ?? '';
  const token = params.get('token') ?? '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const ready = isPasswordValid(password) && password === confirm;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!ready) return;
    setError('');
    setLoading(true);
    const res = await fetch('/api/password/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, token, password }),
    });
    setLoading(false);
    if (res.ok) {
      router.push('/login?reset=1');
      return;
    }
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    setError(body.error ?? 'Une erreur est survenue.');
  }

  if (!uid || !token) {
    return <p className="mt-4 font-sans text-sm text-red-700">Lien invalide ou incomplet.</p>;
  }

  return (
    <form onSubmit={onSubmit} noValidate className="mt-8 space-y-5">
      <div>
        <label htmlFor="password" className="mb-2 block font-sans text-sm text-foreground">Nouveau mot de passe</label>
        <input id="password" type="password" required autoComplete="new-password" className={fieldClasses}
          value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      <div>
        <label htmlFor="confirm" className="mb-2 block font-sans text-sm text-foreground">Confirmer le mot de passe</label>
        <input id="confirm" type="password" required autoComplete="new-password" className={fieldClasses}
          value={confirm} onChange={(e) => setConfirm(e.target.value)} />
      </div>
      <PasswordStrength password={password} confirm={confirm} />
      {error && <p role="alert" className="font-sans text-sm text-red-700">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={!ready || loading}>
        {loading ? 'Validation…' : 'Valider le nouveau mot de passe'}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-sand-50 px-6 py-24">
      <Container size="narrow" className="max-w-md">
        <div className="rounded-xl border border-border bg-background p-8">
          <h1 className="font-display text-3xl">Nouveau mot de passe</h1>
          <Suspense fallback={<p className="mt-4 font-sans text-sm text-muted">Chargement…</p>}>
            <ResetForm />
          </Suspense>
          <p className="mt-6 font-sans text-sm text-muted">
            <Link href="/login" className="text-foreground underline hover:text-accent">Retour à la connexion</Link>
          </p>
        </div>
      </Container>
    </div>
  );
}
```

- [ ] **Step 6 : Vérifier** — `npm run typecheck` + `npm run lint` → 0 erreur.

- [ ] **Step 7 : Commit**

```bash
git add src/components/auth/PasswordStrength.tsx "src/app/(auth)/mot-de-passe-oublie/page.tsx" "src/app/(auth)/reinitialiser/page.tsx" src/app/api/password/forgot/route.ts src/app/api/password/reset/route.ts
git commit -m "feat(auth): flux mot de passe oublié (forgot/reset + checklist + emails)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6 : Coquille dashboard + SiteChrome + seed

**Files:**
- Create: `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`, `src/components/layout/SiteChrome.tsx`, `scripts/seed-users.ts`
- Modify: `src/app/layout.tsx`

**Interfaces:**
- Consumes: `auth`, `signOut` (`@/auth`).

- [ ] **Step 1 : `src/components/layout/SiteChrome.tsx`** (client) — masque header/footer sur admin/auth

```tsx
'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

const APP_PREFIXES = ['/admin', '/login', '/mot-de-passe-oublie', '/reinitialiser'];

/**
 * Affiche le header/footer marketing SAUF sur les pages applicatives
 * (admin + parcours d'authentification), pour un rendu « app » épuré.
 */
export function SiteChrome({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const isApp = APP_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  return (
    <>
      {!isApp && header}
      {children}
      {!isApp && footer}
    </>
  );
}
```

- [ ] **Step 2 : `src/app/layout.tsx`** — envelopper header/footer dans `SiteChrome`

Remplacer le bloc `<AppProviders>…</AppProviders>` du body par :

```tsx
        <AppProviders>
          <SiteChrome header={<Header />} footer={<Footer />}>
            <main id="contenu">{children}</main>
          </SiteChrome>
        </AppProviders>
```

et ajouter l'import en haut :

```tsx
import { SiteChrome } from '@/components/layout/SiteChrome';
```

> Le `<main id="contenu">` reste **global** (fourni par le root layout, skip-link préservé) et enveloppe toutes les pages, y compris admin/auth. Pour garantir **un seul `<main>` par page**, `admin/layout.tsx` (Step 3) et les pages d'auth (Tasks 4–5) utilisent un `<div>` comme conteneur racine — jamais un second `<main>`.

- [ ] **Step 3 : `src/app/admin/layout.tsx`** (serveur, protégé)

```tsx
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth, signOut } from '@/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <div className="min-h-svh bg-sand-50">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/admin" className="font-display text-lg">Amélie Déco — Administration</Link>
          <div className="flex items-center gap-4">
            <span className="hidden font-sans text-sm text-muted sm:inline">{session.user.email}</span>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/login' });
              }}
            >
              <button
                type="submit"
                className="cursor-pointer rounded-md border border-border px-4 py-2 font-sans text-sm text-foreground transition-colors hover:bg-sand-50"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-6 py-10">{children}</div>
    </div>
  );
}
```

- [ ] **Step 4 : `src/app/admin/page.tsx`** (accueil coquille)

```tsx
import { auth } from '@/auth';

export default async function AdminHomePage() {
  const session = await auth();
  const name = session?.user?.name ?? '';

  return (
    <div>
      <h1 className="font-display text-3xl">Bienvenue{name ? `, ${name}` : ''}</h1>
      <p className="mt-4 max-w-xl font-sans text-base leading-relaxed text-muted">
        Votre tableau de bord. La gestion des avis, réalisations et articles arrivera très
        prochainement (prochaine étape).
      </p>
    </div>
  );
}
```

- [ ] **Step 5 : `scripts/seed-users.ts`**

```ts
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

const accounts = [
  { email: 'amelie.megdad@gmail.com', name: 'Amélie Megdad', pwEnv: 'SEED_AMELIE_PASSWORD' },
  { email: 'clement@nemosolutions.fr', name: 'Clément', pwEnv: 'SEED_CLEMENT_PASSWORD' },
];

async function main() {
  if (!uri || !dbName) throw new Error('MONGODB_URI / MONGODB_DB manquants (voir .env.local).');
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  for (const acc of accounts) {
    const pw = process.env[acc.pwEnv];
    if (!pw) {
      console.warn(`⚠ ${acc.pwEnv} manquant — ${acc.email} ignoré.`);
      continue;
    }
    const passwordHash = await bcrypt.hash(pw, 12);
    const now = new Date();
    await db.collection('users').updateOne(
      { email: acc.email },
      { $set: { email: acc.email, name: acc.name, passwordHash, updatedAt: now }, $setOnInsert: { createdAt: now } },
      { upsert: true },
    );
    console.log(`✔ ${acc.email} seedé.`);
  }
  await client.close();
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
```

- [ ] **Step 6 : Vérifier** — `npm run typecheck` + `npm run lint` → 0 erreur. **Build milestone** (PowerShell + CA cert) : `npm run build` réussit (routes `/admin` dynamiques ƒ, header/footer masqués sur admin/auth). Confirmer un seul `<main>` par page (root fournit `<main id="contenu">`, admin/auth utilisent `<div>`).

- [ ] **Step 7 : Commit**

```bash
git add src/app/admin/layout.tsx src/app/admin/page.tsx src/components/layout/SiteChrome.tsx scripts/seed-users.ts src/app/layout.tsx
git commit -m "feat(admin): coquille dashboard protégée + SiteChrome + script de seed

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 7 : Formulaire de contact → Brevo + build final + WORKLOG

**Files:**
- Modify: `src/app/api/contact/route.ts`, `WORKLOG.md`

**Interfaces:**
- Consumes: `sendEmail`, `contactEmail` (Task 3) ; `siteConfig` (`@/lib/site`).

- [ ] **Step 1 : `src/app/api/contact/route.ts`** — envoyer l'email via Brevo

Remplacer TOUT le contenu par :

```ts
import { NextResponse } from 'next/server';
import { siteConfig } from '@/lib/site';
import { sendEmail } from '@/lib/email/brevo';
import { contactEmail } from '@/lib/email/templates';

/**
 * Route handler du formulaire de contact : valide côté serveur puis envoie le
 * message à l'adresse d'Amélie via Brevo. Honeypot anti-spam.
 */
interface ContactPayload {
  name?: string;
  email?: string;
  phone?: string;
  subject?: string;
  message?: string;
  /** Champ piège anti-spam (doit rester vide). */
  company?: string;
}

const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function POST(request: Request) {
  let data: ContactPayload;
  try {
    data = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 });
  }

  // Honeypot : un bot remplira ce champ caché.
  if (data.company) {
    return NextResponse.json({ ok: true });
  }

  const errors: Record<string, string> = {};
  if (!data.name?.trim()) errors.name = 'Votre nom est requis.';
  if (!data.email?.trim() || !isEmail(data.email)) errors.email = 'Un e-mail valide est requis.';
  if (!data.message?.trim() || data.message.trim().length < 10)
    errors.message = 'Votre message doit contenir au moins 10 caractères.';

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ errors }, { status: 422 });
  }

  const sent = await sendEmail({
    to: siteConfig.email,
    subject: `Nouveau message${data.subject ? ` — ${data.subject}` : ''}`,
    html: contactEmail({
      name: data.name!.trim(),
      email: data.email!.trim(),
      phone: data.phone?.trim(),
      subject: data.subject?.trim(),
      message: data.message!.trim(),
    }),
  });

  if (!sent) {
    return NextResponse.json(
      { error: "L'envoi a échoué. Merci de réessayer ou d'écrire directement par e-mail." },
      { status: 502 },
    );
  }
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2 : Build final** (PowerShell + CA cert) : `npm run build`.
Attendu : succès. Vérifier : `/login`, `/mot-de-passe-oublie`, `/reinitialiser` rendues ; `/admin` dynamique (ƒ) ; `/api/auth/[...nextauth]`, `/api/password/forgot`, `/api/password/reset`, `/api/contact` présentes. Aucune erreur de build liée au middleware/Auth.js.

- [ ] **Step 3 : WORKLOG** — ajouter une entrée datée (2026-07-12) : sous-projet B livré (Auth.js v5 Credentials/JWT, 2 comptes seedés, middleware `/admin`, flux mot de passe oublié par email avec checklist de robustesse, emails Brevo, formulaire de contact branché) ; note : CRUD = sous-projet C, upload = D ; Brevo à configurer (clé + expéditeur vérifié), seed à exécuter (`npm run seed`).

- [ ] **Step 4 : Commit**

```bash
git add src/app/api/contact/route.ts WORKLOG.md
git commit -m "feat(contact): envoi via Brevo + doc sous-projet B terminé

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Self-review (couverture spec)

- Auth.js v5 Credentials/JWT + split edge/Node → Tasks 4. Middleware protège `/admin`, bloque `/login` connecté → Task 4. ✅
- Hachage bcrypt 12 + politique forte (client checklist + serveur) → Tasks 1, 5. ✅
- Repos users + reset-tokens (hachés, usage unique, TTL 1h) → Task 2. ✅
- Flux forgot (générique anti-énumération, rate-limit) → reset (validation serveur, consommation token, emails) → Task 5. ✅
- Emails Brevo (reset, confirmation, contact) → Tasks 3, 7. ✅
- Coquille `/admin` protégée + déconnexion + SiteChrome → Task 6. ✅
- Seed 2 comptes depuis l'environnement → Task 6. ✅
- Contact branché sur Brevo → Task 7. ✅
- Env documentées (`.env.example`) → Task 1. ✅

## Notes d'exécution

- **Build/tests via PowerShell** (`NODE_EXTRA_CA_CERTS`). `AUTH_SECRET` doit être dans `.env.local` pour le build/run.
- **Brevo** : sans `BREVO_API_KEY`/`BREVO_SENDER`, l'envoi renvoie `false` (journalisé) — le build et l'UI ne cassent pas ; le forgot reste générique, le reset renvoie quand même OK (l'email de confirmation échoue silencieusement). Tests email réels une fois Brevo configuré.
- **Seed** : `npm run seed` (après avoir renseigné `SEED_AMELIE_PASSWORD`/`SEED_CLEMENT_PASSWORD` + Mongo joignable). Idempotent (upsert par email).
- **Vercel** : ajouter `AUTH_SECRET`, `BREVO_API_KEY`, `BREVO_SENDER` (+ Mongo déjà prévu) dans les env vars ; Atlas Network Access autorisé.
- ⚠️ Mot de passe MongoDB toujours à faire tourner.
