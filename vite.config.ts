import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/client')
    }
  },
  build: {
    outDir: 'dist/client',
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },
  ssr: {
    noExternal: ['react-router-dom']
  }
});
