import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './harness',
  testIgnore: 'production.spec.ts',
  timeout: 45000,
  expect: { timeout: 12000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list'], ['json', { outputFile: 'artifacts/harness/results.json' }], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4187',
    viewport: { width: 1440, height: 900 },
    browserName: 'chromium',
    channel: process.platform === 'win32' && !process.env.CI ? 'msedge' : undefined,
    launchOptions: { args: ['--use-angle=swiftshader'] },
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:4187', reuseExistingServer: !process.env.CI, timeout: 30000 },
});
