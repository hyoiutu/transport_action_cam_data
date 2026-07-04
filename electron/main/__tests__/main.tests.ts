import { beforeEach, describe, expect, test, vi } from 'vitest';

type IpcHandler = (event: unknown, ...args: unknown[]) => unknown;

const ipcHandlers = new Map<string, IpcHandler>();

const mockBrowserWindowInstance = {
  loadFile: vi.fn(),
  webContents: { send: vi.fn() }
};

vi.mock('electron', () => ({
  app: {
    whenReady: vi.fn(() => Promise.resolve()),
    on: vi.fn(),
    quit: vi.fn()
  },
  // BrowserWindowはnewで呼び出されるため、アロー関数ではなくfunction式でコンストラクタ互換にする
  // biome-ignore lint/style/useNamingConvention: Electronの実際のexport名（BrowserWindow）に合わせる必要がある
  BrowserWindow: Object.assign(
    vi.fn(function BrowserWindowMock() {
      return mockBrowserWindowInstance;
    }),
    { getAllWindows: vi.fn(() => []) }
  ),
  dialog: {
    showOpenDialog: vi.fn()
  },
  ipcMain: {
    handle: vi.fn((channel: string, handler: IpcHandler) => {
      ipcHandlers.set(channel, handler);
    })
  }
}));

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    copyFileSync: vi.fn()
  }
}));

vi.mock('../fileScanner.js', () => ({
  scanDirectory: vi.fn()
}));

vi.mock('../fileCopier.js', () => ({
  resolveCollisionFreeFilePath: vi.fn((dir: string, name: string) => `${dir}/${name}`)
}));

const fs = (await import('node:fs')).default;
const { scanDirectory } = await import('../fileScanner.js');
const { resolveCollisionFreeFilePath } = await import('../fileCopier.js');
const { dialog } = await import('electron');

// モジュール読み込み時にipcMain.handle()でハンドラが登録される。
// 待機してBrowserWindow生成（app.whenReady().then）まで完了させる。
await import('../main.js');
await new Promise((resolve) => setImmediate(resolve));

const getHandler = (channel: string): IpcHandler => {
  const handler = ipcHandlers.get(channel);
  if (!handler) throw new Error(`handler for ${channel} is not registered`);
  return handler;
};

describe('select-directoryハンドラに関するテスト', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('ダイアログがキャンセルされたとき、nullを返す', async () => {
    // Arrange
    vi.mocked(dialog.showOpenDialog).mockResolvedValue({ canceled: true, filePaths: [] });
    const handler = getHandler('select-directory');

    // Act
    const result = await handler(null, '');

    // Assert
    expect(result).toBeNull();
  });

  test('フォルダが選択されたとき、そのパスを返す', async () => {
    // Arrange
    vi.mocked(dialog.showOpenDialog).mockResolvedValue({ canceled: false, filePaths: ['/selected/path'] });
    const handler = getHandler('select-directory');

    // Act
    const result = await handler(null, '');

    // Assert
    expect(result).toBe('/selected/path');
  });

  test('defaultPathが空文字のとき、ダイアログにはundefinedとして渡される', async () => {
    // Arrange
    vi.mocked(dialog.showOpenDialog).mockResolvedValue({ canceled: true, filePaths: [] });
    const handler = getHandler('select-directory');

    // Act
    await handler(null, '');

    // Assert
    expect(dialog.showOpenDialog).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ defaultPath: undefined })
    );
  });
});

describe('scan-directoryハンドラに関するテスト', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('fileScanner.scanDirectoryへ委譲し、その結果を返す', async () => {
    // Arrange
    const files = [{ name: 'a.mp4' }];
    vi.mocked(scanDirectory).mockResolvedValue(files as never);
    const handler = getHandler('scan-directory');

    // Act
    const result = await handler(null, '/dir');

    // Assert
    expect(scanDirectory).toHaveBeenCalledWith('/dir');
    expect(result).toBe(files);
  });
});

describe('cancel-copyハンドラに関するテスト', () => {
  test('呼び出すとtrueを返す', () => {
    // Arrange
    const handler = getHandler('cancel-copy');

    // Act
    const result = handler(null);

    // Assert
    expect(result).toBe(true);
  });
});

