import type { Document } from 'mongodb';
import { getDb } from './mongodb';
import type { Realisation } from '@/lib/realisations';

function toRealisation(d: Document): Realisation {
  return {
    slug: d.slug,
    title: d.title,
    city: d.city,
    surface: d.surface,
    category: d.category,
    projectType: d.projectType,
    year: d.year,
    description: d.description ?? undefined,
    gallery: d.gallery ?? undefined,
    image: d.image ?? undefined,
  };
}

/** Réalisations publiées, triées par `order`. Renvoie `[]` en cas d'erreur. */
export async function getPublishedRealisations(): Promise<Realisation[]> {
  try {
    const db = await getDb();
    const docs = await db
      .collection('realisations')
      .find({ published: true })
      .sort({ order: 1 })
      .toArray();
    return docs.map(toRealisation);
  } catch (err) {
    console.error('[db] getPublishedRealisations a échoué :', err);
    return [];
  }
}

/** Slugs publiés (pour generateStaticParams). Renvoie `[]` en cas d'erreur. */
export async function getPublishedRealisationSlugs(): Promise<string[]> {
  try {
    const db = await getDb();
    const docs = await db
      .collection('realisations')
      .find({ published: true }, { projection: { slug: 1 } })
      .toArray();
    return docs.map((d) => d.slug as string);
  } catch (err) {
    console.error('[db] getPublishedRealisationSlugs a échoué :', err);
    return [];
  }
}

/** Une réalisation publiée par slug, ou `undefined` (absente / brouillon / erreur). */
export async function getRealisationBySlug(slug: string): Promise<Realisation | undefined> {
  try {
    const db = await getDb();
    const doc = await db.collection('realisations').findOne({ slug, published: true });
    return doc ? toRealisation(doc) : undefined;
  } catch (err) {
    console.error('[db] getRealisationBySlug a échoué :', err);
    return undefined;
  }
}
