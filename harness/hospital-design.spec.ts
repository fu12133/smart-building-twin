import { test, expect, Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { NIGHT_TIME, WEATHER_ROUTE, weatherFixture } from './weather-fixture';

const state = (page: Page) => page.evaluate(() => (window as any).__BUILDING_HARNESS__());
const fingerprint = (data: Buffer) => createHash('sha256').update(data).digest('hex');
// Exterior mode changes can recompile software-GPU pipelines; keep this separate from UI latency.
const renderTimeout = process.env.CI ? 45000 : 12000;
mkdirSync('artifacts/harness', { recursive: true });
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(NIGHT_TIME);
  await page.route(WEATHER_ROUTE, route => route.fulfill({ json: weatherFixture() }));
});
async function ready(page: Page) {
  await page.goto('/');
  await expect(page.locator('.model-state')).toContainText('医院模型已加载', { timeout: process.env.CI ? 45000 : 20000 });
  await expect.poll(async () => (await state(page)).assetsReady, { timeout: process.env.CI ? 45000 : 20000 }).toBe(true);
}

test('D1: original proposal toggles real rendered detail without moving the source or camera', async ({ page }) => {
  test.setTimeout(process.env.CI ? 180000 : 45000);
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await ready(page);
  await expect(page.locator('.scene-info')).toContainText('原创现代医院');
  const original = await state(page); expect(original.originalProposal).toBe(true); expect(original.proposalDetails).toBeGreaterThan(100);
  await page.screenshot({ path: 'artifacts/harness/original-hospital-night.png' });
  const design = await page.locator('.scene-host canvas').screenshot();
  await page.getByRole('button', { name: '图层设置' }).click();
  await page.getByLabel('原创医院方案', { exact: true }).uncheck();
  await expect.poll(async () => (await state(page)).assetsReady, { timeout: renderTimeout }).toBe(true);
  const source = await state(page);
  expect(source.camera).toEqual(original.camera); expect(source.target).toEqual(original.target);
  // Render counters also include one-off sky cube conversion and shadow passes.
  expect(source.visibleTriangles).toBeLessThan(original.visibleTriangles - 1000);
  await expect(page.locator('.scene-info')).toContainText('源白模形体');
  await page.getByRole('button', { name: '图层设置' }).click();
  expect(fingerprint(await page.locator('.scene-host canvas').screenshot())).not.toBe(fingerprint(design));
  await page.screenshot({ path: 'artifacts/harness/original-hospital-source.png' });
  await page.getByRole('button', { name: '2.5D 楼层' }).click();
  await page.getByRole('button', { name: '3D 院区' }).click();
  await expect.poll(async () => (await state(page)).assetsReady, { timeout: renderTimeout }).toBe(true);
  expect((await state(page)).originalProposal).toBe(false);
  expect((await state(page)).camera).toEqual(original.camera);
  await page.getByRole('button', { name: '图层设置' }).click();
  await page.getByLabel('原创医院方案', { exact: true }).check();
  await page.getByRole('button', { name: '图层设置' }).click();
  await expect.poll(async () => (await state(page)).assetsReady, { timeout: renderTimeout }).toBe(true);
  const restored = await state(page); expect(restored.visibleTriangles).toBe(original.visibleTriangles);
  for (let i = 0; i < 3; i++) {
    await page.getByRole('button', { name: '2.5D 楼层' }).click();
    await expect.poll(async () => (await state(page)).assetsReady, { timeout: renderTimeout }).toBe(true);
    await page.getByRole('button', { name: '3D 院区' }).click();
    await expect.poll(async () => (await state(page)).assetsReady, { timeout: renderTimeout }).toBe(true);
  }
  expect((await state(page)).gpuGeometries).toBe(restored.gpuGeometries);
  const canvas = page.locator('.scene-host canvas'), rect = (await canvas.boundingBox())!;
  await page.mouse.move(rect.x + rect.width * .5, rect.y + rect.height * .58); await page.mouse.down();
  await page.mouse.move(rect.x + rect.width * .75, rect.y + rect.height * .56, { steps: 8 }); await page.mouse.up();
  await expect.poll(async () => Math.abs((await state(page)).camera[0] - original.camera[0])).toBeGreaterThan(5);
  await expect.poll(async () => (await state(page)).assetsReady, { timeout: renderTimeout }).toBe(true);
  await page.screenshot({ path: 'artifacts/harness/original-hospital-rotated.png' });
  expect(errors).toEqual([]);
});

