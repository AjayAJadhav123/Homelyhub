import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,          // bind on 0.0.0.0 – makes Vite reachable over Wi-Fi
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://10.93.42.63:3000',   // LAN IP of the backend
        changeOrigin: true,
        secure: false,
      }
    }
  }
})