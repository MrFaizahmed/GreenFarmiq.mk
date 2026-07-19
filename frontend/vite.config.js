import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to backend during development to avoid CORS
      '/api': {
        target: 'https://greenfarmiq-1.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
