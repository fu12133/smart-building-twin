import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './harness',
  testIgnore: 'production.spec.ts',
  // Software-GPU compilation and explicit captures count toward the whole test, not UI latency.
  timeout: process.env.CI ? 90000 : 45000,
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
    // Explicit canvas screenshots provide visual evidence; avoid a second continuous GPU screencast.
    trace: { mode: 'retain-on-failure', screenshots: false, snapshots: true, sources: true },
  },
  webServer: { command: 'npm run dev', url: 'http://127.0.0.1:4187', reuseExistingServer: !process.env.CI, timeout: 30000 },
});
