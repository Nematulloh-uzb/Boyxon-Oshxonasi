import { useEffect, useState } from 'react';
import { BellRing, X } from 'lucide-react';
import { usePush } from '../../hooks/usePush';
import { useAuthStore } from '../../store/auth.store';

/** Login dan keyin bir marta push ruxsati so‘raydi (localStorage flag). */
export function PushPermissionPrompt() {
  const token = useAuthStore((s) => s.accessToken);
  const { supported, permission, subscribe } = usePush();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!token || !supported) return;
    if (permission === 'granted' || permission === 'denied') return;
    if (localStorage.getItem('boyxon-push-asked')) return;
    const t = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(t);
  }, [token, supported, permission]);

  if (!show) return null;

  const dismiss = (granted = false): void => {
    localStorage.setItem('boyxon-push-asked', granted ? 'granted' : '1');
    setShow(false);
  };

  return (
    <div className="fixed inset-x-4 bottom-20 z-40 mx-auto max-w-md rounded-card border border-ink-line bg-surface p-4 shadow-lg md:bottom-6">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary-100 text-primary-600">
          <BellRing className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink-900">Bildirishnomalarni yoqasizmi?</p>
          <p className="mt-0.5 text-sm text-ink-500">Buyurtma holati va yangiliklardan xabardor bo‘lasiz.</p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={async () => {
                const ok = await subscribe();
                dismiss(ok);
              }}
              className="h-9 flex-1 rounded-full bg-primary-500 text-sm font-semibold text-white hover:bg-primary-600"
            >
              Yoqish
            </button>
            <button
              onClick={() => dismiss(false)}
              className="h-9 rounded-full border border-ink-line px-4 text-sm font-medium text-ink-700"
            >
              Keyinroq
            </button>
          </div>
        </div>
        <button onClick={() => dismiss(false)} className="rounded-full p-1 text-ink-300 hover:bg-black/5 dark:hover:bg-white/10" aria-label="Yopish">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
