import { pauseSceneAnimation } from './motion-helpers';
import { test, expect, Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { NIGHT_TIME, WEATHER_ROUTE, weatherFixture } from './weather-fixture';

const state = (page: Page) => page.evaluate(() => window.__BUILDING_HARNESS__!());
const settled = async (page: Page) => expect.poll(async () => (await state(page)).assetsReady, { timeout: process.env.CI ? 45000 : 20000 }).toBe(true);
const imageHash = async (page: Page) => createHash('sha256').update(await page.locator('.scene-host canvas').screenshot({ style: '.scene-section > :not(.scene-host), .scene-labels, .left-panels, .right-panels { visibility: hidden !important; }' })).digest('hex');
async function brightCore(page: Page, point: number[]) {
  expect(Math.abs(point[0])).toBeLessThan(.9); expect(Math.abs(point[1])).toBeLessThan(.9);
  // Inspect rendered pixels around the projected world-space sun, not a DOM sun icon.
  const png = await page.locator('.scene-host canvas').screenshot({ style: '.scene-section > :not(.scene-host), .scene-labels, .left-panels, .right-panels { visibility: hidden !important; }' });
  const core = await page.evaluate(async ({ data, point }) => {
    const img = new Image(); img.src = 'data:image/png;base64,' + data; await img.decode();
    const sample = document.createElement('canvas'); sample.width = img.width; sample.height = img.height;
    const context = sample.getContext('2d')!; context.drawImage(img, 0, 0);
    const x = Math.round((point[0] + 1) / 2 * img.width), y = Math.round((1 - point[1]) / 2 * img.height);
    return Array.from(context.getImageData(x - 2, y - 2, 5, 5).data).filter((_, i) => i % 4 !== 3);
  }, { data: png.toString('base64'), point: point });
  expect(Math.max(...core), 'Default rendered celestial core is bright').toBeGreaterThan(190);
}

test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(NIGHT_TIME);
  await page.route(WEATHER_ROUTE, route => route.fulfill({ json: weatherFixture() }));
});
async function ready(page: Page) {
  await page.goto('/');
  await expect(page.locator('.model-state')).toContainText('医院模型已加载', { timeout: process.env.CI ? 45000 : 20000 });
  await settled(page);
  await pauseSceneAnimation(page);
}

test('S1: visible sunny preview preserves real weather, pose, floor lighting and language state', async ({ page }) => {
  test.setTimeout(process.env.CI ? 180000 : 60000);
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await ready(page); const original = await state(page);
  expect(original.sun.visible).toBe(false); expect(original.moon.visible).toBe(true);
  await brightCore(page, original.moon.screen);
  await page.screenshot({ path: 'artifacts/harness/default-moon-desktop.png' });
  const weather = await page.getByRole('button', { name: '深圳天气', exact: true }).innerText();
  await page.getByRole('button', { name: '2.5D 楼层', exact: true }).click(); await settled(page);
  const floorBefore = await imageHash(page);
  await page.getByRole('button', { name: '3D 院区', exact: true }).click(); await settled(page);
  await page.getByRole('button', { name: '开启日照预览', exact: true }).click(); await settled(page);
  const sunny = await state(page);
  expect(sunny.sun.preview).toBe(true); expect(sunny.sun.visible).toBe(true);
  expect(sunny.camera).toEqual(original.camera); expect(sunny.target).toEqual(original.target);
  await expect(page.getByLabel('外景天气效果', { exact: true })).toContainText('非实时天气');
  expect(await page.getByRole('button', { name: '深圳天气', exact: true }).innerText()).toBe(weather);
  await page.waitForTimeout(500); const sunnyIdle = await state(page);
  await page.waitForTimeout(500); expect((await state(page)).frames).toBe(sunnyIdle.frames);
  await page.screenshot({ path: 'artifacts/harness/sun-preview-default.png' });
  const canvas = page.locator('.scene-host canvas');
  await page.getByRole('button', { name: '观察太阳', exact: true }).click(); await settled(page);
  const sunView = await state(page);
  expect(Math.abs(sunView.sun.screen[0])).toBeLessThan(.9); expect(Math.abs(sunView.sun.screen[1])).toBeLessThan(.9);
  await page.screenshot({ path: 'artifacts/harness/sun-preview-orbit.png' });
  await brightCore(page, sunView.sun.screen);
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.getByLabel('Exterior weather effects', { exact: true })).toContainText('Not live weather');
  expect((await state(page)).camera).toEqual(sunView.camera);
  await page.getByRole('button', { name: '2.5D Floor', exact: true }).click(); await settled(page);
  expect((await state(page)).sun.visible).toBe(false); expect((await state(page)).moon.visible).toBe(false);
  // Canvas label text changes with language; compare the neutral floor after restoring Chinese.
  await page.getByRole('button', { name: '中文', exact: true }).click();
  expect(await imageHash(page)).toBe(floorBefore);
  await page.getByRole('button', { name: '3D 院区', exact: true }).click(); await settled(page);
  expect((await state(page)).camera).toEqual(sunView.camera); expect((await state(page)).sun.visible).toBe(true);
  await page.getByRole('button', { name: '结束日照预览', exact: true }).click(); await settled(page);
  expect((await state(page)).sun.visible).toBe(false);
  await page.getByRole('button', { name: '复位视角', exact: true }).click(); await settled(page);
  expect((await state(page)).camera).toEqual(original.camera);
  await page.waitForTimeout(500); const idle = await state(page);
  await page.waitForTimeout(500); expect((await state(page)).frames).toBe(idle.frames);
  expect(errors).toEqual([]);
});

