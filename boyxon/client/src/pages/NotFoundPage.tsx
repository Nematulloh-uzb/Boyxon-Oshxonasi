import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChefHat } from 'lucide-react';
import { Seo } from '../components/seo/Seo';

/** 404 — sahifa topilmadi. */
export default function NotFoundPage() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center gap-4 px-6 text-center">
      <Seo
        title={`404 — ${t('pages.404.title')} | Boyxon Oshxonasi`}
        description={t('seo.notfound.description')}
        path={pathname}
        noindex
      />
      <ChefHat className="h-16 w-16 text-primary-500" />
      <h1 className="font-display text-4xl font-bold text-ink-900">404 — {t('pages.404.title')}</h1>
      <p className="text-ink-300">{t('pages.404.desc')}</p>
      <Link
        to="/"
        className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary-700 px-6 text-[15px] font-semibold text-white transition hover:bg-primary-800 active:scale-[0.98]"
      >
        {t('pages.404.go_home')}
      </Link>
    </div>
  );
}

