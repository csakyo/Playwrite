import { test, expect } from '@playwright/test';

// Generated from specs/firstTest.md
test.describe('Playwright site - Search feature (firstTest)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('https://playwright.dev/');
    await page.waitForLoadState('networkidle');
  });

  test('検索ボタンの表示確認', async ({ page }) => {
    const searchButton = page
      .getByRole('button', { name: /Search|検索|Open search/i })
      .first();
    if ((await searchButton.count()) > 0) {
      await expect(searchButton).toBeVisible({ timeout: 7000 });
      await expect(searchButton).toBeEnabled();
      return;
    }

    const searchInput = page.locator(
      'input[type="search"], input[role="searchbox"]'
    );
    if ((await searchInput.count()) > 0) {
      await expect(searchInput.first()).toBeVisible({ timeout: 7000 });
      await expect(searchInput.first()).toBeEnabled();
      return;
    }

    const fallback = page
      .locator('[aria-label*="search"], [placeholder*="Search"], [data-search]')
      .first();
    await expect(fallback).toBeVisible({ timeout: 7000 });
  });

  test('検索モーダルの開閉', async ({ page }) => {
    const searchButton = page
      .getByRole('button', { name: /Search|検索|Open search/i })
      .first();
    if ((await searchButton.count()) > 0) {
      await searchButton.click();
    } else {
      if (process.platform === 'darwin') {
        await page.keyboard.down('Meta');
        await page.keyboard.press('k');
        await page.keyboard.up('Meta');
      } else {
        await page.keyboard.down('Control');
        await page.keyboard.press('k');
        await page.keyboard.up('Control');
      }
    }

    const searchInput = page.locator(
      'input[type="search"], input[role="searchbox"], [placeholder*="Search"]'
    );
    await expect(searchInput.first()).toBeVisible({ timeout: 7000 });
    await expect(searchInput.first()).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(searchInput.first()).toBeHidden({ timeout: 7000 });
  });

  test('キーボードショートカット (Cmd/Ctrl+K) の動作', async ({ page }) => {
    if (process.platform === 'darwin') {
      await page.keyboard.down('Meta');
      await page.keyboard.press('k');
      await page.keyboard.up('Meta');
    } else {
      await page.keyboard.down('Control');
      await page.keyboard.press('k');
      await page.keyboard.up('Control');
    }

    const searchInput = page.locator(
      'input[type="search"], input[role="searchbox"], [placeholder*="Search"]'
    );
    await expect(searchInput.first()).toBeVisible({ timeout: 7000 });
    await expect(searchInput.first()).toBeFocused();
  });

  test('検索を実行して結果を確認 (Installation)', async ({ page }) => {
    const searchButton = page
      .getByRole('button', { name: /Search|検索|Open search/i })
      .first();
    if ((await searchButton.count()) > 0) {
      await searchButton.click();
    } else {
      if (process.platform === 'darwin') {
        await page.keyboard.down('Meta');
        await page.keyboard.press('k');
        await page.keyboard.up('Meta');
      } else {
        await page.keyboard.down('Control');
        await page.keyboard.press('k');
        await page.keyboard.up('Control');
      }
    }

    const searchInput = page.locator(
      'input[type="search"], input[role="searchbox"], [placeholder*="Search"]'
    );
    await expect(searchInput.first()).toBeVisible({ timeout: 7000 });
    await expect(searchInput.first()).toBeFocused();

    await searchInput.first().fill('Installation');
    await page.keyboard.press('Enter');

    const resultLink = page
      .getByRole('link', { name: /Installation|Install/i })
      .first();
    await expect(resultLink).toBeVisible({ timeout: 10000 });
    await resultLink.click();

    await page.waitForLoadState('networkidle');
    const header = page.getByRole('heading', { name: /Installation/i }).first();
    await expect(header).toBeVisible({ timeout: 10000 });
  });
});
