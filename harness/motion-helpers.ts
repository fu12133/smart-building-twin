import { expect, Page } from '@playwright/test';

/** Isolate pre-existing static/idle checks through the public control. Motion has its own acceptance. */
export async function pauseSceneAnimation(page: Page) {
  await page.getByRole('button', { name: '图层设置', exact: true }).click();
  await page.getByLabel('场景动画', { exact: true }).uncheck();
  await page.getByRole('button', { name: '图层设置', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__BUILDING_HARNESS__!().sceneAnimation.billboard?.active ?? false)).toBe(false);
}
