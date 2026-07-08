import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['server', 'client', 'shared'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        '**/dist/**',
        '**/*.config.*',
        '**/src/server.ts',
        '**/src/main.tsx',
        '**/src/index.ts',
        'e2e/**',
        'design/**',
        'scripts/**',
      ],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 80,
      },
    },
  },
});
