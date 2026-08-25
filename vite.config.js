import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: true,
        manualChunks(id) {
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/')) return 'react-vendor';
          if (id.includes('/node_modules/@supabase/')) return 'supabase-vendor';
        },
        entryFileNames: 'assets/app.js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: asset => asset.name?.endsWith('.css') ? 'assets/app.css' : 'assets/[name]-[hash][extname]'
      }
    }
  },
  server: { port: 5173 },
  preview: { port: 4173 }
});
