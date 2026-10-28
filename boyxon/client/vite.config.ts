import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

/**
 * Build vaqtida robots.txt yozadi (public/ dan ko'chirilmaydi — API manzili
 * muhitga qarab o'zgaradi). Dev serverda ham xuddi shu qoida beriladi.
 */
function seoFilesPlugin(siteUrl: string): Plugin {
  // Sitemap serverda (dinamik taomlar bilan) yasaladi. Sayt URL'i noma'lum
  // bo'lsa (VITE_SITE_URL berilmagan) robotlar uchun faqat absolut URL kerak
  // bo'lgan Sitemap qatorini qoldirib ketamiz.
  const privatePaths = [
    '/cart',
    '/settings',
    '/orders',
    '/admin',
    '/auth',
    '/verify-email',
    '/forgot-password',
    '/reset-password',
  ];
  const disallow = privatePaths.flatMap((path) => [path, `/ru${path}`, `/en${path}`]);

  const robots = [
    siteUrl ? `# Boyxon Oshxonasi — ${siteUrl}` : '# Boyxon Oshxonasi',
    'User-agent: *',
    'Allow: /',
    '',
    ...disallow.map((path) => `Disallow: ${path}`),
    '',
    ...(siteUrl ? [`Sitemap: ${siteUrl}/sitemap.xml`, ''] : []),
  ].join('\n');

  return {
    name: 'boyxon-seo-files',
    configureServer(server) {
      server.middlewares.use('/robots.txt', (_req, res) => {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.end(robots);
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots });
    },
  };
}

/**
 * Asosiy CSS'ni HTML ichiga inline qiladi. 7KB CSS uchun alohida render-blocking
 * so'rov yubormaymiz: brauzer uslubni HTML bilan birga oladi va birinchi paint
 * tezroq bo'ladi. Lazy sahifalarning CSS chunk'lari o'z joyida qoladi.
 */
function inlineCssPlugin(): Plugin {
  return {
    name: 'boyxon-inline-css',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const htmlAsset = bundle['index.html'];
      if (!htmlAsset || htmlAsset.type !== 'asset' || typeof htmlAsset.source !== 'string') return;
      let changed = false;
      const html = htmlAsset.source.replace(
        /<link[^>]*rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*>/g,
        (match: string, href: string) => {
          const fileName = href.replace(/^\//, '').split('?')[0];
          const cssAsset = bundle[fileName];
          if (!cssAsset || cssAsset.type !== 'asset' || typeof cssAsset.source !== 'string') {
            return match;
          }
          changed = true;
          return `<style>${cssAsset.source}</style>`;
        },
      );
      if (changed) htmlAsset.source = html;
    },
  };
}

/**
 * LCP matni Epilogue 800 bilan chiziladi. Brauzer @font-face'ni faqat React
 * matnni chizgandan keyin so'raydi; preload bilan shrift HTML parse paytida
 * yuklanadi va birinchi renderda tayyor bo'ladi.
 */
function fontPreloadPlugin(): Plugin {
  return {
    name: 'boyxon-font-preload',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const htmlAsset = bundle['index.html'];
      if (!htmlAsset || htmlAsset.type !== 'asset' || typeof htmlAsset.source !== 'string') return;
      const font = Object.keys(bundle).find((name) =>
        /(?:^|\/)epilogue-latin-800-normal-[^/]+\.woff2$/.test(name),
      );
      if (!font) return;
      const href = `/${font}`;
      if (htmlAsset.source.includes(`href="${href}"`)) return;
      htmlAsset.source = htmlAsset.source.replace(
        '</head>',
        `<link rel="preload" as="font" type="font/woff2" href="${href}" crossorigin>\n</head>`,
      );
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      seoFilesPlugin(env, mode === 'production'),
      inlineCssPlugin(),
      fontPreloadPlugin(),
    ],
    resolve: {
      alias: {
        // Runtime'da i18next o'rniga yengil implementatsiya ishlatiladi.
        // TypeScript uchun haqiqiy paket tiplari qoladi (bundle'ga kirmaydi).
        'react-i18next': fileURLToPath(new URL('./src/locales/react-i18next.ts', import.meta.url)),
      },
    },
    server: {
      port: 5173,
      proxy: {
        '/api': { target: 'http://localhost:5000', changeOrigin: true },
      },
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            vendor: ['@tanstack/react-query', 'zustand', 'axios'],
            // Leaflet faqat xarita kerak bo'lganda yuklanadi — asosiy bundle'dan ajratamiz.
            leaflet: ['leaflet'],
          },
        },
      },
    },
    preview: { port: 4173 },
  };
});
