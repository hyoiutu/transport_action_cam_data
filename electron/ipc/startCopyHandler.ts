import fs from 'node:fs';
import type { BrowserWindow, IpcMainInvokeEvent } from 'electron';
import { copyFileToDateDirectory } from '../main/fileCopier.js';
import { getMainWindow } from '../main/windowState.js';
import type { CopyErrorData, CopyProgressData, StartCopyArgs } from '../types/domain.js';
import { isCancelling, setCancelling } from './cancellationState.js';

const getErrorMessage = (error: unknown): string => (error instanceof Error ? error.message : String(error));

const sendCopyProgress = (mainWindow: BrowserWindow, data: CopyProgressData): void => {
  mainWindow.webContents.send('copy-progress', data);
};

const sendCopyError = (mainWindow: BrowserWindow, data: CopyErrorData): void => {
  mainWindow.webContents.send('copy-error', data);
};

export const startCopyHandler = async (_event: IpcMainInvokeEvent, { files, destinationDir }: StartCopyArgs) => {
  setCancelling(false);
  const mainWindow = getMainWindow();
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
    if (isCancelling()) {
      sendCopyProgress(mainWindow, { status: 'cancelled', copiedCount, totalFiles, currentFile: '' });
      return { status: 'cancelled', copiedCount };
    }

    const file = files[i];
    sendCopyProgress(mainWindow, { status: 'copying', copiedCount, totalFiles, currentFile: file.name });

    try {
      copyFileToDateDirectory(file, destinationDir);
      copiedCount++;
      sendCopyProgress(mainWindow, { status: 'copying', copiedCount, totalFiles, currentFile: file.name });
    } catch (err: unknown) {
      console.error(`Error copying file ${file.name}:`, err);
      sendCopyError(mainWindow, { fileName: file.name, error: getErrorMessage(err) });
    }
  }

  sendCopyProgress(mainWindow, { status: 'completed', copiedCount, totalFiles, currentFile: '' });
  return { status: 'completed', copiedCount };
};
