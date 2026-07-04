import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { FileInfo } from '../../types/domain.js';

const mockWindow = {
  webContents: { send: vi.fn() }
};

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn()
  }
}));

vi.mock('../../main/fileCopier.js', () => ({
  copyFileToDateDirectory: vi.fn()
}));

vi.mock('../../main/windowState.js', () => ({
  getMainWindow: vi.fn()
}));

const fs = (await import('node:fs')).default;
const { copyFileToDateDirectory } = await import('../../main/fileCopier.js');
const { getMainWindow } = await import('../../main/windowState.js');
const { startCopyHandler } = await import('../startCopyHandler.js');

const createFileInfo = (overrides: Partial<FileInfo> = {}): FileInfo => ({
  name: 'a.mp4',
  path: '/src/a.mp4',
  size: 1,
  type: 'video',
  creationDate: '2026-01-01',
  dateSource: 'metadata',
  ...overrides
});

describe('startCopyHandlerに関するテスト', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockWindow.webContents.send.mockClear();
    vi.mocked(getMainWindow).mockReturnValue(mockWindow as never);
  });

  test('mainWindowが初期化されていないとき、エラーをスローする', async () => {
    // Arrange
    vi.mocked(getMainWindow).mockReturnValue(null);
    const args = { files: [], destinationDir: '/dest' };

    // Act & Assert
    await expect(startCopyHandler({} as never, args)).rejects.toThrow('Main window not initialized');
  });

  test('filesが指定されていないとき、エラーをスローする', async () => {
    // Arrange
    vi.mocked(fs.existsSync).mockReturnValue(true);
    const args = { files: null, destinationDir: '/dest' } as never;

    // Act & Assert
    await expect(startCopyHandler({} as never, args)).rejects.toThrow(
      'Invalid arguments or destination directory does not exist.'
    );
  });

  test('コピー先ディレクトリが存在しないとき、エラーをスローする', async () => {
    // Arrange
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const args = { files: [], destinationDir: '/not-exist' };

    // Act & Assert
    await expect(startCopyHandler({} as never, args)).rejects.toThrow(
      'Invalid arguments or destination directory does not exist.'
    );
  });

  test('ファイルコピーに成功したとき、完了ステータスと進捗イベントを返す', async () => {
    // Arrange
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(copyFileToDateDirectory).mockReturnValue('/dest/2026-01-01/a.mp4');
    const files = [createFileInfo()];

    // Act
    const result = await startCopyHandler({} as never, { files, destinationDir: '/dest' });

    // Assert
    expect(result).toEqual({ status: 'completed', copiedCount: 1 });
    expect(copyFileToDateDirectory).toHaveBeenCalledWith(files[0], '/dest');
    expect(mockWindow.webContents.send).toHaveBeenCalledWith(
      'copy-progress',
      expect.objectContaining({ status: 'completed', copiedCount: 1, totalFiles: 1 })
    );
  });

  test('コピー中にエラーが発生したファイルはcopy-errorイベントを送り、処理を継続する', async () => {
    // Arrange
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(copyFileToDateDirectory).mockImplementation(() => {
      throw new Error('disk full');
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const files = [createFileInfo()];

    // Act
    const result = await startCopyHandler({} as never, { files, destinationDir: '/dest' });

    // Assert
    expect(result).toEqual({ status: 'completed', copiedCount: 0 });
    expect(mockWindow.webContents.send).toHaveBeenCalledWith(
      'copy-error',
      expect.objectContaining({ fileName: 'a.mp4', error: 'disk full' })
    );
  });

  test('複数ファイルを順にコピーし、copiedCountが積算される', async () => {
    // Arrange
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(copyFileToDateDirectory).mockReturnValue('/dest/2026-01-01/x');
    const files = [createFileInfo({ name: 'a.mp4' }), createFileInfo({ name: 'b.jpg', type: 'image' })];

    // Act
    const result = await startCopyHandler({} as never, { files, destinationDir: '/dest' });

    // Assert
    expect(result).toEqual({ status: 'completed', copiedCount: 2 });
  });

  // 補足: ループ内に await が存在せず同期的に完走するため、cancel-copy による
  // isCancelling=true が start-copy 実行中に反映される余地がなく、
  // 「if (isCancelling)」の分岐は現状の実装では到達不能。既知の制約として
  // 修正せず現状仕様のまま残すことをユーザーと合意済み（テストも追加しない）。
});
