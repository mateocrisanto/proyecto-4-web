import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    cors: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    rollupOptions: {
      input: {
        products: resolve(__dirname, 'src/entries/products.jsx'),
        cart: resolve(__dirname, 'src/entries/cart.jsx'),
        contact: resolve(__dirname, 'src/entries/contact.jsx'),
        adminAsesorias: resolve(__dirname, 'src/entries/admin-asesorias.jsx'),
        chatbot: resolve(__dirname, 'src/entries/chatbot.jsx'),
        adminDashboard: resolve(__dirname, 'src/entries/admin-dashboard.jsx')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
});
