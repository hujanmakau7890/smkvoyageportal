import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/auth/v1': {
        target: 'http://localhost:54321',
        changeOrigin: true,
      },
      '/rest/v1': {
        target: 'http://localhost:54321',
        changeOrigin: true,
      },
      '/storage/v1': {
        target: 'http://localhost:54321',
        changeOrigin: true,
      },
    },
  },
})
