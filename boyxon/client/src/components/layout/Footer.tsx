import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="mt-12 border-t border-ink-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 text-sm text-ink-300 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-bold text-ink-700">Boyxon Oshxonasi</p>
          <p className="mt-1">{t('footer.tagline')}</p>
        </div>
        <div>
          <p className="font-semibold text-ink-700">{t('footer.navigation')}</p>
          <div className="mt-2 flex flex-col gap-1">
            <Link to="/" className="hover:text-primary-600">{t('nav.menu')}</Link>
            <Link to="/cart" className="hover:text-primary-600">{t('nav.cart')}</Link>
            <Link to="/settings" className="hover:text-primary-600">{t('nav.settings')}</Link>
          </div>
        </div>
        <div>
          <p className="font-semibold text-ink-700">{t('footer.contact')}</p>
          <p className="mt-2">+998 71 200 00 00</p>
          <p>{t('footer.address_line')}</p>
        </div>
      </div>
    </footer>
  );
}
