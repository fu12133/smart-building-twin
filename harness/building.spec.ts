import { test, expect, Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';

type Snapshot = { camera: number[]; target: number[]; distance: number; frames: number; objects: number; mode: string; auto: boolean; autoActive: boolean; selected: string; floor: number; devicesVisible: boolean; surroundingsVisible: boolean; assetsReady: boolean };
const snapshot = (page: Page): Promise<Snapshot> => page.evaluate(() => (window as any).__BUILDING_HARNESS__());
const delta = (a: number[], b: number[]) => Math.sqrt(a.reduce((v, n, i) => v + (n - b[i]) ** 2, 0));
const errors = new Map<Page, string[]>();
mkdirSync('artifacts/harness', { recursive: true });
test.beforeEach(async ({ page }) => {
  const messages: string[] = []; errors.set(page, messages);
  page.on('pageerror', e => messages.push(e.message));
  page.on('console', m => { if (m.type() === 'error') messages.push(m.text()); });
});
test.afterEach(async ({ page }) => { expect(errors.get(page), 'Unexpected browser errors').toEqual([]); });
async function ready(page: Page) {
  await page.goto('/');
  await expect(page.locator('.data-source')).toContainText('演示数据');
  await expect.poll(async () => (await snapshot(page)).frames).toBeGreaterThan(0);
  await expect.poll(async () => (await snapshot(page)).assetsReady).toBe(true);
  expect((await snapshot(page)).objects).toBeGreaterThan(1000);
}

test('V1: real pointer rotation changes camera and rendered image', async ({ page }) => {
  // Cold SwiftShader compilation + three explicit screenshots are not an interaction-latency benchmark.
  test.setTimeout(process.env.CI ? 90000 : 45000);
  await ready(page);
  const canvas = page.locator('.scene-host canvas');
  const before = await snapshot(page);
  const imageBefore = await canvas.screenshot();
  const rect = (await canvas.boundingBox())!;
  await page.mouse.move(rect.x + rect.width * 0.48, rect.y + rect.height * 0.53);
  await page.mouse.down();
  await page.mouse.move(rect.x + rect.width * 0.73, rect.y + rect.height * 0.58, { steps: 20 });
  await page.mouse.up();
  await expect.poll(async () => delta((await snapshot(page)).camera, before.camera)).toBeGreaterThan(20);
  const imageAfter = await canvas.screenshot();
  expect(createHash('sha256').update(imageBefore).digest('hex')).not.toBe(createHash('sha256').update(imageAfter).digest('hex'));
  await page.screenshot({ path: 'artifacts/harness/rotated-desktop.png' });
});

test('V2: wheel zoom, right-button pan, keyboard and reset', async ({ page }) => {
  await ready(page);
  const original = await snapshot(page);
  const layout = await page.evaluate(() => ({ height: innerHeight, panelBottom: Math.max(...[...document.querySelectorAll('.left-panels .panel,.right-panels .panel')].map(e => e.getBoundingClientRect().bottom)) }));
  expect(layout.panelBottom, 'Desktop panels fit the screen').toBeLessThanOrEqual(layout.height - 35);
  const canvas = page.locator('.scene-host canvas');
  const rect = (await canvas.boundingBox())!;
  await page.mouse.move(rect.x + rect.width * .5, rect.y + rect.height * .62);
  await page.mouse.wheel(0, -300);
  await expect.poll(async () => (await snapshot(page)).distance).toBeLessThan(original.distance * .95);
  await page.mouse.down({ button: 'right' });
  await page.mouse.move(rect.x + rect.width * .6, rect.y + rect.height * .6, { steps: 12 });
  await page.mouse.up({ button: 'right' });
  await expect.poll(async () => delta((await snapshot(page)).target, original.target)).toBeGreaterThan(1);
  await canvas.focus();
  const keyboardBefore = await snapshot(page);
  await page.keyboard.press('ArrowLeft');
  await expect.poll(async () => delta((await snapshot(page)).camera, keyboardBefore.camera)).toBeGreaterThan(2);
  await page.getByRole('button', { name: '复位视角' }).click();
  await expect.poll(async () => delta((await snapshot(page)).camera, original.camera)).toBeLessThan(.01);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'artifacts/harness/overview-desktop.png' });
});

