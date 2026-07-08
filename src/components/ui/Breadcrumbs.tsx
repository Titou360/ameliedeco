import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { JsonLd } from '@/components/seo/JsonLd';
import { breadcrumbJsonLd } from '@/lib/structured-data';

export interface Crumb {
  label: string;
  href: string;
}

/**
 * Fil d'ariane : navigation visuelle + JSON-LD BreadcrumbList.
 * Le dernier élément représente la page courante (non cliquable, aria-current).
 */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Fil d'ariane">
      <JsonLd data={breadcrumbJsonLd(items.map((i) => ({ name: i.label, path: i.href })))} />
      <ol className="flex flex-wrap items-center gap-1.5 font-sans text-sm text-muted">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1.5">
              {isLast ? (
                <span aria-current="page" className="text-foreground">
                  {item.label}
                </span>
              ) : (
                <Link href={item.href} className="transition-colors hover:text-accent">
                  {item.label}
                </Link>
              )}
              {!isLast && (
                <ChevronRight size={14} strokeWidth={1.5} aria-hidden="true" className="text-muted/60" />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
