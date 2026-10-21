import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Check, Clock, Copy, MapPin, Phone } from 'lucide-react';
import { categoriesApi } from '../../api/categories.api';
import { QUERY_KEYS } from '../../lib/constants';
import { localizedCategoryName } from '../../lib/format';

const PHONE_DISPLAY = '+998 (93) 958-84-58';
const PHONE_COPY = '+998939588458';

export function Footer() {
  const { t, i18n } = useTranslation();
  const [copied, setCopied] = useState(false);
  const { data: categories } = useQuery({
    queryKey: [QUERY_KEYS.categories],
    queryFn: () => categoriesApi.list().then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  });

  const copyPhone = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(PHONE_COPY);
    } catch {
      // clipboard API ishlamasa (http / eski brauzer) — fallback
      const ta = document.createElement('textarea');
      ta.value = PHONE_COPY;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* ignore */ }
      document.body.removeChild(ta);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const year = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-ink-line bg-surface pb-20 md:pb-0">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 text-sm text-ink-300 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-display text-lg font-bold text-ink-700">Boyxon Oshxonasi</p>
            <p className="mt-2">{t('footer.tagline')}</p>
            <p className="mt-2 text-xs leading-relaxed text-ink-300">{t('footer.about_text')}</p>
          </div>

          <nav aria-label={t('footer.categories')}>
            <p className="font-semibold text-ink-700">{t('footer.categories')}</p>
            <div className="mt-2 flex flex-col gap-1">
              <Link to="/" className="hover:text-primary-600">{t('home.all_dishes')}</Link>
              {(categories ?? []).map((category) => (
                <Link
                  key={category._id}
                  to={`/category/${category.slug}`}
                  className="hover:text-primary-600"
                >
                  {localizedCategoryName(category, i18n.language) || category.name}
                </Link>
              ))}
            </div>
          </nav>

          <nav aria-label={t('footer.navigation')}>
            <p className="font-semibold text-ink-700">{t('footer.navigation')}</p>
            <div className="mt-2 flex flex-col gap-1">
              <Link to="/" className="hover:text-primary-600">{t('nav.menu')}</Link>
              <Link to="/cart" className="hover:text-primary-600">{t('nav.cart')}</Link>
              <Link to="/settings" className="hover:text-primary-600">{t('nav.settings')}</Link>
            </div>
          </nav>

          <div>
            <p className="font-semibold text-ink-700">{t('footer.contact')}</p>
            <div className="mt-2 flex items-center gap-2">
              <a
                href={`tel:${PHONE_COPY}`}
                className="flex items-center gap-2 rounded-xl border border-ink-line bg-bg px-3 py-2 font-semibold text-ink-700 transition hover:border-primary-500/50 hover:text-primary-600"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span>{PHONE_DISPLAY}</span>
              </a>
              <button
                type="button"
                onClick={() => void copyPhone()}
                title={PHONE_DISPLAY}
                aria-label={copied ? t('footer.copied') : t('footer.copy_phone')}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-ink-line text-ink-300 transition hover:border-primary-500/50 hover:text-primary-600"
              >
                {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            {copied && <p className="mt-1 text-xs font-medium text-success">{t('footer.copied')}</p>}

            <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{t('footer.address_line')}</span>
            </p>
            <p className="mt-1.5 flex items-center gap-2 text-xs">
              <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{t('footer.hours_value')}</span>
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-1 border-t border-ink-line/60 pt-4 text-xs text-ink-300 sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} Boyxon Oshxonasi. {t('footer.rights')}.</p>
          <p>{t('footer.address_line')}</p>
        </div>
      </div>
    </footer>
  );
}
