import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Allow dependency pre-bundling so CJS deps like React expose named exports.
  optimizeDeps: { include: ['react', 'react-dom', 'framer-motion'] },
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        cover: fileURLToPath(new URL('./cover.html', import.meta.url)),
        coverCards: fileURLToPath(new URL('./cover-cards.html', import.meta.url)),
      },
    },
  },
})
