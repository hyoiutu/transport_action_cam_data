import { describe, expect, test, vi } from 'vitest';

type ExposedApi = {
  selectDirectory: (defaultPath?: string) => unknown;
  scanDirectory: (dirPath: string) => unknown;
  startCopy: (files: unknown[], destinationDir: string) => unknown;
  cancelCopy: () => unknown;
  onCopyProgress: (callback: (data: unknown) => void) => () => void;
  onCopyError: (callback: (data: unknown) => void) => () => void;
  getParentDirectory: (currentPath: string) => string;
};

let exposedApi: ExposedApi | undefined;

vi.mock('electron', () => ({
  contextBridge: {
    exposeInMainWorld: vi.fn((_key: string, api: ExposedApi) => {
      exposedApi = api;
    })
  },
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn()
  }
}));

const { contextBridge, ipcRenderer } = await import('electron');
await import('../preload.js');

const getApi = (): ExposedApi => {
  if (!exposedApi) throw new Error('api is not exposed');
  return exposedApi;
};

describe('preloadに関するテスト', () => {
  test('window.apiとしてAPIオブジェクトを公開する', () => {
    // Arrange & Act & Assert
    expect(contextBridge.exposeInMainWorld).toHaveBeenCalledWith('api', expect.any(Object));
  });

  test('selectDirectoryはselect-directoryチャンネルへdefaultPathを渡してinvokeする', () => {
    // Arrange
    const api = getApi();

    // Act
    api.selectDirectory('/default/path');

    // Assert
    expect(ipcRenderer.invoke).toHaveBeenCalledWith('select-directory', '/default/path');
  });

  test('selectDirectoryを引数なしで呼ぶと、defaultPathはundefinedとして渡される', () => {
    // Arrange
    const api = getApi();

    // Act
    api.selectDirectory();

    // Assert
    expect(ipcRenderer.invoke).toHaveBeenCalledWith('select-directory', undefined);
  });

  test('scanDirectoryはscan-directoryチャンネルへdirPathを渡してinvokeする', () => {
    // Arrange
    const api = getApi();

    // Act
    api.scanDirectory('/target/dir');

    // Assert
    expect(ipcRenderer.invoke).toHaveBeenCalledWith('scan-directory', '/target/dir');
  });

  test('startCopyはstart-copyチャンネルへfilesとdestinationDirをまとめてinvokeする', () => {
    // Arrange
    const api = getApi();
    const files = [{ name: 'a.mp4' }];

    // Act
    api.startCopy(files, '/dest');

    // Assert
    expect(ipcRenderer.invoke).toHaveBeenCalledWith('start-copy', { files, destinationDir: '/dest' });
  });

  test('cancelCopyはcancel-copyチャンネルをinvokeする', () => {
    // Arrange
    const api = getApi();

    // Act
    api.cancelCopy();

    // Assert
    expect(ipcRenderer.invoke).toHaveBeenCalledWith('cancel-copy');
  });

  test('onCopyProgressはcopy-progressチャンネルを購読し、イベント発火時にコールバックへdataを渡す', () => {
    // Arrange
    const api = getApi();
    const callback = vi.fn();

    // Act
    api.onCopyProgress(callback);
    const [, subscription] = vi.mocked(ipcRenderer.on).mock.calls.at(-1) as [
      string,
      (event: unknown, data: unknown) => void
    ];
    subscription({}, { status: 'copying' });

    // Assert
    expect(callback).toHaveBeenCalledWith({ status: 'copying' });
  });

  test('onCopyProgressが返す関数を呼ぶと、copy-progressの購読を解除する', () => {
    // Arrange
    const api = getApi();
    const unsubscribe = api.onCopyProgress(vi.fn());
    const [, subscription] = vi.mocked(ipcRenderer.on).mock.calls.at(-1) as [
      string,
      (event: unknown, data: unknown) => void
    ];

    // Act
    unsubscribe();

    // Assert
    expect(ipcRenderer.removeListener).toHaveBeenCalledWith('copy-progress', subscription);
  });

  test('onCopyErrorはcopy-errorチャンネルを購読し、イベント発火時にコールバックへdataを渡す', () => {
    // Arrange
    const api = getApi();
    const callback = vi.fn();

    // Act
    api.onCopyError(callback);
    const [, subscription] = vi.mocked(ipcRenderer.on).mock.calls.at(-1) as [
      string,
      (event: unknown, data: unknown) => void
    ];
    subscription({}, { fileName: 'a.mp4', error: 'failed' });

    // Assert
    expect(callback).toHaveBeenCalledWith({ fileName: 'a.mp4', error: 'failed' });
  });

  test('onCopyErrorが返す関数を呼ぶと、copy-errorの購読を解除する', () => {
    // Arrange
    const api = getApi();
    const unsubscribe = api.onCopyError(vi.fn());
    const [, subscription] = vi.mocked(ipcRenderer.on).mock.calls.at(-1) as [
      string,
      (event: unknown, data: unknown) => void
    ];

    // Act
    unsubscribe();

    // Assert
    expect(ipcRenderer.removeListener).toHaveBeenCalledWith('copy-error', subscription);
  });

  test('getParentDirectoryは指定パスの親ディレクトリを返す（IPCを経由しない）', () => {
    // Arrange
    const api = getApi();
    const invokeCallCountBefore = vi.mocked(ipcRenderer.invoke).mock.calls.length;

    // Act
    const result = api.getParentDirectory('/dest/2026-01-01');

    // Assert
    expect(result).toBe('/dest');
    expect(vi.mocked(ipcRenderer.invoke).mock.calls.length).toBe(invokeCallCountBefore);
  });
});
