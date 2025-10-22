# Playwright — 検索機能テストプラン（firstTest.md）

## 概要

目的：公式サイト `https://playwright.dev/` の検索機能（ヘッダー/ページ内の検索 UI、検索モーダル、ショートカット、検索結果）を検証する。テストは Playwright を使って自動化可能な手順で記載する。シードファイルとして `tests/seed.spec.ts`（または `tests/seed.spec.js`）を利用して、以下の項目をカバーする。

対象項目：

1. 検索ボタンの表示確認
2. 検索モーダルの開閉
3. キーボードショートカット（Command+K / Ctrl+K）の動作
4. 実際に検索を実行して結果を確認

---

## 前提条件

- テスト実行環境に Node.js と Playwright がインストール済みであること（`npm install` と `npx playwright install` を実行済み）。
- 各シナリオは独立して実行可能（新しいブラウザページを使用）。
- 言語や地域設定によってラベルが変わる可能性があるため、role/name と placeholder、href など複数のフォールバックを使う。

## 共通の設定/タイムアウト

- デフォルトの要素待機タイムアウトは 5s（必要に応じて 10s に上げる）
- ネットワーク安定化は `page.waitForLoadState('networkidle')` を利用

---

## シナリオ 1 — 検索ボタンの表示確認

目的：ページ（トップページ、及びドキュメントページ）のヘッダーに検索ボタンまたは検索アイコンが表示されていることを確認する。

手順:

1. `https://playwright.dev/` を開く。
2. ヘッダー内で検索 UI を探す。
   - 推奨セレクタ（順に試す）:
     - `page.getByRole('button', { name: /Search|検索|Open search/i })`
     - `page.locator('input[type="search"]')`（visible かつ enabled）
     - `page.locator('[aria-label*="search"], [placeholder*="Search"], [data-search]')`
3. 検索アイコン（ボタン）または検索入力が可視であることを検証する。

期待結果:

- 検索ボタン（または入力）が表示されクリック可能である。

エッジケース:

- モバイル表示でアイコンしかない場合は、ビューポートを小さくしてモバイル版を確認する（別テスト）。

---

## シナリオ 2 — 検索モーダルの開閉

目的：検索ボタンをクリックすると検索モーダル/ドロップダウンが開き、閉じる操作で非表示になることを確認する。

手順:

1. シナリオ 1 で検索ボタンを検出した状態から開始。
2. 検索ボタンをクリックする（`await searchButton.click()`）。
3. モーダルまたは検索入力が fokus を受け取っているか、かつ可視であることを検証する。
   - `page.getByRole('dialog')` や `page.getByRole('searchbox')` を利用
4. モーダルを閉じる操作を行う（Esc キー送信や閉じるボタンをクリック）
   - `await page.keyboard.press('Escape')` または `await closeButton.click()`
5. モーダルが非表示（`toBeHidden()` / count === 0）になることを検証する。

期待結果:

- 開閉の UI が動作し、フォーカスが適切に移動する。

エッジケース:

- モーダルがアニメーションで遅延して表示／非表示になる場合は `waitForSelector` を使って安定化を待つ。

---

## シナリオ 3 — キーボードショートカット（Command+K / Ctrl+K）の動作

目的：ショートカット（macOS: Command+K、Windows/Linux: Control+K）で検索モーダルが開くことを検証する。

手順:

1. `https://playwright.dev/` を開く。
2. ページが安定したらショートカットを送る。
   - macOS: `await page.keyboard.down('Meta'); await page.keyboard.press('k'); await page.keyboard.up('Meta');`
   - Windows/Linux: `await page.keyboard.down('Control'); await page.keyboard.press('k'); await page.keyboard.up('Control');`
3. モーダルが開き、検索入力にフォーカスがあることを確認する（`document.activeElement` を利用するか、`expect(searchInput).toBeFocused()`）。
4. もう一度ショートカットを送るとモーダルが閉じる（あるいは Esc で閉じる挙動と合わせて検証）。

期待結果:

- ショートカットで検索が開き、フォーカスが検索入力にある。

注意点:

- ブラウザのデフォルトショートカットが競合する場合はテストランナー（Playwright）の `page.keyboard` で確実に送る。

---

## シナリオ 4 — 実際に検索を実行して結果を確認

目的：検索語で検索を実行し、結果リストが表示され、期待するページ（例: Installation / Getting started）を開けることを確認する。

手順:

1. 検索モーダルを開く（シナリオ 2 または 3 を使用）。
2. 検索入力に "Installation"（または "install"）を入力する。
   - `await searchInput.fill('Installation'); await page.keyboard.press('Enter');`
3. 検索結果のリストが表示されることを検証する。
   - セレクタ例: `page.getByRole('list'), page.getByRole('link', { name: /Installation|Install/i })`
4. 結果の最上位または一致する項目をクリックして遷移する。
5. 遷移先ページで見出し `role=heading` に "Installation" が存在することを検証する。

期待結果:

- 検索結果が表示され、該当のドキュメントページに遷移して見出しを確認できる。

失敗条件:

- 結果が表示されない、該当ページに遷移できない、または見出しが見つからない場合はログ／スクリーンショットを保存して原因を調査。

---

## Playwright 実装サンプル（抜粋）

以下はテストコードのサンプル断片。実際は `tests/seed.spec.ts` に組み込むか新規ファイルを作成して実行する。

```ts
import { test, expect } from '@playwright/test';

test('Search UI: open search and find Installation', async ({ page }) => {
  await page.goto('https://playwright.dev/');
  await page.waitForLoadState('networkidle');

  // Open search (try button first)
  const searchButton = page
    .getByRole('button', { name: /Search|検索/i })
    .first();
  if ((await searchButton.count()) > 0) {
    await searchButton.click();
  } else {
    // fallback: use shortcut (Meta/Ctrl + K) for macOS example
    await page.keyboard.down('Meta');
    await page.keyboard.press('k');
    await page.keyboard.up('Meta');
  }

  const searchInput = page.locator(
    'input[type="search"], input[role="searchbox"], [placeholder*="Search"]'
  );
  await expect(searchInput.first()).toBeVisible({ timeout: 5000 });
  await expect(searchInput.first()).toBeFocused();

  await searchInput.first().fill('Installation');
  await page.keyboard.press('Enter');

  // wait for results
  const result = page
    .getByRole('link', { name: /Installation|Install/i })
    .first();
  await expect(result).toBeVisible({ timeout: 7000 });
  await result.click();

  await page.waitForLoadState('networkidle');
  const header = page.getByRole('heading', { name: /Installation/i }).first();
  await expect(header).toBeVisible({ timeout: 7000 });
});
```

---

## 記録・デバッグ

- 失敗時は下記を行う：
  - `await page.screenshot({ path: 'failure-search.png', fullPage: true })`
  - `await fs.writeFile('page-search.html', await page.content())`
- フレーク対策：検索提案は非同期で出る場合があるため `waitForSelector` を使って安定化を待つ。

## 実行手順（ローカル）

```bash
cd /Users/chihirosakyo/git/playwirite
npm install
npx playwright install
npx playwright test tests/seed.spec.ts -g "Search UI: open search and find Installation"
```

---

保存場所: `specs/firstTest.md`
