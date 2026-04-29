import { test, expect } from '@playwright/test';

test.describe('Wave 1 Room', () => {
  test('should load room page with id', async ({ page }) => {
    await page.goto('/wave1/room/1');
    await expect(page.locator('[data-testid="room-title"]')).toContainText('Room 1');
    await expect(page.locator('[data-testid="start-call-btn"]')).toBeVisible();
  });

  test('should navigate to call on start call click', async ({ page }) => {
    await page.goto('/wave1/room/1');
    await page.click('[data-testid="start-call-btn"]');
    await expect(page).toHaveURL(/\/wave1\/call/);
  });
});