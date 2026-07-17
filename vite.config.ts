import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'inline',
      includeAssets: ['favicon.svg', 'nook-face.svg', 'assets/android/*.png', 'assets/ios/*.png'],
      manifest: {
        name: 'Nook Phone',
        short_name: 'NookPhone',
        description: 'Your personal Nook Phone',
        theme_color: '#3b592d',
        background_color: '#3b592d',
        display: 'standalone',
        icons: [
          {
            src: 'assets/android/launchericon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'assets/android/launchericon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5175,
    host: true,
    strictPort: true,
    cors: true,
    allowedHosts: true,
    hmr: {
      clientPort: 5175
    }
  },
  build: {
    outDir: '../../wp-content/plugins/xophz-nook-phone/public/dist',
    emptyOutDir: true,
  }
})
