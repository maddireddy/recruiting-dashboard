import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy API requests to backend to avoid CORS in dev
      '/api': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            // Log proxied request in dev for debugging
            if (process.env.NODE_ENV === 'development') {
              console.log('Proxying:', req.method, req.url, 'to', proxyReq.path);
              console.log('Auth header:', req.headers.authorization?.replace(/Bearer\s+([^.]+\.[^.]+\.).*/, 'Bearer $1...'));
              console.log('Tenant header:', req.headers['x-tenant-id']);
            }
          });
          
          proxy.on('error', (err, _req, res) => {
            console.error('Proxy error:', err);
            if ('writeHead' in res) {
              res.writeHead(500, {
                'Content-Type': 'text/plain',
              });
              res.end('Proxy error: ' + err.message);
            }
          });
        },
      },
    },
  },
})
