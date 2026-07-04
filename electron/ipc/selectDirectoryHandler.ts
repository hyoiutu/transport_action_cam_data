import type { IpcMainInvokeEvent } from 'electron';
import { dialog } from 'electron';
import { getMainWindow } from '../main/windowState.js';

export const selectDirectoryHandler = async (
  _event: IpcMainInvokeEvent,
  defaultPath: string | undefined
): Promise<string | null> => {
  const mainWindow = getMainWindow();
  if (!mainWindow) return null;

  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    // biome-ignore lint/nursery/useNullishCoalescing: 空文字列は「未選択」を表すため、??ではなく||で明示的にundefinedへフォールバックする
    defaultPath: defaultPath || undefined
  });

  return result.canceled ? null : result.filePaths[0];
};
