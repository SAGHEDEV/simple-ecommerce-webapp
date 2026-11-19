import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    // Only used when VITE_API_URL is empty (same-origin requests).
    server: { proxy: { '/api': env.VITE_API_URL || 'http://localhost:4010' } },
  }
})
