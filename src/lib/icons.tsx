import type { LucideIcon } from 'lucide-react';
import {
  Palette,
  Ruler,
  Sparkles,
  Wind,
  House,
  Gift,
  HeartHandshake,
  PencilRuler,
  Gem,
  ListChecks,
} from 'lucide-react';

/**
 * Registre d'icônes : associe une clé stable (stockée dans les données) au
 * composant Lucide correspondant. Sépare données et rendu, reste tree-shakeable.
 */
export const iconMap = {
  palette: Palette,
  ruler: Ruler,
  sparkles: Sparkles,
  wind: Wind,
  house: House,
  gift: Gift,
  'heart-handshake': HeartHandshake,
  'pencil-ruler': PencilRuler,
  gem: Gem,
  'list-checks': ListChecks,
} satisfies Record<string, LucideIcon>;

export type IconKey = keyof typeof iconMap;
