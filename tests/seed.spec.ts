import { test, expect } from '@playwright/test';

test('Basic認証突破後にページが表示される', async ({ page }) => {
  // GitHub ActionsのSecretsまたはローカル.envから取得
  const username = process.env.BASIC_AUTH_USER;
  const password = process.env.BASIC_AUTH_PASS;

  // Basic認証付きURLにアクセス
  await page.goto(`https://${username}:${password}@scdemo.scdemosite.tokyo/`);

  // ページ内に特定のテキストが表示されていれば成功とみなす
  await expect(page.getByText('カメラ')).toBeVisible({
    timeout: 10000,
  });

  // ログを出してCI/CD上でも確認できるように
  console.log('✅ Basic認証を突破し、ページが正常に表示されました。');
});
