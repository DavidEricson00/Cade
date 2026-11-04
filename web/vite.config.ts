import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// A API é sempre chamada pelo prefixo /api na mesma origem.
// Assim as respostas 403 (fim de semana) e 503 (banco) chegam legíveis,
// já que o back-end aplica o CORS só depois desses middlewares.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET ?? 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
});

