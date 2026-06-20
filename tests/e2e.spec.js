const { _electron: electron } = require('@playwright/test');
const { test, expect } = require('@playwright/test');
const path = require('path');
const fs = require('fs');

const srcDir = path.resolve(__dirname, '../sony_test_source');
const destDir = path.resolve(__dirname, '../test_destination');

// テスト実行前のセットアップ（コピー先をクリーンに）
test.beforeEach(() => {
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }
  fs.mkdirSync(destDir, { recursive: true });
});

test.describe('Action Cam Data Transporter E2E Tests', () => {
  let electronApp;
  let window;

  test.beforeEach(async () => {
    // Electron アプリを起動
    electronApp = await electron.launch({
      args: [path.join(__dirname, '../main.js')]
    });
    window = await electronApp.firstWindow();
    // 完全にロードされるのを待つ
    await window.waitForLoadState('domcontentloaded');
  });

  test.afterEach(async () => {
    // アプリを閉じる
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('1. アプリの起動と初期状態の検証', async () => {
    // タイトルの確認
    const title = await window.title();
    expect(title).toBe('Action Cam Data Transporter');

    // 初期状態では「コピーを開始」と「キャンセル」が disabled であること
    const startBtn = window.locator('#btn-start-copy');
    const cancelBtn = window.locator('#btn-cancel-copy');
    await expect(startBtn).toBeDisabled();
    await expect(cancelBtn).toBeDisabled();
  });

  test('2. フォルダの選択、スキャン、およびプレビュー機能の検証', async () => {
    // レンダラープロセスの関数をモック・呼び出してフォルダ設定とスキャンをシミュレート
    await window.evaluate(async ({ src, dest }) => {
      await window.updateDirectory('src', src);
      await window.updateDirectory('dest', dest);
    }, { src: srcDir, dest: destDir });

    // スキャンされたファイル数が UI に反映されていることを確認 (sony_test_source は 5 ファイル)
    const countSrc = window.locator('#count-src');
    await expect(countSrc).toHaveText('5');

    // ギャラリーにファイルカードが描画されていることを確認
    const firstCard = window.locator('.file-card').first();
    await expect(firstCard).toBeVisible();

    // プレビュー機能の検証: 最初のファイル（画像または動画）をクリックしてモーダルを開く
    await firstCard.click();

    // モーダルが表示されていることを確認
    const modal = window.locator('#preview-modal');
    await expect(modal).toHaveClass(/show/);

    // モーダル内の画像・動画要素が表示されていること
    const modalMedia = window.locator('#modal-body img, #modal-body video');
    await expect(modalMedia.first()).toBeVisible();

    // モーダルを閉じる
    await window.locator('#modal-close').click();
    await expect(modal).not.toHaveClass(/show/);
  });

  test('3. 自動分類コピーと重複回避の検証', async () => {
    // フォルダ設定とスキャンを実行
    await window.evaluate(async ({ src, dest }) => {
      await window.updateDirectory('src', src);
      await window.updateDirectory('dest', dest);
    }, { src: srcDir, dest: destDir });

    // スキャンされた最初のファイル情報（日付とファイル名）を動的に取得
    const { firstFileDate, firstFileName } = await window.evaluate(() => {
      return {
        firstFileDate: srcFiles[0].creationDate,
        firstFileName: srcFiles[0].name
      };
    });

    // 「コピーを開始する」ボタンが有効化されていることを確認
    const startBtn = window.locator('#btn-start-copy');
    await expect(startBtn).toBeEnabled();

    // コピーの実行
    await startBtn.click();

    // 進捗コンテナがアクティブになり、完了ステータスになるのを待つ
    const progressStatus = window.locator('#progress-status');
    await expect(progressStatus).toHaveText('コピー完了！', { timeout: 15000 });

    // 実際のファイルシステムでコピー成果物と自動分類の検証
    const expectedSubDir = path.join(destDir, firstFileDate);
    expect(fs.existsSync(expectedSubDir)).toBe(true);

    const copiedFile = path.join(expectedSubDir, firstFileName);
    expect(fs.existsSync(copiedFile)).toBe(true);

    // 重複コピー（競合回避）の検証
    // もう一度コピーを実行する
    await startBtn.click();
    await expect(progressStatus).toHaveText('コピー完了！', { timeout: 15000 });

    // 競合回避ファイルが作成されていることを確認 (例: filename_1.ext)
    const ext = path.extname(firstFileName);
    const baseName = path.basename(firstFileName, ext);
    const duplicatedFile = path.join(expectedSubDir, `${baseName}_1${ext}`);
    expect(fs.existsSync(duplicatedFile)).toBe(true);
  });
});
