import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      provider: 'v8',
      include: ['public/js/**/*.js'],
      exclude: [
        'public/js/main.js',
        'public/js/splash-cursor.js',
        'public/js/splash-shaders.js',
        'public/js/webgl-utils.js',
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
    },
  },
});
