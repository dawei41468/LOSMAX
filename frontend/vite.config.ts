import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  base: '/', // Set the base URL for the application
  plugins: [react(), tailwindcss()],
  css: {
    transformer: 'lightningcss'
  },
  server: {
    port: 4100,
    strictPort: true,
    host: '0.0.0.0'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
