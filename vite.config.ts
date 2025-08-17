import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
  base: '/project-scriptly-front',
  plugins: [
    react(),
    svgr(),
    VitePWA({
      registerType: 'autoUpdate',
      // If you want to check it in dev,
      // add the devOptions option to the plugin configuration
      // (you will have the Web App Manifest and the generated service worker)
      // devOptions: {
      //   enabled: true,
      // },
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
      '@app': '/src/app',
      '@pages': '/src/pages',
      '@shared': '/src/shared',
      '@widgets': '/src/widgets',
      '@features': '/src/features',
      '@entities': '/src/entities',
      '@assets': '/src/assets',
    },
  },
});
