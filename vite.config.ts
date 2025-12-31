import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8084'

  return {
    plugins: [
      react(),
      // Visualize bundle size
      visualizer({
        filename: './dist/stats.html',
        open: false,
        gzipSize: true,
        brotliSize: true,
      }),
      // Compress assets with gzip
      viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
      }),
      // Compress assets with brotli (better compression)
      viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
      }),
    ],
    build: {
      // Target modern browsers for smaller bundle
      target: 'es2020',
      // Increase chunk size warning limit for AI libs
      chunkSizeWarningLimit: 1600,
      // Enable CSS code splitting
      cssCodeSplit: true,
      // Minification
      minify: 'esbuild',
      rollupOptions: {
        output: {
          // Manual code splitting for better caching
          manualChunks(id) {
            // AI/ML libraries (large, rarely changes)
            if (id.includes('@xenova/transformers') || id.includes('onnxruntime-web')) {
              return 'ai-libs';
            }
            // React ecosystem (large, rarely changes)
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            // UI libraries (medium, rarely changes)
            if (id.includes('@headlessui') || id.includes('framer-motion')) {
              return 'ui-vendor';
            }
            // Data/state management (medium, rarely changes)
            if (id.includes('zustand') || id.includes('@tanstack/react-query')) {
              return 'state-vendor';
            }
            // Chart/visualization libraries
            if (id.includes('recharts')) {
              return 'charts-vendor';
            }
            // Icons (medium, rarely changes)
            if (id.includes('lucide-react')) {
              return 'icons-vendor';
            }
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('zod')) {
              return 'forms-vendor';
            }
            // Other node_modules (catch-all for vendor code)
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
        },
      },
    },
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
    appType: 'spa',
    // Optimize dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'zustand',
        '@tanstack/react-query',
      ],
    },
  }
})
