import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    proxy: {
      '/analyze_code': 'http://localhost:8000',
      '/analyze_project': 'http://localhost:8000',
      '/logs': 'http://localhost:8000'
    }
  }
})