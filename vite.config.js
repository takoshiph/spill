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
      // claims open pages, and purges stale caches — so a fresh deploy shows on the
      // next refresh for every player instead of being pinned to an old cached build.
      workbox: {
        clientsClaim: true,
        skipWaiting: true,
        cleanupOutdatedCaches: true,
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
