const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  selectDirectory: (defaultPath) => ipcRenderer.invoke('select-directory', defaultPath),
  scanDirectory: (dirPath) => ipcRenderer.invoke('scan-directory', dirPath),
  startCopy: (files, destinationDir) => ipcRenderer.invoke('start-copy', { files, destinationDir }),
  cancelCopy: () => ipcRenderer.invoke('cancel-copy'),
  onCopyProgress: (callback) => {
    ipcRenderer.on('copy-progress', (event, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('copy-progress');
  },
  onCopyError: (callback) => {
    ipcRenderer.on('copy-error', (event, data) => callback(data));
    return () => ipcRenderer.removeAllListeners('copy-error');
  }
});
