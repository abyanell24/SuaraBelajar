import { test, expect } from '@playwright/test';

test.describe('Wave 1 Landing', () => {
  test('should load landing page', async ({ page }) => {
    await page.goto('/wave1');
    await expect(page.locator('[data-testid="landing-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="landing-enter"]')).toBeVisible();
  });

  test('should navigate to room on enter click', async ({ page }) => {
    await page.goto('/wave1');
    await page.click('[data-testid="landing-enter"]');
    await expect(page).toHaveURL(/\/wave1\/room\/\d+/);
  });
});