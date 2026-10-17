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
    // MUHIM: hostname 'localhost' — WebView sahifasi va API (localhost:5000,
    // adb reverse orqali) bir xil saytda bo'lishi uchun. 'boyxon.local' bo'lsa
    // API 10.0.2.2:5000 bilan cross-site bo'lib, refresh cookie (SameSite=Lax)
    // WebView'da umuman saqlanmaydi va ilova qayta ochilganda sessiya tiklanmaydi.
    hostname: 'localhost',
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
