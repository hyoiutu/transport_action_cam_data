import { describe, expect, test, vi } from 'vitest';

const mockBrowserWindowInstance = {
  loadFile: vi.fn(),
  webContents: { send: vi.fn() }
};

let activateCallback: (() => void) | undefined;
let windowAllClosedCallback: (() => void) | undefined;

vi.mock('electron', () => ({
  app: {
    whenReady: vi.fn(() => Promise.resolve()),
    on: vi.fn((event: string, callback: () => void) => {
      if (event === 'activate') activateCallback = callback;
      if (event === 'window-all-closed') windowAllClosedCallback = callback;
    }),
    quit: vi.fn()
  },
  // biome-ignore lint/style/useNamingConvention: Electronの実際のexport名（BrowserWindow）に合わせる必要がある
  BrowserWindow: Object.assign(
    vi.fn(function BrowserWindowMock() {
      return mockBrowserWindowInstance;
    }),
    { getAllWindows: vi.fn(() => []) }
  ),
  ipcMain: {
    handle: vi.fn()
  }
}));

vi.mock('../../ipc/selectDirectoryHandler.js', () => ({ selectDirectoryHandler: 'selectDirectoryHandler' }));
vi.mock('../../ipc/scanDirectoryHandler.js', () => ({ scanDirectoryHandler: 'scanDirectoryHandler' }));
vi.mock('../../ipc/cancelCopyHandler.js', () => ({ cancelCopyHandler: 'cancelCopyHandler' }));
vi.mock('../../ipc/startCopyHandler.js', () => ({ startCopyHandler: 'startCopyHandler' }));

const { app, BrowserWindow, ipcMain } = await import('electron');

// モジュール読み込み時にapp.whenReady().then(createWindow)が実行される。マイクロタスクの完了を待つ。
await import('../main.js');
await new Promise((resolve) => setImmediate(resolve));

describe('main.tsの配線に関するテスト', () => {
  test('起動時にBrowserWindowが生成され、index.htmlが読み込まれる', () => {
    // Assert
    expect(BrowserWindow).toHaveBeenCalledTimes(1);
    expect(mockBrowserWindowInstance.loadFile).toHaveBeenCalledWith(expect.stringContaining('index.html'));
  });

  test('4つのIPCチャンネルがそれぞれ対応するハンドラで登録される', () => {
    // Assert
    expect(ipcMain.handle).toHaveBeenCalledWith('select-directory', 'selectDirectoryHandler');
    expect(ipcMain.handle).toHaveBeenCalledWith('scan-directory', 'scanDirectoryHandler');
    expect(ipcMain.handle).toHaveBeenCalledWith('cancel-copy', 'cancelCopyHandler');
    expect(ipcMain.handle).toHaveBeenCalledWith('start-copy', 'startCopyHandler');
  });

  test('macOS以外で全てのウィンドウが閉じられたとき、appを終了する', () => {
    // Arrange
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'win32' });

    // Act
    windowAllClosedCallback?.();

    // Assert
    expect(app.quit).toHaveBeenCalled();
    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });

  test('macOSで全てのウィンドウが閉じられても、appを終了しない', () => {
    // Arrange
    const originalPlatform = process.platform;
    Object.defineProperty(process, 'platform', { value: 'darwin' });
    vi.mocked(app.quit).mockClear();

    // Act
    windowAllClosedCallback?.();

    // Assert
    expect(app.quit).not.toHaveBeenCalled();
    Object.defineProperty(process, 'platform', { value: originalPlatform });
  });

  test('activate時にウィンドウが存在しない場合、新しいウィンドウを作成する', () => {
    // Arrange
    vi.mocked(BrowserWindow).mockClear();

    // Act
    activateCallback?.();

    // Assert
    expect(BrowserWindow).toHaveBeenCalledTimes(1);
  });
});
