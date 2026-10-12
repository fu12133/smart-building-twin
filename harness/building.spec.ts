import { test, expect, Page } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdirSync } from 'node:fs';

type Snapshot = { camera: number[]; target: number[]; distance: number; frames: number; objects: number; mode: string; auto: boolean; autoActive: boolean; selected: string; floor: number; devicesVisible: boolean; surroundingsVisible: boolean; assetsReady: boolean };
const snapshot = (page: Page): Promise<Snapshot> => page.evaluate(() => (window as any).__BUILDING_HARNESS__());
const delta = (a: number[], b: number[]) => Math.sqrt(a.reduce((v, n, i) => v + (n - b[i]) ** 2, 0));
const errors = new Map<Page, string[]>();
// Cold software-GPU shader/texture initialization is separate from the 12s UI assertion budget.
const initializationTimeout = process.env.CI ? 45000 : 12000;
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
  await expect.poll(async () => (await snapshot(page)).frames, { timeout: initializationTimeout }).toBeGreaterThan(0);
  await expect.poll(async () => (await snapshot(page)).assetsReady, { timeout: initializationTimeout }).toBe(true);
  expect((await snapshot(page)).objects).toBeGreaterThan(1000);
  await expect(page.locator('.model-state')).toContainText('医院模型已加载');
  await expect(page.locator('.asset-credit')).toContainText('项目白模.dwg');
}

test('V1: real pointer rotation changes camera and rendered image', async ({ page }) => {
  // Cold SwiftShader compilation + three explicit screenshots are not an interaction-latency benchmark.
  test.setTimeout(process.env.CI ? 120000 : 45000);
  await ready(page);
  const canvas = page.locator('.scene-host canvas');
  const before = await snapshot(page);
  const rect = (await canvas.boundingBox())!;
  const imageBefore = await page.screenshot({ clip: rect });
  await page.mouse.move(rect.x + rect.width * 0.48, rect.y + rect.height * 0.53);
  await page.mouse.down();
  await page.mouse.move(rect.x + rect.width * 0.73, rect.y + rect.height * 0.58, { steps: 8 });
  await page.mouse.up();
  await expect.poll(async () => delta((await snapshot(page)).camera, before.camera)).toBeGreaterThan(20);
  const imageAfter = await page.screenshot({ clip: rect });
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
  await page.getByRole('button', { name: '选择B区' }).click();
  await expect(page.locator('.building-name')).toContainText('B区 · 裙房');
  expect((await snapshot(page)).selected).toBe('B');
  const before = await snapshot(page);
  await page.getByRole('button', { name: '2.5D 楼层' }).click();
  await page.getByLabel('选择楼层').selectOption('3');
  await expect(page.getByRole('heading', { name: 'B区 · 3F 电子地图' })).toBeVisible();
  await page.getByRole('button', { name: '选择设备 烟感探测器' }).click();
  await expect(page.getByRole('dialog', { name: '设备详情' })).toContainText('B-3F-SMK-03');
  await expect(page.getByRole('dialog', { name: '设备详情' })).toContainText('告警');
  await page.screenshot({ path: 'artifacts/harness/floor-device-desktop.png' });
  await page.getByRole('button', { name: '关闭设备详情' }).click();
  await page.getByLabel('选择楼层').selectOption('6');
  await expect(page.getByRole('heading', { name: 'B区 · 6F 电子地图' })).toBeVisible();
  await page.getByRole('button', { name: '3D 院区' }).click();
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
  await page.getByRole('button', { name: '3D 院区' }).click();
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
  await page.getByLabel('选择楼宇').selectOption('A');
  await page.getByLabel('选择楼层').selectOption('18');
  await page.getByLabel('选择楼宇').selectOption('B');
  await expect(page.getByLabel('选择楼层')).toHaveValue('6');
  await expect(page.getByRole('heading', { name: 'B区 · 6F 电子地图' })).toBeVisible();
  await page.getByRole('button', { name: /空调温度超出阈值/ }).click();
  await expect(page.getByRole('dialog', { name: '设备详情' })).toContainText('A-2F-AC-01');
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
    await page.getByRole('button', { name: '3D 院区' }).click();
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
  await expect.poll(async () => (await snapshot(page)).frames, { timeout: initializationTimeout }).toBeGreaterThan(0);
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
  test.setTimeout(process.env.CI ? 120000 : 45000);
  let requests = 0;
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/assets/night-city.hdr', async route => {
    requests++;
    const response = await route.fetch();
    await gate;
    await route.fulfill({ response });
  });
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => (window as any).__BUILDING_HARNESS__?.().frames ?? 0), { timeout: initializationTimeout }).toBeGreaterThan(0);
  expect((await snapshot(page)).assetsReady).toBe(false);
  await page.locator('.scene-host canvas').evaluate(canvas => canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
  await page.getByRole('button', { name: '重新加载' }).click();
  release(); // Finish the old request only after actual scene teardown/reload, regardless of GPU speed.
  await expect.poll(() => page.evaluate(() => (window as any).__BUILDING_HARNESS__?.().assetsReady ?? false), { timeout: initializationTimeout }).toBe(true);
  await page.waitForTimeout(700);
  await expect(page.locator('.scene-host canvas')).toHaveCount(1);
  await expect(page.getByRole('alert')).toBeHidden();
  expect(requests).toBeGreaterThanOrEqual(2);
  const before = await snapshot(page);
  await page.getByRole('button', { name: '放大模型' }).click();
  await expect.poll(async () => (await snapshot(page)).distance).toBeLessThan(before.distance);
});

