import type { Document } from 'mongodb';
import { getDb } from './mongodb';
import type { Testimonial } from '@/lib/testimonials';

function toTestimonial(d: Document): Testimonial {
  return {
    name: d.name,
    city: d.city,
    rating: d.rating,
    quote: d.quote,
    photo: d.photo ?? undefined,
  };
}

/** Avis publiés, triés par `order`. Renvoie `[]` en cas d'erreur. */
export async function getPublishedTestimonials(): Promise<Testimonial[]> {
  try {
    const db = await getDb();
    const docs = await db
      .collection('testimonials')
      .find({ published: true })
      .sort({ order: 1 })
      .toArray();
    return docs.map(toTestimonial);
  } catch (err) {
    console.error('[db] getPublishedTestimonials a échoué :', err);
    return [];
  }
}
