import type { IpcMainInvokeEvent } from 'electron';
import { scanDirectory } from '../main/fileScanner.js';
import type { DirectoryEntry } from '../types/domain.js';

export const scanDirectoryHandler = async (_event: IpcMainInvokeEvent, dirPath: string): Promise<DirectoryEntry[]> => {
  return scanDirectory(dirPath);
};
