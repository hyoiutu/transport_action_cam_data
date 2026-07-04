import type { IpcMainInvokeEvent } from 'electron';
import { scanDirectory } from '../main/fileScanner.js';
import type { FileInfo } from '../types/domain.js';

export const scanDirectoryHandler = async (_event: IpcMainInvokeEvent, dirPath: string): Promise<FileInfo[]> => {
  return scanDirectory(dirPath);
};
