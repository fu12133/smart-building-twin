import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

// Visual evidence only: public UI and read-only development projection, no scene mutation.
const folder = 'artifacts/ci/entrance-motion-frames'; mkdirSync(folder, { recursive: true });
const browser = await chromium.launch({ ...(process.platform === 'win32' ? { channel: 'msedge' } : {}), args: [] });
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 1 });
const errors = []; page.on('pageerror', e => errors.push(e.message));
try {
  await page.goto('http://127.0.0.1:4187/');
  await page.waitForFunction(() => window.__BUILDING_HARNESS__?.().assetsReady);
  const initial = await page.evaluate(() => window.__BUILDING_HARNESS__());
  const rect = await page.locator('.scene-host canvas').boundingBox();
  const points = initial.entranceScreen.corners.map(p => ({ x: rect.x + (p[0] + 1) * rect.width / 2, y: rect.y + (1 - p[1]) * rect.height / 2 }));
  const left = Math.min(...points.map(p => p.x)), top = Math.min(...points.map(p => p.y));
  const clip = { x: Math.max(0, Math.floor(left - 140)), y: Math.max(0, Math.floor(top - 40)), width: 340, height: 220 };
  await page.screenshot({ path: 'artifacts/harness/entrance-motion-overview.png' });
  for (let frame = 0; frame < 24; frame++) {
    await page.screenshot({ path: `${folder}/frame-${String(frame).padStart(3, '0')}.png`, clip });
    await page.waitForTimeout(130);
  }
  const final = await page.evaluate(() => window.__BUILDING_HARNESS__());
  if (errors.length || final.sceneAnimation.billboard.frame <= initial.sceneAnimation.billboard.frame || final.sceneAnimation.pedestrians.frame <= initial.sceneAnimation.pedestrians.frame) throw new Error(JSON.stringify({ errors, initial: initial.sceneAnimation, final: final.sceneAnimation }));
  writeFileSync('artifacts/ci/entrance-motion-capture.json', JSON.stringify({ initial: initial.sceneAnimation, final: final.sceneAnimation, clip, errors }, null, 2));
  console.log('Captured actual moving screen and doorway pedestrians with native GPU; no page errors.');
} finally { await browser.close(); }
