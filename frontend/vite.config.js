import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/auth-api': {
        target: 'https://auth-api.softlaw.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth-api/, ''),
        secure: true
      },
      '/api': {
        target: 'https://notaryllm-dev.softlaw.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: true
      }
    }
  }
}) 