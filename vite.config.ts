import { defineConfig } from 'vitest/config'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: './',
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['assets/icons/*.svg'],
      manifest: {
        name: 'Black Hole Body Eater',
        short_name: 'Black Hole',
        description: 'Grow a black hole by eating your way from subatomic particles to the largest organ in the human body.',
        start_url: '.',
        display: 'standalone',
        background_color: '#1c1840',
        theme_color: '#1c1840',
        orientation: 'portrait',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
  test: {
    environment: 'node',
  },
})
