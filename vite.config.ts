import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  // For GitHub Pages deployment - set to your repo name
  // e.g., '/holiday-planner/' if repo is username.github.io/holiday-planner
  base: process.env.GITHUB_PAGES ? '/holiday-planner/' : '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
  },
})
