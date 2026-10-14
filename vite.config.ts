import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  plugins: [react()],
  // Static files (favicon, PDF, optimised photos). Original photos live in assets-src/ (see npm run images).
  publicDir: 'static',
  server: {
    // The project lives on a network share, where native file watching fails.
    watch: { usePolling: true, interval: 300 },
  },
  build: {
    rollupOptions: {
      // One HTML entry per page, so the original URLs (/privacy.html, /disclaimer.html) keep working
      input: {
        main: resolve(__dirname, 'index.html'),
        privacy: resolve(__dirname, 'privacy.html'),
        disclaimer: resolve(__dirname, 'disclaimer.html'),
        portal: resolve(__dirname, 'dssa-portals/index.html'),
      },
      output: {
        manualChunks: {
          three: ['three'],
          gsap: ['gsap', 'gsap/ScrollTrigger', 'gsap/SplitText', 'gsap/Flip'],
          react: ['react', 'react-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
});
