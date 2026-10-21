import { useTranslation } from 'react-i18next';
import { Seo } from './Seo';

/** Shaxsiy / autentifikatsiya sahifalari uchun noindex SEO. */
export function PrivateSeo({ title, path }: { title: string; path: string }): JSX.Element {
  const { t } = useTranslation();
  return (
    <Seo
      title={`${title} — Boyxon Oshxonasi`}
      description={t('seo.private.description')}
      path={path}
      noindex
    />
  );
}
