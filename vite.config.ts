import { URL, fileURLToPath } from 'url'

import AutoImport from 'unplugin-auto-import/vite'
import ViteComponents from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import eslintPlugin from 'vite-plugin-eslint'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    eslintPlugin({ cache: false }),
    AutoImport({
      dts: true,
      imports: ['vue'],
      eslintrc: {
        enabled: true,
      },
    }),
    ViteComponents({
      dts: true,
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
