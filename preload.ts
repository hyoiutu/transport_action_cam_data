import { contextBridge, IpcRendererEvent, ipcRenderer } from 'electron';
import type { CopyErrorData, CopyProgressData, FileInfo } from './main.js';

contextBridge.exposeInMainWorld('api', {
  selectDirectory: (defaultPath?: string) => ipcRenderer.invoke('select-directory', defaultPath),
  scanDirectory: (dirPath: string) => ipcRenderer.invoke('scan-directory', dirPath),
  startCopy: (files: FileInfo[], destinationDir: string) => ipcRenderer.invoke('start-copy', { files, destinationDir }),
  cancelCopy: () => ipcRenderer.invoke('cancel-copy'),
  onCopyProgress: (callback: (data: CopyProgressData) => void) => {
    const subscription = (_: IpcRendererEvent, data: CopyProgressData) => callback(data);
    ipcRenderer.on('copy-progress', subscription);
    return () => {
      ipcRenderer.removeListener('copy-progress', subscription);
    };
  },
  onCopyError: (callback: (data: CopyErrorData) => void) => {
    const subscription = (_: IpcRendererEvent, data: CopyErrorData) => callback(data);
    ipcRenderer.on('copy-error', subscription);
    return () => {
      ipcRenderer.removeListener('copy-error', subscription);
    };
  }
});
