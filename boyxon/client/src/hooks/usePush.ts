import { useCallback, useEffect, useState } from 'react';
import { pushApi } from '../api/notifications.api';

function urlSafeToUint8(base64: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0))).buffer as ArrayBuffer;
}

export function usePush() {
  const [supported] = useState(() => 'serviceWorker' in navigator && 'PushManager' in window);
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'default',
  );
  const [subscribed, setSubscribed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false); // SW holati aniqlandimi

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      setReady(true);
      return;
    }
    let alive = true;
    navigator.serviceWorker
      .register('/sw.js')
      .then(() => navigator.serviceWorker.ready)
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => {
        if (alive && sub) setSubscribed(true);
      })
      .catch(() => undefined)
      .finally(() => {
        if (alive) setReady(true);
      });
    return () => {
      alive = false;
    };
  }, []);

  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!supported) return false;
    setBusy(true);
    try {
      const perm = await Notification.requestPermission();
      setPermission(perm);
      if (perm !== 'granted') return false;
      const reg = await navigator.serviceWorker.ready;
      const { data } = await pushApi.vapidKey();
      if (!data.key) return false;
      // Allaqachon obuna bo'lsa — qayta yaratmaymiz.
      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlSafeToUint8(data.key),
        });
      }
      const json = sub.toJSON();
      await pushApi.subscribe({
        endpoint: sub.endpoint,
        keys: { p256dh: json.keys?.p256dh ?? '', auth: json.keys?.auth ?? '' },
        userAgent: navigator.userAgent,
      });
      setSubscribed(true);
      localStorage.setItem('boyxon-push-asked', '1');
      return true;
    } catch {
      return false;
    } finally {
      setBusy(false);
    }
  }, [supported]);

  const unsubscribe = useCallback(async (): Promise<void> => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        // Server bilan FON rejimida — brauzer obunasini darhol bekor qilamiz.
        void pushApi.unsubscribe(sub.endpoint).catch(() => undefined);
        await sub.unsubscribe();
      }
    } finally {
      setSubscribed(false);
      setBusy(false);
    }
  }, []);

  return { supported, permission, subscribed, busy, ready, subscribe, unsubscribe };
}
