import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// For GitHub Pages: leave `base: './'` for user/organization pages or set to `'/<repo-name>/'` for project pages.
export default defineConfig({
  plugins: [react()],
  base: './',
})
