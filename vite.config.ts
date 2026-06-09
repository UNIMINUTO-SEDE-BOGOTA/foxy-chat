import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const webhookUrl = env.VITE_N8N_WEBHOOK_URL ?? ''
  const webhookOrigin = webhookUrl ? new URL(webhookUrl).origin : ''
  const webhookPath = webhookUrl ? new URL(webhookUrl).pathname : ''


  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'icons/*.png'],
        manifest: {
          name: 'FOXY Chat',
          short_name: 'FOXY',
          description: 'Chat con inteligencia artificial',
          theme_color: '#0f0f0f',
          background_color: '#0f0f0f',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/icons/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: '/icons/icon-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          navigateFallback: '/index.html',
          navigateFallbackDenylist: [/^\/api/],
          runtimeCaching: webhookOrigin
            ? [
                {
                  urlPattern: new RegExp(`^${webhookOrigin.replace(/\./g, '\\.')}`),
                  handler: 'NetworkFirst',
                  options: {
                    cacheName: 'api-cache',
                    expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 },
                    networkTimeoutSeconds: 10,
                  },
                },
              ]
            : [],
        },
      }),
    ],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    assetsInclude: ['**/*.svg', '**/*.csv'],
    server: {
      proxy: webhookOrigin
        ? {
            '/api/chat': {
              target: webhookOrigin,
              changeOrigin: true,
              secure: true,
              rewrite: () => webhookPath,
            },
          }
        : {},
    },
  }
})