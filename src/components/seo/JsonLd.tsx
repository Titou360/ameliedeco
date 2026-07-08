/**
 * Injecte un graphe JSON-LD dans la page (Schema.org).
 * Server component : le script est présent dès le HTML initial (bon pour le SEO).
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // Sérialisation contrôlée ; les données proviennent de notre config interne.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
