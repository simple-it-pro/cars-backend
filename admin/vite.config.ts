import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/cars/',
  server: {
    proxy: {
      '/api': {
        target: 'https://simple-transcriber.duckdns.org/cars',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
