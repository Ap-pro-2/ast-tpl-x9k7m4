import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/__mocks__/setup.js']
  },
  resolve: {
    alias: {
      'astro:content': path.resolve(__dirname, 'src/__mocks__/astro-content.js')
    }
  }
});