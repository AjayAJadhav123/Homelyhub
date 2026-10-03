import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      host: true,          // bind on 0.0.0.0 – makes Vite reachable over Wi-Fi
      port: 5173,
      proxy: {
        '/api': {
          // Set VITE_API_PROXY_TARGET in .env for local dev (e.g. http://localhost:3000 or LAN IP)
          target: env.VITE_API_PROXY_TARGET || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})