import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  base: '/lb-gen/', // Ersetzen Sie "repository-name" durch den Namen Ihres Repositories
  build: {
    outDir: 'docs', // Ändert den Build-Output-Ordner auf "docs"
  },
})
