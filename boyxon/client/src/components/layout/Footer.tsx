import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, Copy } from 'lucide-react';

const PHONE_DISPLAY = '+998 (93) 958-84-58';
const PHONE_COPY = '+998939588458';

export function Footer() {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);

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

  return (
    <footer className="mt-12 border-t border-ink-line bg-surface pb-20 md:pb-0">
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
          <button
            type="button"
            onClick={() => void copyPhone()}
            title={PHONE_DISPLAY}
            aria-label={copied ? 'Nusxalandi' : `${PHONE_DISPLAY} — nusxalash`}
            className="mt-2 flex items-center gap-2 rounded-xl border border-ink-line bg-bg px-3 py-2 font-semibold text-ink-700 transition hover:border-primary-500/50 hover:text-primary-600 active:scale-[0.98]"
          >
            <span>{PHONE_DISPLAY}</span>
            {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4 opacity-60" />}
          </button>
          {copied && <p className="mt-1 text-xs font-medium text-success">Nusxalandi ✓</p>}
        </div>
      </div>
    </footer>
  );
}
