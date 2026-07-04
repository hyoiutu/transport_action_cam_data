import { beforeEach, describe, expect, test, vi } from 'vitest';

const mockWindow = {};

vi.mock('electron', () => ({
  dialog: { showOpenDialog: vi.fn() }
}));

vi.mock('../../main/windowState.js', () => ({
  getMainWindow: vi.fn()
}));

const { dialog } = await import('electron');
const { getMainWindow } = await import('../../main/windowState.js');
const { selectDirectoryHandler } = await import('../selectDirectoryHandler.js');

describe('selectDirectoryHandlerに関するテスト', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('mainWindowが存在しないとき、nullを返す', async () => {
    // Arrange
    vi.mocked(getMainWindow).mockReturnValue(null);

    // Act
    const result = await selectDirectoryHandler({} as never, '');

    // Assert
    expect(result).toBeNull();
  });

  test('ダイアログがキャンセルされたとき、nullを返す', async () => {
    // Arrange
    vi.mocked(getMainWindow).mockReturnValue(mockWindow as never);
    vi.mocked(dialog.showOpenDialog).mockResolvedValue({ canceled: true, filePaths: [] });

    // Act
    const result = await selectDirectoryHandler({} as never, '');

    // Assert
    expect(result).toBeNull();
  });

  test('フォルダが選択されたとき、そのパスを返す', async () => {
    // Arrange
    vi.mocked(getMainWindow).mockReturnValue(mockWindow as never);
    vi.mocked(dialog.showOpenDialog).mockResolvedValue({ canceled: false, filePaths: ['/selected/path'] });

    // Act
    const result = await selectDirectoryHandler({} as never, '');

    // Assert
    expect(result).toBe('/selected/path');
  });

  test('defaultPathが空文字のとき、ダイアログにはundefinedとして渡される', async () => {
    // Arrange
    vi.mocked(getMainWindow).mockReturnValue(mockWindow as never);
    vi.mocked(dialog.showOpenDialog).mockResolvedValue({ canceled: true, filePaths: [] });

    // Act
    await selectDirectoryHandler({} as never, '');

    // Assert
    expect(dialog.showOpenDialog).toHaveBeenCalledWith(mockWindow, expect.objectContaining({ defaultPath: undefined }));
  });
});
