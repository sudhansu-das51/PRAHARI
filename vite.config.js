import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // A cyclone app must never serve a stale build. No "an update is
      // available" prompt — take the new one as soon as it exists.
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.svg',
        'apple-touch-icon.png',
        'fonts/ClashGrotesk-Light.otf',
        'fonts/ClashGrotesk-Bold.otf',
      ],
      manifest: {
        name: 'Prahari — Odisha Cyclone Alert',
        short_name: 'Prahari',
        description:
          'Cyclone alert level, nearest shelters and emergency helplines for coastal Odisha. Works offline.',
        lang: 'en',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#070B0F',
        theme_color: '#070B0F',
        categories: ['weather', 'utilities'],
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // The shell, the bundle and the whole shelter registry are precached,
        // so the app opens with no network at all — which is the state people
        // will actually be in.
        globPatterns: ['**/*.{js,css,html,svg,png,otf,woff2}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
        runtimeCaching: [
          {
            // Google Fonts stylesheet + files. Safe to serve stale; a font
            // cannot be out of date in a way that misleads anyone.
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Live weather is deliberately NEVER cached here.
            //
            // useDistrictAlert falls back to its own localStorage copy when the
            // fetch fails, and only then flags the reading as stale and shows
            // "OFFLINE · LAST KNOWN DATA". If the service worker answered from
            // cache the fetch would succeed, that flag would stay off, and
            // hours-old wind speeds would be presented as current — during a
            // cyclone, the one failure mode worth avoiding above all others.
            urlPattern: /^https:\/\/api\.open-meteo\.com\//,
            handler: 'NetworkOnly',
          },
          {
            // Advisory generation needs the network by definition.
            urlPattern: /\/api\//,
            handler: 'NetworkOnly',
          },
        ],
      },
    }),
  ],
})
