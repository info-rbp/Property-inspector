import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pages from '@hono/vite-cloudflare-pages'

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    strictPort: true
  },
  plugins: [
    react(),
    pages({
      entry: 'src/index.tsx'
    })
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: './index.html'
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})