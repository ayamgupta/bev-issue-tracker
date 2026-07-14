import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Set VITE_BASE_PATH in CI to "/<repo-name>/" when deploying to GitHub Pages
// (project pages are served from https://<user>.github.io/<repo-name>/).
export default defineConfig({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react(), tailwindcss()],
})
