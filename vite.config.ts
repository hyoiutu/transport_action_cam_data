import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],
  base: './',
  test: {
    include: ['src/**/*.tests.*'],
    environment: 'jsdom',
    setupFiles: ['./src/vitest.setup.ts']
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
