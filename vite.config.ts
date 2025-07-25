import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Permite que o Vite seja acessado pela rede
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
