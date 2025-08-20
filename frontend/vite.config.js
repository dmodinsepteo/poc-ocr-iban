import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3000,
    open: process.env.NODE_ENV === 'development' && !process.env.DOCKER, // Ouvrir seulement en dev local
    host: '0.0.0.0', // Permet l'accès depuis l'extérieur du conteneur
    proxy: {
      '/auth-api': {
        target: 'https://auth-api.softlaw.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/auth-api/, ''),
        secure: true
      },
      '/brain-api': {
        target: 'https://notaryllm-dev.softlaw.ai',
        changeOrigin: true,
        rewrite: (path) => {
          console.log('path', path)
          console.log('path.replace', path.replace(/^\/brain-api/, ''))
          return path.replace(/^\/brain-api/, '')
        },
        secure: true
      }
    }
  }
}) 