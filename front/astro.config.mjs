import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';
import tailwind from '@astrojs/tailwind';
import netlify from '@astrojs/netlify';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import AstroPWA from '@vite-pwa/astro';

const BACKEND = process.env.BACKEND_URL ?? 'http://localhost:4000';
const SITE = process.env.PUBLIC_SITE_URL ?? 'https://embedia.netlify.app';
const isLocalPreview = process.env.ASTRO_LOCAL_PREVIEW === '1';

export default defineConfig({
  site: SITE,
  output: 'hybrid',
  adapter: isLocalPreview ? node({ mode: 'standalone' }) : netlify(),
  integrations: [
    preact({ compat: true }),
    tailwind({ applyBaseStyles: false }),
    sitemap({ filter: (page) => !page.includes('/login') }),
    AstroPWA({
      registerType: 'autoUpdate',
      injectRegister: null,
      includeAssets: ['favicon.svg', 'og-default.svg'],
      manifest: {
        name: 'Embedia — Componentes y SBC para sistemas embebidos',
        short_name: 'Embedia',
        description: 'Compra microcontroladores, SBC, sensores y herramientas de laboratorio.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        theme_color: '#ff6b1a',
        background_color: '#0a0a0a',
        icons: [
          { src: '/icons/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        navigateFallback: '/',
        globPatterns: ['**/*.{css,js,html,svg,png,ico,txt,webp,woff2}'],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 20, maxAgeSeconds: 31536000 } },
          },
          {
            urlPattern: /\/uploads\/.*\.(png|jpg|jpeg|webp|svg)$/i,
            handler: 'CacheFirst',
            options: { cacheName: 'product-images', expiration: { maxEntries: 60, maxAgeSeconds: 604800 } },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: { port: 5173, host: true },
  compressHTML: true,
  build: { inlineStylesheets: 'auto' },
  prefetch: false,
  vite: {
    server: {
      port: 5173,
      proxy: {
        '/graphql': { target: BACKEND, changeOrigin: false },
        '/auth': { target: BACKEND, changeOrigin: false },
        '/api': { target: BACKEND, changeOrigin: false },
        '/upload': { target: BACKEND, changeOrigin: false },
        '/uploads': { target: BACKEND, changeOrigin: false },
      },
    },
  },
});
