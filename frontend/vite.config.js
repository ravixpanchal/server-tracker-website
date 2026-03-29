import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const API_URL = process.env.VITE_API_URL || 'http://127.0.0.1:8000'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': API_URL,
      '/ws': {
        target: API_URL.replace('https', 'wss').replace('http', 'ws'),
        ws: true,
      },
    },
  },
})