/**
 * `cn` — concatène des classes conditionnelles.
 * Implémentation minimale sans dépendance : filtre les valeurs falsy.
 * Suffisant pour nos usages contrôlés (pas de fusion de conflits Tailwind).
 */
export type ClassValue = string | number | false | null | undefined;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ');
}
