import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/Ready2Cook/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      manifest: {
        name: 'SpiceRoute',
        short_name: 'SpiceRoute',
        description: 'Discover recipes, plan your week, and auto-build your shopping list.',
        start_url: '/Ready2Cook/',
        scope: '/Ready2Cook/',
        display: 'standalone',
        background_color: '#faf4ea',
        theme_color: '#d1451b',
        icons: [
          {
            src: 'favicon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
    }),
  ],
})