test('H1: delayed hospital model completing after reload leaves a usable single scene', async ({ page }) => {
  test.setTimeout(process.env.CI ? 120000 : 45000);
  let requests = 0;
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  await page.route('**/assets/project-hospital.glb', async route => {
    requests++; const response = await route.fetch(); await gate; await route.fulfill({ response });
  });
  await page.goto('/');
  await expect(page.locator('.model-state')).toContainText('医院模型加载中');
  await expect.poll(() => page.evaluate(() => (window as any).__BUILDING_HARNESS__?.().frames ?? 0), { timeout: initializationTimeout }).toBeGreaterThan(0);
  await page.locator('.scene-host canvas').evaluate(canvas => canvas.dispatchEvent(new Event('webglcontextlost', { cancelable: true })));
  await page.getByRole('button', { name: '重新加载' }).click();
  release();
  await expect.poll(() => page.evaluate(() => (window as any).__BUILDING_HARNESS__?.().assetsReady ?? false), { timeout: initializationTimeout }).toBe(true);
  await expect(page.locator('.scene-host canvas')).toHaveCount(1);
  await expect(page.locator('.model-state')).toContainText('医院模型已加载');
  expect(requests).toBeGreaterThanOrEqual(2);
  const before = await snapshot(page);
  await page.getByRole('button', { name: '放大模型' }).click();
  await expect.poll(async () => (await snapshot(page)).distance).toBeLessThan(before.distance);
});

test('H2: invalid hospital asset shows actionable failure and reload recovers', async ({ page }) => {
  test.setTimeout(process.env.CI ? 120000 : 45000);
  await page.route('**/assets/project-hospital.glb', route => route.fulfill({ status: 200, contentType: 'model/gltf-binary', body: 'invalid model' }));
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('医院模型加载失败');
  await page.unroute('**/assets/project-hospital.glb');
  await page.getByRole('button', { name: '重新加载' }).click();
  await expect.poll(() => page.evaluate(() => (window as any).__BUILDING_HARNESS__?.().assetsReady ?? false), { timeout: initializationTimeout }).toBe(true);
  await expect(page.getByRole('alert')).toBeHidden();
  await expect(page.locator('.scene-host canvas')).toHaveCount(1);
});

test('H3: empty campus foreground preserves source zone selection', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: '选择B区' }).click();
  const canvas = page.locator('.scene-host canvas');
  const rect = (await canvas.boundingBox())!;
  // Empty foreground plaza in the inspected default overview, away from overlays and buildings.
  await canvas.click({ position: { x: rect.width * .72, y: rect.height * .79 } });
  expect((await snapshot(page)).selected).toBe('B');
  await expect(page.locator('.building-name')).toContainText('裙房');
});

