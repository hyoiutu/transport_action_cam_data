import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app, BrowserWindow, dialog, ipcMain } from 'electron';
import { resolveCollisionFreeFilePath } from './fileCopier.js';
import { scanDirectory } from './fileScanner.js';
import type { StartCopyArgs } from './types.js';

export type { CopyErrorData, CopyProgressData, FileInfo, StartCopyArgs } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let isCancelling = false;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false
    },
    titleBarStyle: 'hiddenInset', // macOS用のきれいなタイトルバー
    backgroundColor: '#1e1e2e' // 起動時のチラつき防止用の背景色
  });

  mainWindow.loadFile(path.join(__dirname, '../index.html'));

  // 必要に応じて開発者ツールを開く
  // mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// IPC ハンドラ定義

// 1. フォルダ選択ダイアログの表示
ipcMain.handle('select-directory', async (_, defaultPath: string | undefined) => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    // biome-ignore lint/nursery/useNullishCoalescing: 空文字列は「未選択」を表すため、??ではなく||で明示的にundefinedへフォールバックする
    defaultPath: defaultPath || undefined
  });
  if (result.canceled) {
    return null;
  } else {
    return result.filePaths[0];
  }
});

// 2. ディレクトリ内のファイルスキャン
ipcMain.handle('scan-directory', async (_, dirPath: string) => {
  return scanDirectory(dirPath);
});

// 3. キャンセル要求の受付
ipcMain.handle('cancel-copy', () => {
  isCancelling = true;
  return true;
});

const getErrorMessage = (error: unknown): string => (error instanceof Error ? error.message : String(error));

// 4. ファイルコピーの実行
ipcMain.handle('start-copy', async (_, { files, destinationDir }: StartCopyArgs) => {
  isCancelling = false;
  if (!mainWindow) {
    throw new Error('Main window not initialized');
  }
  if (!files || !destinationDir || !fs.existsSync(destinationDir)) {
    throw new Error('Invalid arguments or destination directory does not exist.');
  }

  const totalFiles = files.length;
  let copiedCount = 0;

  for (let i = 0; i < totalFiles; i++) {
    // 補足: このループには await がなく同期的に完走するため、cancel-copy による
    // isCancelling=true が反映される余地がなく、この分岐は現状の実装では到達不能。
    // 既知の制約として修正せず現状仕様のまま残す（ユーザーと合意済み）。
    if (isCancelling) {
      mainWindow.webContents.send('copy-progress', {
        status: 'cancelled',
        copiedCount,
        totalFiles,
        currentFile: ''
      });
      return { status: 'cancelled', copiedCount };
    }

    const file = files[i];
    mainWindow.webContents.send('copy-progress', {
      status: 'copying',
      copiedCount,
      totalFiles,
      currentFile: file.name
    });

    try {
      // コピー先パスの作成（YYYY-MM-DD）
      const targetSubDir = path.join(destinationDir, file.creationDate);
      if (!fs.existsSync(targetSubDir)) {
        fs.mkdirSync(targetSubDir, { recursive: true });
      }

      const targetFilePath = resolveCollisionFreeFilePath(targetSubDir, file.name);

      // ファイルコピー (大きなファイルにも対応できるようストリームまたは単純なcopyFileSync)
      fs.copyFileSync(file.path, targetFilePath);
      copiedCount++;

      mainWindow.webContents.send('copy-progress', {
        status: 'copying',
        copiedCount,
        totalFiles,
        currentFile: file.name
      });
    } catch (err: unknown) {
      console.error(`Error copying file ${file.name}:`, err);
      mainWindow.webContents.send('copy-error', {
        fileName: file.name,
        error: getErrorMessage(err)
      });
    }
  }

  mainWindow.webContents.send('copy-progress', {
    status: 'completed',
    copiedCount,
    totalFiles,
    currentFile: ''
  });

  return { status: 'completed', copiedCount };
});
