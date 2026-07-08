import { existsSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Vrai si le fichier existe dans `public/` (résolu au build).
 * SERVER-ONLY (utilise fs) : à n'importer que dans des composants serveur.
 * Permet d'afficher une vraie image uniquement quand elle a été déposée,
 * sinon on laisse le placeholder — jamais d'image cassée.
 */
export function assetExists(publicPath: string): boolean {
  const rel = publicPath.replace(/^\//, '');
  return existsSync(join(process.cwd(), 'public', rel));
}
