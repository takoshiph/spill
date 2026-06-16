import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// Brand palette (kept in sync with src/index.css and the project brief)
const THEME_COLOR = '#C75B2A' // Burnt Orange
const BG_COLOR = '#2C1A0E'    // Deep Espresso

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.png', 'card-back.png', 'icons/*.png'],
      // Ship updates instantly: the new service worker skips the "waiting" phase,
      // claims open pages, and purges stale caches.
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
        // Cache the Poppins web font so it loads instantly after the first
        // visit and still works offline (PWA).
        runtimeCaching: [
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-stylesheets' },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      manifest: {
        name: 'Spill! Your Group Chat',
        short_name: 'Spill!',
        description: 'Every secret has a group chat.',
        theme_color: THEME_COLOR,
        background_color: BG_COLOR,
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/icon-512.png', sizes: '192x192', type: 'image/png', purpose: 'any' }
        ]
      }
    })
  ]
})
