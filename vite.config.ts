import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
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