describe('start-copyハンドラに関するテスト', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockBrowserWindowInstance.webContents.send.mockClear();
    vi.mocked(resolveCollisionFreeFilePath).mockImplementation((dir: string, name: string) => `${dir}/${name}`);
  });

  test('filesが指定されていないとき、エラーをスローする', async () => {
    // Arrange
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const handler = getHandler('start-copy');

    // Act & Assert
    await expect(handler(null, { files: null, destinationDir: '/dest' })).rejects.toThrow(
      'Invalid arguments or destination directory does not exist.'
    );
  });

  test('コピー先ディレクトリが存在しないとき、エラーをスローする', async () => {
    // Arrange
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const handler = getHandler('start-copy');

    // Act & Assert
    await expect(handler(null, { files: [], destinationDir: '/not-exist' })).rejects.toThrow(
      'Invalid arguments or destination directory does not exist.'
    );
  });

  test('衝突回避を経たパスへコピーされ、完了ステータスを返す', async () => {
    // Arrange
    vi.mocked(fs.existsSync).mockImplementation((target) => String(target) === '/dest');
    const handler = getHandler('start-copy');
    const files = [
      { name: 'a.mp4', path: '/src/a.mp4', size: 1, type: 'video', creationDate: '2026-01-01', dateSource: 'metadata' }
    ];

    // Act
    const result = await handler(null, { files, destinationDir: '/dest' });

    // Assert
    expect(result).toEqual({ status: 'completed', copiedCount: 1 });
    expect(resolveCollisionFreeFilePath).toHaveBeenCalledWith('/dest/2026-01-01', 'a.mp4');
    expect(fs.copyFileSync).toHaveBeenCalledWith('/src/a.mp4', '/dest/2026-01-01/a.mp4');
  });

  test('コピー先の年月日ディレクトリが存在しないとき、作成してからコピーする', async () => {
    // Arrange
    vi.mocked(fs.existsSync).mockImplementation((target) => String(target) === '/dest');
    const handler = getHandler('start-copy');
    const files = [
      { name: 'a.mp4', path: '/src/a.mp4', size: 1, type: 'video', creationDate: '2026-01-01', dateSource: 'metadata' }
    ];

    // Act
    await handler(null, { files, destinationDir: '/dest' });

    // Assert
    expect(fs.mkdirSync).toHaveBeenCalledWith('/dest/2026-01-01', { recursive: true });
  });

  test('コピー中にエラーが発生したファイルはcopy-errorイベントを送り、処理を継続する', async () => {
    // Arrange
    vi.mocked(fs.existsSync).mockImplementation((target) => String(target) === '/dest');
    vi.mocked(fs.copyFileSync).mockImplementation(() => {
      throw new Error('disk full');
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const handler = getHandler('start-copy');
    const files = [
      { name: 'a.mp4', path: '/src/a.mp4', size: 1, type: 'video', creationDate: '2026-01-01', dateSource: 'metadata' }
    ];

    // Act
    const result = await handler(null, { files, destinationDir: '/dest' });

    // Assert
    expect(result).toEqual({ status: 'completed', copiedCount: 0 });
    expect(mockBrowserWindowInstance.webContents.send).toHaveBeenCalledWith(
      'copy-error',
      expect.objectContaining({ fileName: 'a.mp4', error: 'disk full' })
    );
  });

  test('複数ファイルを順にコピーし、進捗イベントを送りながら完了する', async () => {
    // Arrange
    vi.mocked(fs.existsSync).mockImplementation((target) => String(target) === '/dest');
    const handler = getHandler('start-copy');
    const files = [
      { name: 'a.mp4', path: '/src/a.mp4', size: 1, type: 'video', creationDate: '2026-01-01', dateSource: 'metadata' },
      { name: 'b.jpg', path: '/src/b.jpg', size: 2, type: 'image', creationDate: '2026-01-01', dateSource: 'metadata' }
    ];

    // Act
    const result = await handler(null, { files, destinationDir: '/dest' });

    // Assert
    expect(result).toEqual({ status: 'completed', copiedCount: 2 });
    expect(mockBrowserWindowInstance.webContents.send).toHaveBeenCalledWith(
      'copy-progress',
      expect.objectContaining({ status: 'completed', copiedCount: 2, totalFiles: 2 })
    );
  });

  // 補足: ループ内に await が存在せず同期的に完走するため、cancel-copy による
  // isCancelling=true が start-copy 実行中に反映される余地がなく、
  // 「if (isCancelling)」の分岐は現状の実装では到達不能。既知の制約として
  // 修正せず現状仕様のまま残すことをユーザーと合意済み（テストも追加しない）。
});
