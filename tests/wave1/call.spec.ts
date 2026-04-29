import { test, expect } from '@playwright/test';

test.describe('Wave 1 Call', () => {
  test('should load call page', async ({ page }) => {
    await page.goto('/wave1/call');
    await expect(page.locator('[data-testid="call-page-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-mute"]')).toBeVisible();
    await expect(page.locator('[data-testid="btn-end-call"]')).toBeVisible();
  });

  test('mute button should be clickable', async ({ page }) => {
    await page.goto('/wave1/call');
    await page.click('[data-testid="btn-mute"]');
    await expect(page.locator('[data-testid="btn-mute"]')).toBeVisible();
  });
});