import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Change this to your repository name for GitHub Pages deployment.
  // For example, if your repo is at https://github.com/user/my-app,
  // set base to '/my-app/'.
  base: '/InJourney-Airports-COBIT-2019-Design-Tool/', 
})
