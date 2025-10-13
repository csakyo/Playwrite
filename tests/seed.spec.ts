import { test, expect } from '@playwright/test';

test('homepage has title and links to intro page', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Check title
  await expect(page).toHaveTitle(/Playwright/);

  // Click link to intro
  await page.getByRole('link', { name: 'Get started' }).click();

  // Assert new page
  await expect(page).toHaveURL(/.*docs\/intro/);
});
