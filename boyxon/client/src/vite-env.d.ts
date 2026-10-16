/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_SOCKET_URL?: string;
  readonly VITE_VAPID_PUBLIC_KEY?: string;
  /** APK yuklab olish havolasi (bo'sh bo'lsa GitHub Releases default ishlatiladi). */
  readonly VITE_APK_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