test('W1: project scope, retained floors and basements follow the supplied brief', async ({ page }) => {
  await ready(page);
  await expect(page.locator('.small-stats')).toContainText('28,426');
  await expect(page.locator('.small-stats')).toContainText('18+2');
  await expect(page.getByLabel('选择楼宇').locator('option')).toHaveCount(2);
  await page.getByRole('button', { name: '2.5D 楼层' }).click();
  await page.getByLabel('选择楼层').selectOption('18');
  await expect(page.getByRole('heading', { name: 'A区 · 18F 电子地图' })).toBeVisible();
  for (const floor of ['13', '14']) {
    await page.getByLabel('选择楼层').selectOption(floor);
    await expect(page.locator('.project-scope')).toContainText('保留原有功能');
  }
  await page.getByLabel('选择楼层').selectOption('-2');
  await expect(page.getByRole('heading', { name: 'A区 · B2 电子地图' })).toBeVisible();
  await expect(page.locator('.project-scope')).toContainText('地下部分改造');
  await page.getByRole('button', { name: '选择设备 空调机组' }).click();
  await expect(page.getByRole('dialog', { name: '设备详情' })).toContainText('A-B2-AC-01');
  await page.getByRole('button', { name: '关闭设备详情' }).click();
  await page.getByLabel('选择楼宇').selectOption('B');
  await expect(page.getByLabel('选择楼层')).toHaveValue('-2');
  await expect(page.getByLabel('选择楼层').locator('option[value="0"]')).toHaveCount(0);
  await expect(page.getByLabel('选择楼层').locator('option[value="7"]')).toHaveCount(0);
  await page.getByRole('button', { name: '操作帮助' }).click();
  await expect(page.getByRole('dialog', { name: '模型操作帮助' })).toContainText('未强行拉伸');
});

test('W2: packaged mesh retains traceable source geometry and project calibration', async ({ page }) => {
  const manifest = await (await page.request.get('/assets/project-model.json')).json();
  const binary = await (await page.request.get('/assets/project-hospital.glb')).body();
  expect(manifest.sourceName).toBe('项目白模.dwg');
  expect(manifest.sourceSha256).toBe('bdab765f1b3c4a486557809395292e1295641687490bcb85f8bc509a6055e564');
  expect(createHash('sha256').update(binary).digest('hex')).toBe(manifest.glbSha256);
  expect(manifest.sourceHandles).toEqual([584]);
  expect(manifest.uniformScale * 205).toBeCloseTo(69.5, 6);
  expect(manifest.bounds.max[0] - manifest.bounds.min[0]).toBeCloseTo(72.59, 1);
  expect(binary.readUInt32LE(0)).toBe(0x46546c67);
  const jsonLength = binary.readUInt32LE(12);
  const gltf = JSON.parse(binary.subarray(20, 20 + jsonLength).toString());
  expect([...new Set(gltf.nodes.map((node: any) => node.extras.building))].sort()).toEqual(['A', 'B']);
  expect(gltf.nodes.every((node: any) => node.extras.sourceHandle === 584)).toBe(true);
  expect(gltf.accessors.filter((a: any) => a.type === 'VEC3').reduce((sum: number, a: any) => sum + a.count, 0) / 6).toBe(manifest.triangles);
});

test('W3: source tower and podium meshes select their own zones through pointer picking', async ({ page }) => {
  await ready(page);
  const canvas = page.locator('.scene-host canvas'), rect = (await canvas.boundingBox())!;
  await page.getByRole('button', { name: '选择B区' }).click();
  // Inspected default view: tower glass and podium roof, away from floating labels/overlays.
  await canvas.click({ position: { x: rect.width * .63, y: rect.height * .4 } });
  await expect(page.locator('.building-name')).toContainText('A区 · 塔楼');
  await canvas.click({ position: { x: rect.width * .42, y: rect.height * .64 } });
  await expect(page.locator('.building-name')).toContainText('B区 · 裙房');
});

