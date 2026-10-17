import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'uz.boyxon.oshxonasi',
  appName: 'Boyxon Oshxonasi',
  webDir: 'dist',
  // SPA: barcha ichki yo'llar index.html orqali (BrowserRouter file:// da ham ishlaydi).
  server: {
    // MUHIM: http sxema — server cookie'ni dev rejimida (sameSite=lax) qo'yadi.
    // https bo'lsa server isProd=true deb o'ylab secure cookie qo'yadi va
    // WebView'da refresh ishlamay qoladi.
    androidScheme: 'http',
    cleartext: true,
    // Deep-link: boyxon://auth/callback?code=... (Google OAuth native qaytishi)
    hostname: 'boyxon.local',
  },
  android: {
    // Chiqishda Chrome Custom Tab emas, o'z WebView ichida ochiladi.
    allowMixedContent: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#121212',
      androidScaleType: 'CENTER_CROP',
      showSpinner: false,
    },
    StatusBar: {
      overlaysWebView: false,
      style: 'DARK',
      backgroundColor: '#121212',
    },
    Keyboard: {
      resize: 'body',
      resizeOnFullScreen: true,
    },
  },
};

export default config;
