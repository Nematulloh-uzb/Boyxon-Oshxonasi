import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  /** Berilmasa — joriy sahifa (oxirgi element). */
  to?: string;
}

/** Ko'rinadigan breadcrumb navigatsiyasi (schema JSON-LD sahifada alohida). */
export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }): JSX.Element {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-ink-300">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
              {index > 0 && <ChevronRight className="h-3 w-3 shrink-0" aria-hidden="true" />}
              {item.to && !isLast ? (
                <Link to={item.to} className="font-medium transition hover:text-primary-600">
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={isLast ? 'page' : undefined}
                  className={isLast ? 'font-medium text-ink-500' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
