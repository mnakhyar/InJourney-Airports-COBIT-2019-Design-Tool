import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/InJourney-Airports-COBIT-2019-Design-Tool/',
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
