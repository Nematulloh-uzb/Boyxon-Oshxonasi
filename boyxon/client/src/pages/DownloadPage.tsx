import { useTranslation } from 'react-i18next';
import { QRCodeSVG } from 'qrcode.react';
import { Download, ShieldCheck, Smartphone, ScanLine } from 'lucide-react';
import { Card } from '../components/ui/Card';

/**
 * Ilova yuklab olish sahifasi (APK + QR kod).
 *
 * APK GitHub Releases'da joylanadi: `releases/latest/download/boyxon.apk`
 * (har yangi release'da o'sha havola yangi faylni beradi).
 * `VITE_APK_URL` bilan boshqa hostingga (masalan, o'z serveringizga) o'tish mumkin.
 */
const APK_URL =
  (import.meta.env.VITE_APK_URL as string | undefined) ??
  'https://github.com/Nematulloh-uzb/Boyxon-Oshxonasi/releases/latest/download/boyxon.apk';

const STEPS = ['download.step1', 'download.step2', 'download.step3'] as const;

export default function DownloadPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-4 py-6">
      {/* Sarlavha */}
      <header className="text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-card bg-primary-100 text-primary-600">
          <Smartphone className="h-8 w-8" />
        </div>
        <h1 className="mt-3 font-display text-2xl font-extrabold text-ink-900">{t('download.title')}</h1>
        <p className="mt-1 text-sm text-ink-300">{t('download.subtitle')}</p>
      </header>

      {/* QR + tugma */}
      <Card className="space-y-4 p-6 text-center">
        <p className="flex items-center justify-center gap-2 text-sm font-medium text-ink-700">
          <ScanLine className="h-4 w-4 text-primary-600" />
          {t('download.scan')}
        </p>
        {/* QR har doim oq fonda — skanerlash uchun kontrast shart (dark mode'da ham). */}
        <div className="mx-auto w-fit rounded-card border border-ink-line bg-white p-3">
          <QRCodeSVG value={APK_URL} size={180} level="M" marginSize={1} />
        </div>

        <p className="text-xs font-medium uppercase tracking-wide text-ink-300">{t('download.or')}</p>

        <a
          href={APK_URL}
          className="mx-auto flex h-[52px] w-full max-w-xs items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-[#F39C12] px-6 text-[15px] font-semibold text-white shadow-sm transition-opacity hover:opacity-90 active:scale-[0.99]"
        >
          <Download className="h-5 w-5" />
          {t('download.apk_button')}
        </a>
        <p className="text-xs text-ink-300">{t('download.android_requirement')}</p>
      </Card>

      {/* O'rnatish tartibi */}
      <Card className="p-5">
        <h2 className="flex items-center gap-2 font-display text-base font-bold text-ink-900">
          <ShieldCheck className="h-4 w-4 text-success" />
          {t('download.steps_title')}
        </h2>
        <ol className="mt-3 space-y-3">
          {STEPS.map((key, i) => (
            <li key={key} className="flex gap-3 text-sm text-ink-700">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">
                {i + 1}
              </span>
              <span className="pt-0.5">{t(key)}</span>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
