# Installations — Plugins, Skills & Agents

> Suivi des plugins/skills/agents Claude Code et des dépendances npm, pour
> **reprendre le travail où il en était**. Dernière mise à jour : **2026-07-08**.

## 1. Plugins & marketplaces Claude Code

> ⚠️ **La commande `/plugin` n'est PAS disponible dans cet environnement**
> (l'IDE renvoie « /plugin isn't available in this environment »). La gestion des
> marketplaces/plugins doit se faire depuis un environnement Claude Code qui la
> supporte (CLI/desktop). Certains skills sont toutefois déjà chargés (voir ci-dessous).

| Statut | Plugin / Source | Note |
|--------|-----------------|------|
| ✅ actif | superpowers (`claude-plugins-official`) | skills `superpowers:*` détectés dans la session |
| ✅ actif | frontend-design | skill `frontend-design` détecté dans la session |
| ✅ fusionné | Skills Karpathy (`forrestchang/andrej-karpathy-skills`) | `CLAUDE.md` récupéré et fusionné à la racine (guidelines comportementales) |
| ✅ à valider | ui-ux-pro-max (`nextlevelbuilder/ui-ux-pro-max-skill`) | `/plugin` indisponible ; non détecté en session |
| ⛔ indispo ici | `/awesome webfuse-com/awesome-claude` | commande indisponible dans cet environnement |
| ⚪ à faire | tdd-guard — https://github.com/nizos/tdd-guard | — |
| ⚪ à faire | Agents — `wshobson/agents` | — |
| ⚪ à faire | everything-claude-code — aitmpl.com | — |

Légende : ✅ actif/fusionné · ⛔ indisponible ici · ⚪ à faire

**Notes de reprise :** installer les plugins restants depuis un environnement où
`/plugin` fonctionne, puis redémarrer la session pour que les skills/agents
soient détectés. Le `CLAUDE.md` racine contient déjà les guidelines Karpathy.

## 2. Dépendances npm

### Installées à l'étape 1 (socle)
- `next@^15.1.4`, `react@^19`, `react-dom@^19`
- `typescript@^5.7`, `@types/*`, `eslint@^9`, `eslint-config-next`, `@eslint/eslintrc`
- `tailwindcss@^4`, `@tailwindcss/postcss@^4`
- `framer-motion@^12`, `gsap@^3.12`, `lenis@^1.1`, `lucide-react`

### Réservées pour l'étape Three.js (installées plus tard)
- `three`, `@types/three`
- `@react-three/fiber@^9` (compatible React 19)
- `@react-three/drei@^10`

Raison : isoler l'écosystème 3D pour éviter qu'un conflit de versions ne bloque
le build du socle. À installer au début de l'étape 7.

## Statut d'installation npm
- ✅ `npm install` — **fait** (407 paquets). `typecheck` et `build` OK.

## ⚠️ Correctif réseau requis sur cette machine (interception TLS)
Node/npm échouaient avec `UNABLE_TO_VERIFY_LEAF_SIGNATURE` (antivirus/proxy qui
intercepte le TLS). Correctif appliqué et **persisté** :
1. `system-ca.pem` généré à la racine (racines de confiance Windows exportées ;
   git-ignoré, spécifique machine — ne pas committer, inutile sur Vercel).
2. `npm config set cafile <projet>\system-ca.pem`.
3. `setx NODE_EXTRA_CA_CERTS <projet>\system-ca.pem`.

Toujours lancer npm/next **via PowerShell** (le sandbox de l'outil Bash n'a pas
d'accès réseau). Si l'install/le build recasse en TLS : régénérer le PEM + re-set.
