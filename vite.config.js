import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  // Em desenvolvimento, /api vai para o back-end local (o back responde com e sem o prefixo /api).
  // Outro endereço: VITE_PROXY_TARGET=http://host:porta npm run dev
  server: { proxy: { '/api': process.env.VITE_PROXY_TARGET || 'http://localhost:3000' } },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'VinhaSense',
        short_name: 'VinhaSense',
        description: 'Monitoramento de umidade do solo, temperatura e umidade do ar para vinhedos.',
        lang: 'pt-BR',
        start_url: '/#/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#FAF7F2',
        theme_color: '#5B1A2E',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 }, cacheableResponse: { statuses: [0, 200] } }
          }
        ]
      },
      devOptions: { enabled: false }
    })
  ]
})
