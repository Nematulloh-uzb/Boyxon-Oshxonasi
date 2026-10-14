import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
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
          vendor: ['@tanstack/react-query', 'zustand', 'axios', 'framer-motion', 'socket.io-client'],
          i18n: ['i18next', 'react-i18next'],
        },
      },
    },
  },
  preview: { port: 4173 },
});
