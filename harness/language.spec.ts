import { test, expect, Page } from '@playwright/test';
import { mkdirSync } from 'node:fs';
import { NIGHT_TIME, WEATHER_ROUTE, weatherFixture } from './weather-fixture';

const snapshot = (page: Page) => page.evaluate(() => (window as any).__BUILDING_HARNESS__());
const chinese = /[\u4e00-\u9fff]/;
mkdirSync('artifacts/harness', { recursive: true });
test.beforeEach(async ({ page }) => {
  await page.clock.setFixedTime(NIGHT_TIME);
  await page.route(WEATHER_ROUTE, route => route.fulfill({ json: weatherFixture() }));
});
async function ready(page: Page) {
  await page.goto('/');
  await expect.poll(async () => page.evaluate(() => typeof (window as any).__BUILDING_HARNESS__), { timeout: 30000 }).toBe('function');
  await expect.poll(async () => (await snapshot(page)).assetsReady, { timeout: process.env.CI ? 45000 : 20000 }).toBe(true);
}
async function englishCopy(page: Page) {
  // Original source filename and the deliberate Chinese language-choice label retain their identities.
  const text = (await page.locator('body').innerText()).replaceAll('项目白模.dwg', '').replaceAll('中文', '');
  expect(text.match(/[\u4e00-\u9fff][^\n]*/g), 'Untranslated visible English UI').toBeNull();
  const labels = await page.locator('[aria-label],[title]').evaluateAll(elements => elements.flatMap(el => [el.getAttribute('aria-label') || '', el.getAttribute('title') || '']));
  expect(labels.filter(label => chinese.test(label)), 'Untranslated accessibility text').toEqual([]);
}

test('L1: English updates all views in place, preserves selection and persists across reload', async ({ page }) => {
  let requests = 0; await page.unroute(WEATHER_ROUTE);
  await page.route(WEATHER_ROUTE, route => { requests++; return route.fulfill({ json: weatherFixture() }); });
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await ready(page);
  const original = await snapshot(page), canvas = await page.locator('.scene-host canvas').elementHandle();
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { name: 'Smart Hospital Management', exact: true })).toBeVisible();
  expect((await snapshot(page)).camera).toEqual(original.camera);
  expect(await canvas!.evaluate(el => el.isConnected)).toBe(true);
  const panelBottom = await page.locator('.right-panels .panel').evaluateAll(panels => Math.max(...panels.map(panel => panel.getBoundingClientRect().bottom)));
  expect(panelBottom, 'English desktop panels fit above the footer').toBeLessThanOrEqual(875);
  await englishCopy(page); await page.screenshot({ path: 'artifacts/harness/language-en-overview.png' });
  for (const name of ['Equipment', 'Access', 'Energy', 'Overview']) {
    await page.getByRole('button', { name, exact: true }).click(); await englishCopy(page);
  }
  await page.getByRole('button', { name: 'Help', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Model controls and provenance' })).toContainText('not survey-verified');
  await englishCopy(page); await page.getByRole('button', { name: 'Close help' }).click();
  await page.getByRole('button', { name: '2.5D Floor', exact: true }).click();
  await page.getByLabel('Select floor', { exact: true }).selectOption('13');
  await page.getByRole('button', { name: 'Select device Water monitor', exact: true }).click();
  const device = page.getByRole('dialog', { name: 'Device details' });
  await expect(device).toContainText('A-13F-WTR-05'); await expect(device).toContainText('schematic');
  await englishCopy(page); await page.screenshot({ path: 'artifacts/harness/language-en-floor.png' });
  const floor = await snapshot(page);
  await page.getByRole('button', { name: '中文', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '设备详情' })).toContainText('A-13F-WTR-05');
  expect((await snapshot(page)).camera).toEqual(floor.camera);
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(device).toContainText('A-13F-WTR-05');
  await page.getByRole('button', { name: 'Close device details' }).click();
  await page.getByRole('button', { name: 'Filter Water', exact: true }).click();
  await englishCopy(page); expect(requests).toBe(1);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Smart Hospital Management' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'English', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: '中文', exact: true }).click();
  await expect(page.getByRole('heading', { name: '智慧医院综合管理平台' })).toBeVisible();
  await page.screenshot({ path: 'artifacts/harness/language-zh-restored.png' });
  expect(errors).toEqual([]);
});

test('L2: English weather keeps Beijing time under a foreign browser timezone and localizes failures', async ({ browser }) => {
  const context = await browser.newContext({ timezoneId: 'America/New_York' }), page = await context.newPage();
  try {
    await page.clock.setFixedTime(NIGHT_TIME);
    await page.route(WEATHER_ROUTE, route => route.fulfill({ json: weatherFixture({ code: 63, precipitation: 1 }) }));
    await ready(page); await page.getByRole('button', { name: 'English', exact: true }).click();
    await expect(page.getByLabel('Beijing time (UTC+8)', { exact: true })).toContainText('20:00:00');
    await expect(page.getByLabel('Beijing time (UTC+8)', { exact: true })).toContainText('Wed');
    await page.getByRole('button', { name: 'Shenzhen weather', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Shenzhen weather details' })).toContainText('Not onsite measurements');
    await englishCopy(page); await page.screenshot({ path: 'artifacts/harness/language-en-weather.png' });
    await page.unroute(WEATHER_ROUTE); await page.route(WEATHER_ROUTE, route => route.abort());
    await page.getByRole('button', { name: 'Refresh weather', exact: true }).click();
    await expect(page.getByRole('dialog', { name: 'Shenzhen weather details' })).toContainText('Weather update failed');
    await englishCopy(page);
    await page.getByRole('button', { name: 'Close weather details' }).click();
    await page.locator('.scene-host canvas').evaluate(canvas => canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
    await expect(page.getByRole('alert')).toContainText('Graphics context lost');
    await expect(page.getByRole('button', { name: 'Reload', exact: true })).toBeVisible(); await englishCopy(page);
  } finally { await context.close(); }
});

for (const width of [768, 390]) test(`L3: English controls and panels remain usable at ${width}px`, async ({ page }) => {
  await page.setViewportSize({ width, height: width === 768 ? 1024 : 844 }); await ready(page);
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.getByRole('button', { name: '中文', exact: true })).toBeInViewport();
  await page.getByRole('button', { name: 'Scene layers', exact: true }).click();
  await expect(page.getByLabel('Original hospital design', { exact: true })).toBeInViewport();
  await page.getByRole('button', { name: 'Scene layers', exact: true }).click();
  await englishCopy(page); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `artifacts/harness/language-en-${width}.png`, fullPage: true });
  await page.getByRole('button', { name: '2.5D Floor', exact: true }).click();
  await page.getByRole('button', { name: 'Select device Smoke detector', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Device details' })).toBeInViewport();
  await englishCopy(page); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: `artifacts/harness/language-en-floor-${width}.png`, fullPage: true });
});

test('L4: denied preference storage does not prevent language selection', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => { throw new DOMException('Storage denied', 'SecurityError'); };
    Storage.prototype.setItem = () => { throw new DOMException('Storage denied', 'SecurityError'); };
  });
  await ready(page); await expect(page.getByRole('heading', { name: '智慧医院综合管理平台' })).toBeVisible();
  await page.getByRole('button', { name: 'English', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Smart Hospital Management' })).toBeVisible();
  await page.getByRole('button', { name: '中文', exact: true }).click();
  await expect(page.getByRole('heading', { name: '智慧医院综合管理平台' })).toBeVisible(); expect(errors).toEqual([]);
});
