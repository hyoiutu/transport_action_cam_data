import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';

contextBridge.exposeInMainWorld('api', {
  selectDirectory: (defaultPath?: string) => ipcRenderer.invoke('select-directory', defaultPath),
  scanDirectory: (dirPath: string) => ipcRenderer.invoke('scan-directory', dirPath),
  startCopy: (files: any[], destinationDir: string) => ipcRenderer.invoke('start-copy', { files, destinationDir }),
  cancelCopy: () => ipcRenderer.invoke('cancel-copy'),
  onCopyProgress: (callback: (data: any) => void) => {
    const subscription = (_: IpcRendererEvent, data: any) => callback(data);
    ipcRenderer.on('copy-progress', subscription);
    return () => {
      ipcRenderer.removeListener('copy-progress', subscription);
    };
  },
  onCopyError: (callback: (data: any) => void) => {
    const subscription = (_: IpcRendererEvent, data: any) => callback(data);
    ipcRenderer.on('copy-error', subscription);
    return () => {
      ipcRenderer.removeListener('copy-error', subscription);
    };
  }
});
