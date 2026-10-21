import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Category } from '../../types';
import { localizedCategoryName } from '../../lib/format';
import { cn } from '../../lib/utils';

interface Props {
  categories: Category[];
  activeSlug?: string;
}

/**
 * Kategoriyalarga oddiy, crawlable <a> havolalar.
 * (CategoryChips filtr tugmalari — ular qidiruv tizimlari uchun link emas.)
 */
export function CategoryLinks({ categories, activeSlug }: Props): JSX.Element {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        to="/"
        className={cn(
          'inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium transition',
          !activeSlug
            ? 'border-primary-700 bg-primary-700 text-white'
            : 'border-ink-line bg-surface text-ink-700 hover:border-primary-500/40',
        )}
      >
        {t('category.all')}
      </Link>
      {categories.map((c) => (
        <Link
          key={c._id}
          to={`/category/${c.slug}`}
          className={cn(
            'inline-flex min-h-10 items-center rounded-full border px-4 text-sm font-medium transition',
            activeSlug === c.slug
              ? 'border-primary-700 bg-primary-700 text-white'
              : 'border-ink-line bg-surface text-ink-700 hover:border-primary-500/40',
          )}
        >
          {localizedCategoryName(c, lang) || c.name}
        </Link>
      ))}
    </div>
  );
}
