import { test, expect } from '@playwright/test';

test.describe('component gallery', () => {
  test('renders every section in light mode', async ({ page }) => {
    await page.goto('/gallery');

    await expect(page.getByRole('heading', { name: 'Buttons' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.screenshot({ path: 'screenshots/gallery-light.png', fullPage: true });
  });

  test('switches to dark mode via the theme toggle', async ({ page }) => {
    await page.goto('/gallery');

    await page.getByTestId('theme-toggle').click();

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.screenshot({ path: 'screenshots/gallery-dark.png', fullPage: true });
  });
});
