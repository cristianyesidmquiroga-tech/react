import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// En desarrollo /api se redirige a Spring Boot, así el navegador no hace peticiones a otro origen
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:31026',
        changeOrigin: true,
      },
    },
  },
})