test('V3: automatic rotation starts and actually stops', async ({ page }) => {
  await ready(page);
  const start = await snapshot(page);
  await page.getByRole('button', { name: '自动巡航' }).click();
  await expect.poll(async () => delta((await snapshot(page)).camera, start.camera)).toBeGreaterThan(3);
  await page.getByRole('button', { name: '暂停巡航' }).click();
  expect((await snapshot(page)).autoActive).toBe(false);
  await page.waitForTimeout(1300); // Allow OrbitControls damping to settle.
  const paused = await snapshot(page);
  await page.waitForTimeout(700);
  expect(delta((await snapshot(page)).camera, paused.camera)).toBeLessThan(.05);
});

test('V4: select building, switch floor, select device and restore 3D pose', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: '选择B座' }).click();
  await expect(page.locator('.building-name')).toContainText('B座 · 创新中心');
  expect((await snapshot(page)).selected).toBe('B');
  const before = await snapshot(page);
  await page.getByRole('button', { name: '2.5D 楼层' }).click();
  await page.getByLabel('选择楼层').selectOption('12');
  await expect(page.getByRole('heading', { name: 'B座 · 12F 电子地图' })).toBeVisible();
  await page.getByRole('button', { name: '选择设备 烟感探测器' }).click();
  await expect(page.getByRole('dialog', { name: '设备详情' })).toContainText('B-12F-SMK-03');
  await expect(page.getByRole('dialog', { name: '设备详情' })).toContainText('告警');
  await page.screenshot({ path: 'artifacts/harness/floor-device-desktop.png' });
  await page.getByRole('button', { name: '关闭设备详情' }).click();
  await page.getByLabel('选择楼层').selectOption('20');
  await expect(page.getByRole('heading', { name: 'B座 · 20F 电子地图' })).toBeVisible();
  await page.getByRole('button', { name: '3D 园区' }).click();
  await expect.poll(async () => delta((await snapshot(page)).camera, before.camera)).toBeLessThan(.1);
});

test('V5: layers toggle geometry and labels; auto preference persists across modes', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: '自动巡航' }).click();
  await page.getByRole('button', { name: '2.5D 楼层' }).click();
  expect((await snapshot(page)).autoActive).toBe(false);
  await expect(page.getByRole('button', { name: '暂停巡航' })).toBeDisabled();
  await page.getByRole('button', { name: '图层设置' }).click();
  await page.getByLabel('设备点位', { exact: true }).uncheck();
  await expect(page.getByRole('button', { name: '选择设备 烟感探测器' })).toBeHidden();
  expect((await snapshot(page)).devicesVisible).toBe(false);
  await page.getByLabel('设备点位', { exact: true }).check();
  await expect(page.getByRole('button', { name: '选择设备 烟感探测器' })).toBeVisible();
  await page.getByLabel('周边建筑', { exact: true }).uncheck();
  expect((await snapshot(page)).surroundingsVisible).toBe(false);
  await page.getByRole('button', { name: '3D 园区' }).click();
  expect((await snapshot(page)).autoActive).toBe(true);
});

test('D1: view navigation, alarm location and floor limits are linked', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: '能源分析', exact: true }).click();
  await expect(page.getByRole('heading', { name: '今日用电趋势' })).toBeVisible();
  await expect(page.locator('.metrics')).toContainText('碳排放量');
  await page.getByRole('button', { name: '通行统计', exact: true }).click();
  await expect(page.locator('.metrics')).toContainText('今日访客');
  await page.getByRole('button', { name: '设备物联', exact: true }).click();
  await page.getByRole('button', { name: /烟感探测器异常/ }).click();
  await expect(page.getByRole('dialog', { name: '设备详情' })).toContainText('SMK-03');
  await page.getByRole('button', { name: '关闭设备详情' }).click();
  await page.getByLabel('选择楼层').selectOption('32');
  await page.getByLabel('选择楼宇').selectOption('C');
  await expect(page.getByLabel('选择楼层')).toHaveValue('20');
  await expect(page.getByRole('heading', { name: 'C座 · 20F 电子地图' })).toBeVisible();
  await page.getByRole('button', { name: /空调温度超出阈值/ }).click();
  await expect(page.getByRole('dialog', { name: '设备详情' })).toContainText('A-12F-AC-01');
});

