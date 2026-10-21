import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Build vaqtida robots.txt yozadi (public/ dan ko'chirilmaydi — API manzili
 * muhitga qarab o'zgaradi). Dev serverda ham xuddi shu qoida beriladi.
 */
function seoFilesPlugin(env: Record<string, string>, isProduction: boolean): Plugin {
  const rawSiteUrl =
    env.VITE_SITE_URL ||
    (isProduction ? 'https://boyxon-client.onrender.com' : 'http://localhost:5173');
  const siteUrl = (
    isProduction && /localhost|127\.0\.0\.1/i.test(rawSiteUrl)
      ? 'https://boyxon-client.onrender.com'
      : rawSiteUrl
  ).replace(/\/+$/, '');

  const rawApiUrl =
    env.VITE_API_URL ||
    (isProduction ? 'https://boyxon-server.onrender.com/api' : 'http://localhost:5000/api');
  const apiUrl = (
    isProduction && /localhost|127\.0\.0\.1/i.test(rawApiUrl)
      ? 'https://boyxon-server.onrender.com/api'
      : rawApiUrl
  ).replace(/\/+$/, '');
  const apiBase = apiUrl.replace(/\/api$/, '');
  // Sitemap serverda (dinamik taomlar bilan) yasaladi. Lokal build'da API
  // nisbiy `/api` bo'lsa, robots.txt'da nisbiy URL qolmasin — Lighthouse
  // buni xato deb hisoblaydi va qidiruv botlari ham noto'g'ri talqin qiladi.
  const sitemapBase = /^https?:\/\//i.test(apiBase) ? apiBase : siteUrl;

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
    `# Boyxon Oshxonasi — ${siteUrl}`,
    'User-agent: *',
    'Allow: /',
    '',
    ...disallow.map((path) => `Disallow: ${path}`),
    '',
    `Sitemap: ${sitemapBase}/sitemap.xml`,
    '',
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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), seoFilesPlugin(env, mode === 'production'), inlineCssPlugin()],
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
            i18n: ['i18next', 'react-i18next'],
          },
        },
      },
    },
    preview: { port: 4173 },
  };
});
