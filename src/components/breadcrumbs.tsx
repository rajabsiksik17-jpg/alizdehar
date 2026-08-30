import type { Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/config";
import { href } from "@/lib/site";
import { breadcrumbJsonLd } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { Icon } from "@/components/icon";

export function Breadcrumbs({
  locale,
  items,
}: {
  locale: Locale;
  items: { name: string; path?: string }[];
}) {
  const dict = getDictionary(locale);
  const crumbs = [
    { name: dict.common.home, path: "/" },
    ...items.map((i) => ({ name: i.name, path: i.path })),
  ];

  const jsonLd = breadcrumbJsonLd(
    crumbs.map((c) => ({ name: c.name, url: c.path ? href(locale, c.path) : href(locale, "/") })),
  );

  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-[var(--container-content)] px-4 pt-6 sm:px-6 lg:px-8">
      <JsonLd data={jsonLd} />
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-muted">
        {crumbs.map((crumb, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {i > 0 ? (
                <Icon name="chevron-right" className="h-3.5 w-3.5 text-brand-200 rtl:rotate-180" />
              ) : null}
              {isLast || !crumb.path ? (
                <span className="font-medium text-brand-800" aria-current="page">
                  {crumb.name}
                </span>
              ) : (
                <a href={href(locale, crumb.path)} className="transition-colors hover:text-accent-600">
                  {crumb.name}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