test('S2: default sun changes to attenuated sun in adverse weather and moon at night', async ({ page }) => {
  test.setTimeout(process.env.CI ? 150000 : 60000);
  const noon = new Date('2026-10-14T04:00:00Z'); let code = 0, cloud = 0, time = noon;
  await page.clock.setFixedTime(noon); await page.unroute(WEATHER_ROUTE);
  await page.route(WEATHER_ROUTE, route => route.fulfill({ json: weatherFixture({ time, code, cloud, precipitation: code === 63 ? 1 : 0 }) }));
  await ready(page); const pose = await state(page);
  expect(pose.sun.visible).toBe(true); expect(pose.sun.preview).toBe(false); expect(pose.moon.visible).toBe(false);
  await brightCore(page, pose.sun.screen);
  await page.screenshot({ path: 'artifacts/harness/default-sun-desktop.png' });
  for (const variant of [{ code: 3, cloud: 100 }, { code: 63, cloud: 100 }, { code: 0, cloud: 0 }]) {
    code = variant.code; cloud = variant.cloud;
    if (code === 0) { time = NIGHT_TIME; await page.clock.setFixedTime(time); }
    await page.getByRole('button', { name: '深圳天气', exact: true }).click();
    await page.getByRole('button', { name: '刷新天气', exact: true }).click();
    await expect(page.getByRole('dialog', { name: '深圳天气详情' })).toContainText(code === 3 ? '阴' : code === 63 ? '中雨' : '晴');
    await expect.poll(async () => (await state(page)).sun.visible).toBe(code !== 0);
    await expect.poll(async () => (await state(page)).moon.visible).toBe(code === 0);
    if (code !== 0) expect((await state(page)).sun.strength).toBeLessThan(pose.sun.strength);
    await page.getByRole('button', { name: '关闭天气详情' }).click();
    expect((await state(page)).camera).toEqual(pose.camera);
  }
  await page.getByRole('button', { name: '开启日照预览', exact: true }).click();
  await expect.poll(async () => (await state(page)).sun.visible).toBe(true);
  await page.getByRole('button', { name: '图层设置', exact: true }).click();
  await page.getByLabel('天气效果', { exact: true }).uncheck();
  await expect(page.getByLabel('晴天日照预览', { exact: true })).not.toBeChecked();
  await expect(page.getByLabel('外景天气效果', { exact: true })).toContainText('展示灯光');
  expect((await state(page)).sun.visible).toBe(false); expect((await state(page)).moon.visible).toBe(false);
});

for (const width of [768, 390]) test(`S3: sunny preview controls remain accessible at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: width === 768 ? 1024 : 844 }); await ready(page);
  expect((await state(page)).moon.visible).toBe(true);
  await brightCore(page, (await state(page)).moon.screen);
  await page.screenshot({ path: `artifacts/harness/default-moon-${width}.png`, fullPage: true });
  await page.getByRole('button', { name: '开启日照预览', exact: true }).click(); await settled(page);
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.getByRole('button', { name: 'End sunlight preview', exact: true })).toBeInViewport();
  await expect(page.getByLabel('Exterior weather effects', { exact: true })).toContainText('Not live weather');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'View the sun', exact: true }).click(); await settled(page);
  const solarPoint = (await state(page)).sun.screen;
  expect(Math.abs(solarPoint[0])).toBeLessThan(.9); expect(Math.abs(solarPoint[1])).toBeLessThan(.9);
  await page.screenshot({ path: `artifacts/harness/sun-preview-${width}.png`, fullPage: true });
});

for (const width of [768, 390]) test(`S4: default daytime sun needs no preview or observation at ${width}px`, async ({ page }) => {
  const time = new Date('2026-10-14T04:00:00Z');
  await page.clock.setFixedTime(time); await page.unroute(WEATHER_ROUTE);
  await page.route(WEATHER_ROUTE, route => route.fulfill({ json: weatherFixture({ time }) }));
  await page.setViewportSize({ width, height: width === 768 ? 1024 : 844 }); await ready(page);
  const initial = await state(page); expect(initial.sun.preview).toBe(false); expect(initial.sun.visible).toBe(true); expect(initial.moon.visible).toBe(false);
  await brightCore(page, initial.sun.screen);
  await page.screenshot({ path: `artifacts/harness/default-sun-${width}.png`, fullPage: true });
});