test('D2: original proposal renders in daylight and recovers after reload', async ({ page }) => {
  const day = new Date('2026-10-14T04:00:00Z');
  await page.clock.setFixedTime(day); await page.unroute(WEATHER_ROUTE);
  await page.route(WEATHER_ROUTE, route => route.fulfill({ json: weatherFixture({ time: day }) }));
  await ready(page); await expect(page.getByLabel('外景天气效果')).toContainText('日间');
  await page.screenshot({ path: 'artifacts/harness/original-hospital-day.png' });
  const first = await state(page);
  await page.locator('.scene-host canvas').evaluate(c => c.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
  await page.getByRole('button', { name: '重新加载' }).click();
  await expect(page.locator('.model-state')).toContainText('医院模型已加载', { timeout: 30000 });
  await expect.poll(async () => (await state(page)).assetsReady, { timeout: renderTimeout }).toBe(true);
  expect((await state(page)).proposalDetails).toBe(first.proposalDetails);
  await expect(page.locator('.scene-host canvas')).toHaveCount(1);
});

for (const width of [768, 390]) test(`D3: original proposal control is usable at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: width === 768 ? 1024 : 844 }); await ready(page);
  await page.getByRole('button', { name: '图层设置' }).click();
  await expect(page.getByLabel('原创医院方案', { exact: true })).toBeInViewport();
  await page.getByLabel('原创医院方案', { exact: true }).uncheck();
  await expect.poll(async () => (await state(page)).originalProposal).toBe(false);
  await page.getByLabel('原创医院方案', { exact: true }).check();
  await page.getByRole('button', { name: '图层设置' }).click();
  await expect.poll(async () => (await state(page)).assetsReady, { timeout: renderTimeout }).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `artifacts/harness/original-hospital-${width}.png`, fullPage: true });
});

test('E1: hospital has rendered visual emphasis and context finishes restore exactly', async ({ page }) => {
  test.setTimeout(process.env.CI ? 180000 : 60000);
  await ready(page); const original = await state(page);
  const png = await page.locator('.scene-host canvas').screenshot({ style: '.scene-section > :not(.scene-host), .scene-labels, .left-panels, .right-panels { visibility: hidden !important; }' });
  const contrast = await page.evaluate(async data => {
    const image = new Image(); image.src = 'data:image/png;base64,' + data; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
    const context = canvas.getContext('2d')!; context.drawImage(image, 0, 0);
    const mean = (x: number, y: number, w: number, h: number) => {
      const pixels = context.getImageData(Math.floor(x * image.width), Math.floor(y * image.height), Math.floor(w * image.width), Math.floor(h * image.height)).data;
      let sum = 0; for (let i = 0; i < pixels.length; i += 4) sum += .2126 * pixels[i] + .7152 * pixels[i + 1] + .0722 * pixels[i + 2];
      return sum / (pixels.length / 4);
    };
    // Inspected default source tower and central context facades, with HUD hidden.
    return { hospital: mean(.57, .2, .07, .45), context: mean(.34, .22, .10, .32) };
  }, png.toString('base64'));
  expect(contrast.hospital).toBeGreaterThan(contrast.context * 1.6);
  await page.screenshot({ path: 'artifacts/harness/hospital-emphasis-night.png' });
  await page.getByRole('button', { name: '图层设置' }).click();
  await page.getByLabel('原创医院方案', { exact: true }).uncheck();
  await expect.poll(async () => (await state(page)).assetsReady, { timeout: renderTimeout }).toBe(true);
  const source = await state(page);
  expect(source.camera).toEqual(original.camera);
  expect(source.contextFinishes).not.toEqual(original.contextFinishes);
  await page.getByLabel('原创医院方案', { exact: true }).check();
  await page.getByRole('button', { name: '图层设置' }).click();
  await expect.poll(async () => (await state(page)).assetsReady, { timeout: renderTimeout }).toBe(true);
  expect((await state(page)).contextFinishes).toEqual(original.contextFinishes);
  expect((await state(page)).visibleTriangles).toBe(original.visibleTriangles);
  await page.getByRole('button', { name: '查看完整白模', exact: true }).click();
  await expect.poll(async () => (await state(page)).assetsReady, { timeout: renderTimeout }).toBe(true);
  expect((await state(page)).contextFinishes).toEqual(source.contextFinishes);
  await page.getByRole('button', { name: '复位视角', exact: true }).click();
  await expect.poll(async () => (await state(page)).assetsReady, { timeout: renderTimeout }).toBe(true);
  expect((await state(page)).contextFinishes).toEqual(original.contextFinishes);
  expect((await state(page)).camera).toEqual(original.camera);
});
