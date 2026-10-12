import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

// Visual harness: real pointer/wheel operations, no scene-state mutation.
mkdirSync('artifacts/harness', { recursive: true });
const browser = await chromium.launch({ ...(process.platform === 'win32' ? { channel: 'msedge' } : {}), args: ['--use-angle=swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
const errors = [];
page.on('pageerror', error => errors.push(error.message));
page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
try {
  await page.goto(process.env.PRODUCTION_URL || 'http://127.0.0.1:4187/');
  const canvas = page.locator('.scene-host canvas');
  await canvas.waitFor();
  await page.locator('.model-state').filter({ hasText: '医院模型已加载' }).waitFor();
  await page.waitForTimeout(2500);
  await page.screenshot({ path: 'artifacts/harness/architecture-overview.png', fullPage: true });
  const rect = await canvas.boundingBox();
  await page.mouse.move(rect.x + rect.width * .5, rect.y + rect.height * .55);
  await page.mouse.wheel(0, -200); await page.waitForTimeout(1500);
  await page.screenshot({ path: 'artifacts/harness/architecture-closeup.png', clip: await canvas.boundingBox() });
  await page.mouse.down();
  await page.mouse.move(rect.x + rect.width * .83, rect.y + rect.height * .6, { steps: 24 });
  await page.mouse.up(); await page.waitForTimeout(1500);
  await page.screenshot({ path: 'artifacts/harness/architecture-reverse.png', clip: await canvas.boundingBox() });
  if (errors.length) throw new Error(errors.join('\n'));
  console.log('Architectural overview, zoom and reverse-angle screenshots captured; no browser errors.');
} finally { await browser.close(); }
