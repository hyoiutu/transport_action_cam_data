import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './src/tests',
  timeout: 30000,
  expect: {
    timeout: 5000
  },
  reporter: 'list',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'electron',
      use: {},
    },
  ],
});
