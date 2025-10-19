# Playwright公式サイト（https://playwright.dev/） — 検索機能とナビゲーションのテストプラン

## 概要

このテストプランは、Playwright公式サイト（https://playwright.dev/）の検索機能に関する詳細な検証と、ホームページの "GET STARTED" ボタンをクリックして遷移後、ページをスクロールして "What's next" というタイトルが存在することを確認するナビゲーションフローをカバーします。

目的:
- 検索 UI（表示、開閉、ショートカット、検索結果、遷移）が期待通りに動作することを確認する。
- "GET STARTED" のクリックで期待するページに遷移し、遷移先に "What's next" の見出しが存在することを確認する。

前提条件:
- テストはクリーン（キャッシュ・Cookieなし）なブラウザで実行する。
- ネットワーク接続があり、https://playwright.dev/ にアクセス可能であること。

使用するシードファイル: `tests/seed.spec.ts`（作業環境で存在する TypeScript ファイルを使用します）。

---

## 成功基準

- 検索ボタン／アイコンが表示され、クリックおよびショートカットで検索が開くこと。
- 検索結果が適切に表示され、結果をクリックすると該当ドキュメントへ遷移すること。
- ホームの "GET STARTED" をクリック後、遷移先ページ内に "What's next" 見出しが表示されること。

---

## テストケース一覧（優先度順）

1. 検索ボタンの表示確認
2. クリックで検索モーダルが開き、Escで閉じられる
3. キーボードショートカット（Ctrl/Cmd+K または /）で検索が開く
4. 検索ワードで結果が返り、結果をクリックして遷移できる
5. サジェスト（入力補完）が表示される
6. 空クエリ・特殊文字に対する挙動
7. 長いクエリや大量マッチ時の表示／パフォーマンス
8. アクセシビリティ（aria、フォーカス移動）
9. GET STARTED クリック → スクロール → "What's next" 確認

---

## 各テストケース詳細

### TC-01: 検索ボタンの表示確認

手順:
1. ブラウザを起動し `https://playwright.dev/` にアクセスする。
2. ヘッダー内に検索ボタン（または虫眼鏡アイコン）が存在するか確認する。

期待結果:
- 検索ボタンが DOM 上に存在し、表示されている（visible）。

備考:
- Playwright の `getByRole('button', { name: /search|search the docs/i })` 等で検出できるか試す。

---

### TC-02: クリックで検索モーダル開閉

手順:
1. TC-01 の前提を満たす。
2. 検索ボタンをクリックする。
3. 検索入力フィールドがフォーカスされることを確認する。
4. Esc を押下してモーダルを閉じる。

期待結果:
- モーダルが開き、入力にフォーカスが入る。Esc で閉じる。

---

### TC-03: キーボードショートカットで検索を開く

手順:
1. ホームページで `Control+K`（Windows/Linux）または `Meta+K`（macOS）を送信する。
2. 代替で `/` を送信して開く場合も確認する。

期待結果:
- ショートカットで検索モーダルが開き、入力にフォーカスされる。

---

### TC-04: 検索実行と遷移（例: Installation）

手順:
1. 検索を開き、`installation` を入力する。
2. Enter を押す、または結果リストの最初をクリックする。
3. 遷移先ページがロードされるまで待つ（`networkidle`）。

期待結果:
- `Installation` に関するドキュメントが検索結果に含まれ、遷移が成功する。

---

### TC-05: サジェスト表示

手順:
1. 検索を開き、`inst` のような部分文字列を入力する。
2. サジェスト候補が表示されるか確認する。

期待結果:
- 適切な候補がドロップダウンで表示される。

---

### TC-06: 空クエリ・特殊文字

手順:
1. 空のまま Enter、スペースのみ、特殊文字を入力して Enter を実行する。

期待結果:
- サイトがクラッシュしないこと。空結果やフレンドリーなメッセージが表示されること。

---

### TC-07: 長文クエリ／大量マッチ

手順:
1. 200文字程度の長文を入力する。
2. シンプルな1文字（例: `a`）を入力し、大量の結果が返る場合の UI を観察する。

期待結果:
- UI が崩れないこと。応答が大幅に遅延しないこと（目安: 2秒以内）。

---

### TC-08: アクセシビリティ

手順:
1. 検索を開き、Tab / Shift+Tab でフォーカス順が自然であることを確認する。
2. 検索 UI に適切な `aria` 属性（aria-label 等）があるか自動ツールで確認する。

期待結果:
- キーボードのみで操作可能で、スクリーンリーダー対応がある程度確保されていること。

---

### TC-09: GET STARTED を押して遷移 → "What's next" を確認

手順:
1. `https://playwright.dev/` にアクセスする。
2. ヘッダーまたはページ内にある "GET STARTED" テキスト（リンク／ボタン）を探す。
3. 見つかったらクリックする。
4. 遷移先で `await page.waitForLoadState('networkidle')` を実行し、ページを下方向へスクロールする（`locator.scrollIntoViewIfNeeded()` 等を使用）。
5. ページ上に `What's next` という見出し（テキスト）が存在することを確認する。

期待結果:
- GET STARTED 押下で期待のページに遷移し、スクロールで `What's next` が可視化される。

例（Playwright スニペット）:

```ts
await page.goto('https://playwright.dev/');
await page.waitForLoadState('networkidle');
const getStarted = page.getByRole('link', { name: /get started/i });
await expect(getStarted).toBeVisible();
await getStarted.click();
await page.waitForLoadState('networkidle');
// スクロールして該当見出しを可視化
const whatsNext = page.locator("text=What's next");
await whatsNext.scrollIntoViewIfNeeded();
await expect(whatsNext).toBeVisible();
```

---

## エビデンス取得

- 失敗時にはスクリーンショットと HTML スナップショットを保存する（Playwright の `--output` 設定や `page.screenshot()` を利用）。
- trace の取得をオンにしておく（`trace: 'on-first-retry'`は `playwright.config.ts` で既に設定済み）。

---

## 注意点 / 備考

- 指定いただいたシードファイル名 `tests/seed.spec.js` は実際のリポジトリには `tests/seed.spec.ts` が存在するため、本プランは `.ts` をベースにしています。必要なら `.js` 形式に合わせて出力します。

---

ファイル: `specs/secondTest.md`

以上。
