import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: '.',
  testMatch: 'production.spec.ts',
  outputDir: '../test-results-production',
  timeout: 45000,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: '../artifacts/harness/production-results.json' }]],
  use: {
    baseURL: process.env.PRODUCTION_URL || 'http://127.0.0.1:4188/smart-building-twin/',
    viewport: { width: 1440, height: 900 },
    browserName: 'chromium',
    channel: process.platform === 'win32' && !process.env.CI ? 'msedge' : undefined,
    launchOptions: { args: ['--use-angle=swiftshader'] },
    screenshot: 'only-on-failure',
  },
});
