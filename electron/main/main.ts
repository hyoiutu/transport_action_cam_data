import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app, BrowserWindow, ipcMain } from 'electron';
import { cancelCopyHandler } from '../ipc/cancelCopyHandler.js';
import { scanDirectoryHandler } from '../ipc/scanDirectoryHandler.js';
import { selectDirectoryHandler } from '../ipc/selectDirectoryHandler.js';
import { startCopyHandler } from '../ipc/startCopyHandler.js';
import { setMainWindow } from './windowState.js';

export type { CopyErrorData, CopyProgressData, FileInfo, StartCopyArgs } from '../types/domain.js';

const DEFAULT_WINDOW_WIDTH = 1200;
const DEFAULT_WINDOW_HEIGHT = 800;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createWindow = () => {
  const window = new BrowserWindow({
    width: DEFAULT_WINDOW_WIDTH,
    height: DEFAULT_WINDOW_HEIGHT,
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

  setMainWindow(window);
  window.loadFile(path.join(__dirname, '../index.html'));

  // 必要に応じて開発者ツールを開く
  // window.webContents.openDevTools();
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

// IPC ハンドラ登録
ipcMain.handle('select-directory', selectDirectoryHandler);
ipcMain.handle('scan-directory', scanDirectoryHandler);
ipcMain.handle('cancel-copy', cancelCopyHandler);
ipcMain.handle('start-copy', startCopyHandler);
