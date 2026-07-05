import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ElectronApplication, Page } from '@playwright/test';
import { _electron as electron, expect, test } from '@playwright/test';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.resolve(__dirname, '../../sony_test_source');
const destDir = path.resolve(__dirname, '../../test_destination');

// テスト実行前のセットアップ（コピー先をクリーンに）
test.beforeEach(() => {
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true });
  }
  fs.mkdirSync(destDir, { recursive: true });
});

test.describe('Action Cam Data Transporter E2Eテスト', () => {
  let electronApp: ElectronApplication;
  let page: Page;

  test.beforeEach(async () => {
    // Electron アプリを起動
    electronApp = await electron.launch({
      args: [path.join(__dirname, '../../dist/main/main.js')]
    });
    page = await electronApp.firstWindow();
    // 完全にロードされるのを待つ
    await page.waitForLoadState('domcontentloaded');
  });

  test.afterEach(async () => {
    // アプリを閉じる
    if (electronApp) {
      await electronApp.close();
    }
  });

  test('1. アプリの起動と初期状態の検証', async () => {
    // タイトルの確認
    const title = await page.title();
    expect(title).toBe('Action Cam Data Transporter');

    // 初期状態では「コピーを開始」と「キャンセル」が disabled であること
    const startBtn = page.locator('#btn-start-copy');
    const cancelBtn = page.locator('#btn-cancel-copy');
    await expect(startBtn).toBeDisabled();
    await expect(cancelBtn).toBeDisabled();
  });

  test('2. フォルダの選択、スキャン、およびプレビュー機能の検証', async () => {
    // レンダラープロセスの関数をモック・呼び出してフォルダ設定とスキャンをシミュレート
    await page.evaluate(
      async ({ src, dest }: { src: string; dest: string }) => {
        await window.updateDirectory('src', src);
        await window.updateDirectory('dest', dest);
      },
      { src: srcDir, dest: destDir }
    );

    // スキャンされたファイル数が UI に反映されていることを確認 (sony_test_source は 5 ファイル)
    const countSrc = page.locator('#count-src');
    await expect(countSrc).toHaveText('5');

    // ギャラリーにファイルカードが描画されていることを確認
    const firstCard = page.locator('.file-card').first();
    await expect(firstCard).toBeVisible();

    // プレビュー機能の検証: 最初のファイル（画像または動画）をクリックしてモーダルを開く
    await firstCard.click();

    // モーダルが表示されていることを確認（Chakra UIのDialogはdata-state属性で開閉状態を表す）
    const modal = page.locator('#preview-modal');
    await expect(modal).toHaveAttribute('data-state', 'open');

    // モーダル内の画像・動画要素が表示されていること
    const modalMedia = page.locator('#modal-body img, #modal-body video');
    await expect(modalMedia.first()).toBeVisible();

    // モーダルを閉じる
    await page.locator('#modal-close').click();
    await expect(modal).not.toBeVisible();
  });

  test('3. 自動分類コピーと重複回避の検証', async () => {
    // フォルダ設定とスキャンを実行
    await page.evaluate(
      async ({ src, dest }: { src: string; dest: string }) => {
        await window.updateDirectory('src', src);
        await window.updateDirectory('dest', dest);
      },
      { src: srcDir, dest: destDir }
    );

    // スキャンされた最初のメディアファイル情報（日付とファイル名）を動的に取得（フォルダは対象外）
    const { firstFileDate, firstFileName } = await page.evaluate(() => {
      const isFileEntry = (entry: DirectoryEntry): entry is FileInfo => entry.type !== 'folder';
      const firstMediaFile = window.srcFiles.find(isFileEntry);
      if (!firstMediaFile) throw new Error('メディアファイルが見つかりません');
      return {
        firstFileDate: firstMediaFile.creationDate,
        firstFileName: firstMediaFile.name
      };
    });

    // 「コピーを開始する」ボタンが有効化されていることを確認
    const startBtn = page.locator('#btn-start-copy');
    await expect(startBtn).toBeEnabled();

    // コピーの実行
    await startBtn.click();

    // 進捗コンテナがアクティブになり、完了ステータスになるのを待つ
    const progressStatus = page.locator('#progress-status');
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

  test('4. フォルダ表示とナビゲーションの検証', async () => {
    // フォルダ設定・スキャン・コピーを実行し、コピー先に撮影日サブフォルダを作らせる
    await page.evaluate(
      async ({ src, dest }: { src: string; dest: string }) => {
        await window.updateDirectory('src', src);
        await window.updateDirectory('dest', dest);
      },
      { src: srcDir, dest: destDir }
    );
    await page.locator('#btn-start-copy').click();
    await expect(page.locator('#progress-status')).toHaveText('コピー完了！', { timeout: 15000 });

    // コピー完了後は自動的にコピー先が再スキャンされ、撮影日フォルダがフォルダカードとして表示される
    await page.locator('#tab-dest').click();
    const folderCard = page.locator('.folder-card').first();
    await expect(folderCard).toBeVisible();
    const folderName = (await folderCard.textContent())?.trim();

    // フォルダカードをクリックすると、そのフォルダへ移動しサイドバーのパス表示が更新される
    await folderCard.click();
    const destPathDisplay = page.locator('#dest-path-display');
    await expect(destPathDisplay).toHaveText(path.join(destDir, folderName ?? ''));

    // 移動先フォルダの中身（コピーされたファイル）が表示される
    await expect(page.locator('.file-card').first()).toBeVisible();

    // 「一つ上へ」で元のコピー先フォルダに戻る
    await page.locator('#dest-navigate-up').click();
    await expect(destPathDisplay).toHaveText(destDir);
  });
});
