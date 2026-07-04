import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import * as musicMetadata from 'music-metadata';

const cjsRequire = createRequire(import.meta.url);
const exifParser = cjsRequire('exif-parser');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let isCancelling = false;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false
    },
    titleBarStyle: 'hiddenInset', // macOS用のきれいなタイトルバー
    backgroundColor: '#1e1e2e'  // 起動時のチラつき防止用の背景色
  });

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // 必要に応じて開発者ツールを開く
  // mainWindow.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// IPC ハンドラ定義

// 1. フォルダ選択ダイアログの表示
ipcMain.handle('select-directory', async (_, defaultPath: string | undefined) => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    // 空文字列は「未選択」を表すため、??ではなく||で明示的にundefinedへフォールバックする
    defaultPath: defaultPath || undefined
  });
  if (result.canceled) {
    return null;
  } else {
    return result.filePaths[0];
  }
});

export type FileInfo = {
  name: string;
  path: string;
  size: number;
  type: 'video' | 'image';
  creationDate: string;
  dateSource: string;
};

// 2. ディレクトリ内のファイルスキャン
ipcMain.handle('scan-directory', async (_, dirPath: string) => {
  if (!dirPath || !fs.existsSync(dirPath)) {
    return [];
  }

  const files: FileInfo[] = [];
  const allowedVideoExts = ['.mp4', '.mov', '.avi', '.mkv'];
  const allowedImageExts = ['.jpg', '.jpeg', '.png'];

  try {
    const list = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const dirent of list) {
      if (dirent.isDirectory()) continue; // サブディレクトリはスキャンしない（ミニマム対応）

      const ext = path.extname(dirent.name).toLowerCase();
      const isVideo = allowedVideoExts.includes(ext);
      const isImage = allowedImageExts.includes(ext);

      if (!isVideo && !isImage) continue;

      const filePath = path.join(dirPath, dirent.name);
      const stats = fs.statSync(filePath);

      let creationDate: Date | null = null;
      let dateSource = 'file_system';

      if (isVideo) {
        try {
          const metadata = await musicMetadata.parseFile(filePath);
          // music-metadataの型定義にはcreation_timeが含まれないが、
          // 一部のコンテナ形式では実際に付与されるため拡張型でキャストする
          const common = metadata.common as typeof metadata.common & { creation_time?: string };
          if (common.creation_time) {
            creationDate = new Date(common.creation_time);
            dateSource = 'metadata';
          }
        } catch (e) {
          console.warn(`Failed to parse video metadata for ${dirent.name}:`, e);
        }
      } else if (isImage) {
        try {
          const buffer = fs.readFileSync(filePath);
          const parser = exifParser.create(buffer);
          const result = parser.parse();
          if (result.tags && result.tags.DateTimeOriginal) {
            // DateTimeOriginalは秒単位のエポックタイムスタンプの場合がある
            creationDate = new Date(result.tags.DateTimeOriginal * 1000);
            dateSource = 'metadata';
          }
        } catch (e) {
          console.warn(`Failed to parse image EXIF for ${dirent.name}:`, e);
        }
      }

      // メタデータから取得できなかった場合のフォールバック
      if (!creationDate || isNaN(creationDate.getTime())) {
        // mtime と birthtime のうち、古い方を採用するなどの安全策
        // birthtimeMsが0（未サポート環境）の場合もフォールバックしたいため??ではなく||を使用する
        const fileTime = Math.min(stats.birthtimeMs || stats.mtimeMs, stats.mtimeMs);
        creationDate = new Date(fileTime);
        dateSource = 'file_system_fallback';
      }

      // 日本時間（JST）基準で YYYY-MM-DD の日付文字列を作成
      const jstOffset = 9 * 60 * 60 * 1000;
      const jstDate = new Date(creationDate.getTime() + jstOffset);
      const year = jstDate.getUTCFullYear();
      const month = String(jstDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(jstDate.getUTCDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`; // YYYY-MM-DD 形式に変更

      files.push({
        name: dirent.name,
        path: filePath,
        size: stats.size,
        type: isVideo ? 'video' : 'image',
        creationDate: formattedDate,
        dateSource: dateSource
      });
    }
  } catch (err) {
    console.error(`Error scanning directory ${dirPath}:`, err);
    throw err;
  }

  return files;
});

// 3. キャンセル要求の受付
ipcMain.handle('cancel-copy', () => {
  isCancelling = true;
  return true;
});

export type StartCopyArgs = {
  files: FileInfo[];
  destinationDir: string;
};

export type CopyProgressData = {
  status: 'copying' | 'completed' | 'cancelled';
  copiedCount: number;
  totalFiles: number;
  currentFile: string;
};

export type CopyErrorData = {
  fileName: string;
  error: string;
};

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

      // 重複ファイル名の競合回避処理
      let targetFileName = file.name;
      let targetFilePath = path.join(targetSubDir, targetFileName);
      let counter = 1;

      const ext = path.extname(file.name);
      const baseName = path.basename(file.name, ext);

      while (fs.existsSync(targetFilePath)) {
        targetFileName = `${baseName}_${counter}${ext}`;
        targetFilePath = path.join(targetSubDir, targetFileName);
        counter++;
      }

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