for (const viewport of [{ width: 768, height: 1024 }, { width: 390, height: 844 }]) {
  test(`D2: usable responsive viewport ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await ready(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await page.getByRole('button', { name: '2.5D 楼层' }).click();
    await page.getByRole('button', { name: '选择设备 空调机组' }).click();
    await expect(page.getByRole('dialog', { name: '设备详情' })).toContainText('AC-01');
    await page.getByRole('button', { name: '关闭设备详情' }).click();
    await page.getByRole('button', { name: '3D 园区' }).click();
    await page.screenshot({ path: `artifacts/harness/overview-${viewport.width}.png`, fullPage: true });
  });
}

test('V6: lost graphics context produces recovery UI', async ({ page }) => {
  await ready(page);
  // Controlled browser-failure injection, not a user interaction shortcut.
  await page.locator('.scene-host canvas').evaluate(canvas => canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
  await expect(page.getByRole('alert')).toContainText('上下文已丢失');
  await expect(page.getByRole('button', { name: '重新加载' })).toBeVisible();
  await page.getByRole('button', { name: '重新加载' }).click();
  await expect(page.getByRole('alert')).toBeHidden();
  await expect.poll(async () => (await snapshot(page)).frames).toBeGreaterThan(0);
});

test('V7: idle scene stops GPU redraws and controls/layers redraw visible geometry', async ({ page }) => {
  await ready(page);
  const idle = await snapshot(page);
  await page.waitForTimeout(400);
  expect((await snapshot(page)).frames).toBe(idle.frames);
  await page.getByRole('button', { name: '放大模型' }).click();
  await expect.poll(async () => (await snapshot(page)).frames).toBeGreaterThan(idle.frames);
  await page.getByRole('button', { name: '图层设置' }).click();
  const visible = await snapshot(page);
  const canvas = page.locator('.scene-host canvas');
  const before = await canvas.screenshot();
  await page.getByLabel('周边建筑', { exact: true }).uncheck();
  await expect.poll(async () => (await snapshot(page)).frames).toBeGreaterThan(visible.frames);
  const after = await canvas.screenshot();
  expect(createHash('sha256').update(after).digest('hex')).not.toBe(createHash('sha256').update(before).digest('hex'));
});

test('V8: delayed night asset finishing after scene reload leaves a usable single renderer', async ({ page }) => {
  let requests = 0;
  await page.route('**/assets/night-city.hdr', async route => {
    requests++;
    const response = await route.fetch();
    await new Promise(resolve => setTimeout(resolve, 6000));
    await route.fulfill({ response });
  });
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => (window as any).__BUILDING_HARNESS__?.().frames ?? 0)).toBeGreaterThan(0);
  expect((await snapshot(page)).assetsReady).toBe(false);
  await page.locator('.scene-host canvas').evaluate(canvas => canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
  await page.getByRole('button', { name: '重新加载' }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__BUILDING_HARNESS__?.().assetsReady ?? false)).toBe(true);
  await page.waitForTimeout(700);
  await expect(page.locator('.scene-host canvas')).toHaveCount(1);
  await expect(page.getByRole('alert')).toBeHidden();
  expect(requests).toBeGreaterThanOrEqual(2);
  const before = await snapshot(page);
  await page.getByRole('button', { name: '放大模型' }).click();
  await expect.poll(async () => (await snapshot(page)).distance).toBeLessThan(before.distance);
});
