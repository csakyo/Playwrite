import { test, expect } from '@playwright/test';

// 環境変数のみを使用します（ユーザー名/パスワードはコードに記載しません）。
// CI の Secrets またはローカルの環境変数で BASIC_USER / BASIC_PASS を設定してください。
const BASIC_USER = process.env.BASIC_USER;
const BASIC_PASS = process.env.BASIC_PASS;

// 環境変数が無ければテストをスキップ（fail-fastではなく安全にスキップする）
test.skip(
  !BASIC_USER || !BASIC_PASS,
  'Skipping: BASIC_USER and BASIC_PASS environment variables are required'
);

test.use({
  httpCredentials: {
    username: BASIC_USER as string,
    password: BASIC_PASS as string,
  },
});

test('Basic認証突破後にページが表示される', async ({ page }) => {
  // 認証情報は context 経由で処理されるため、URL に埋め込まず通常の URL へアクセスします
  await page.goto('https://scdemo.scdemosite.tokyo/');
  await page.waitForLoadState('networkidle');

  // ページ内の特定のフレーズを厳密にマッチさせ、複数ヒットによる strict mode エラーを回避する。
  // 複数マッチする要素が存在するため、first() を付けて最初の要素のみを検証します。
  const target = page.getByText('カメラ学びふたたび', { exact: true }).first();
  // テキストが分割されていたりスペースが混在する場合に備え、代替として
  // hasText を使った p 要素のフィルタも用意します（コメント化してあるので必要なら切替可）。
  // const target = page.locator('p', { hasText: /カメラ学びふたたび|カメラ/ }).first();
  await expect(target).toBeVisible({ timeout: 15000 });
});
