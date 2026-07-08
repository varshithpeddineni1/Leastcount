import { test, expect } from '@playwright/test';

test('client placeholder page loads', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByTestId('placeholder-message')).toBeVisible();
});