test('F1: floor rail bounds, real floor rotation and exact 3D restoration', async ({ page }) => {
  await ready(page);
  const original = await snapshot(page);
  await page.getByRole('button', { name: '2.5D 楼层' }).click();
  await expect(page.getByRole('button', { name: '切换到 2F', exact: true })).toBeInViewport();
  await page.getByRole('button', { name: '切换到 18F', exact: true }).click();
  await expect(page.getByLabel('选择楼层')).toHaveValue('18');
  await page.getByLabel('选择楼宇').selectOption('B');
  await expect(page.getByRole('button', { name: '切换到 6F', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: '切换到 7F', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: '切换到 0F', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '切换到 B2', exact: true }).click();
  await expect(page.getByLabel('选择楼层')).toHaveValue('-2');
  await expect(page.locator('.scene-info')).toContainText('地下部分改造');
  const floorPose = await snapshot(page), rect = (await page.locator('.scene-host canvas').boundingBox())!;
  await page.mouse.move(rect.x + rect.width * .48, rect.y + rect.height * .66);
  await page.mouse.down();
  await page.mouse.move(rect.x + rect.width * .59, rect.y + rect.height * .7, { steps: 8 });
  await page.mouse.up();
  await expect.poll(async () => delta((await snapshot(page)).camera, floorPose.camera)).toBeGreaterThan(8);
  await page.mouse.wheel(0, -200);
  await expect.poll(async () => (await snapshot(page)).distance).toBeLessThan(floorPose.distance * .96);
  await page.getByRole('button', { name: '3D 院区' }).click();
  await expect.poll(async () => delta((await snapshot(page)).camera, original.camera)).toBeLessThan(.1);
});

test('F2: system filters compose with layers and alarm location clears filter', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: '2.5D 楼层' }).click();
  await expect(page.locator('.device-pin:visible')).toHaveCount(6);
  await expect(page.getByLabel('楼层设备系统')).toContainText('6 个示意点位');
  await page.getByRole('button', { name: '筛选视频监控', exact: true }).click();
  await expect(page.locator('.device-pin:visible')).toHaveCount(1);
  await page.getByRole('button', { name: '选择设备 通道摄像机', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '设备详情' })).toContainText('A-2F-CAM-02');
  await page.getByRole('button', { name: '关闭设备详情' }).click();
  await page.getByRole('button', { name: '图层设置' }).click();
  await page.getByLabel('设备点位', { exact: true }).uncheck();
  await page.getByRole('button', { name: '筛选给排水', exact: true }).click();
  await expect(page.locator('.device-pin:visible')).toHaveCount(0);
  await page.getByLabel('设备点位', { exact: true }).check();
  await expect(page.getByRole('button', { name: '选择设备 给排水监测器', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: '选择设备 通道摄像机', exact: true })).toBeHidden();
  await page.getByRole('button', { name: '图层设置' }).click();
  await page.getByRole('button', { name: /空调温度超出阈值/ }).click();
  await expect(page.getByRole('dialog', { name: '设备详情' })).toContainText('A-2F-AC-01');
  await expect(page.getByRole('button', { name: '显示全部设备' })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.device-pin:visible')).toHaveCount(6);
  await page.getByRole('button', { name: '关闭设备详情' }).click();
  await page.screenshot({ path: 'artifacts/harness/interior-desktop.png' });
});

for (const width of [768, 390]) test(`F3: interior rail and systems usable at ${width}`, async ({ page }) => {
  await page.setViewportSize({ width, height: width === 390 ? 844 : 1024 });
  await ready(page);
  await page.getByRole('button', { name: '2.5D 楼层' }).click();
  const controls = (await page.locator('.scene-controls').boundingBox())!, rail = (await page.getByLabel('楼层导航').boundingBox())!;
  expect(controls.x + controls.width <= rail.x || rail.x + rail.width <= controls.x || controls.y + controls.height <= rail.y || rail.y + rail.height <= controls.y, 'Floor and camera controls do not overlap').toBe(true);
  await page.getByRole('button', { name: '切换到 18F', exact: true }).click();
  await page.getByRole('button', { name: '切换到 13F', exact: true }).click();
  await expect(page.locator('.scene-info')).toContainText('保留原有功能');
  await page.getByRole('button', { name: '筛选给排水', exact: true }).click();
  await page.getByRole('button', { name: '选择设备 给排水监测器', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '设备详情' })).toContainText('A-13F-WTR-05');
  await page.getByRole('button', { name: '关闭设备详情' }).click();
  await page.getByRole('button', { name: '显示全部设备' }).click();
  await expect(page.locator('.device-pin:visible')).toHaveCount(6);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.locator('.scene-section').scrollIntoViewIfNeeded();
  await page.screenshot({ path: `artifacts/harness/interior-${width}.png`, fullPage: true });
});
