import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('@xenova/transformers') || id.includes('onnxruntime-web')) {
            return 'transformers';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1600,
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_PROXY_TARGET || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
