import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    readdirSync: vi.fn(),
    statSync: vi.fn()
  }
}));

vi.mock('../dateResolution.js', () => ({
  resolveCreationDateInfo: vi.fn(),
  formatJstDate: vi.fn()
}));

const fs = (await import('node:fs')).default;
const dateResolution = await import('../dateResolution.js');
const { resolveFileCategory, scanDirectory } = await import('../fileScanner.js');

const createDirent = (name: string, isDirectory = false) => ({
  name,
  isDirectory: () => isDirectory
});

describe('resolveFileCategoryに関するテスト', () => {
  test('動画拡張子の場合、videoを返す', () => {
    expect(resolveFileCategory('.mp4')).toBe('video');
  });

  test('画像拡張子の場合、imageを返す', () => {
    expect(resolveFileCategory('.jpg')).toBe('image');
  });

  test('対象外の拡張子の場合、nullを返す', () => {
    expect(resolveFileCategory('.txt')).toBeNull();
  });
});

describe('scanDirectoryに関するテスト', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test('ディレクトリパスが空文字のとき、空配列を返す', async () => {
    // Arrange & Act
    const result = await scanDirectory('');

    // Assert
    expect(result).toEqual([]);
  });

  test('ディレクトリが存在しないとき、空配列を返す', async () => {
    // Arrange
    vi.mocked(fs.existsSync).mockReturnValue(false);

    // Act
    const result = await scanDirectory('/not/exist');

    // Assert
    expect(result).toEqual([]);
  });

  test('サブディレクトリはスキャン対象から除外される', async () => {
    // Arrange
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([createDirent('subdir', true)] as unknown as ReturnType<
      typeof fs.readdirSync
    >);

    // Act
    const result = await scanDirectory('/dir');

    // Assert
    expect(result).toEqual([]);
  });

  test('許可されていない拡張子のファイルは除外される', async () => {
    // Arrange
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([createDirent('memo.txt')] as unknown as ReturnType<
      typeof fs.readdirSync
    >);

    // Act
    const result = await scanDirectory('/dir');

    // Assert
    expect(result).toEqual([]);
  });

  test('動画ファイルは日時解決結果とともにFileInfoとして返される', async () => {
    // Arrange
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([createDirent('clip.mp4')] as unknown as ReturnType<
      typeof fs.readdirSync
    >);
    vi.mocked(fs.statSync).mockReturnValue({ size: 12345 } as unknown as ReturnType<typeof fs.statSync>);
    const creationDate = new Date('2026-01-02T00:00:00.000Z');
    vi.mocked(dateResolution.resolveCreationDateInfo).mockResolvedValue({ creationDate, dateSource: 'metadata' });
    vi.mocked(dateResolution.formatJstDate).mockReturnValue('2026-01-02');

    // Act
    const result = await scanDirectory('/dir');

    // Assert
    expect(result).toEqual([
      {
        name: 'clip.mp4',
        path: '/dir/clip.mp4',
        size: 12345,
        type: 'video',
        creationDate: '2026-01-02',
        dateSource: 'metadata'
      }
    ]);
    expect(dateResolution.resolveCreationDateInfo).toHaveBeenCalledWith(
      '/dir/clip.mp4',
      true,
      expect.objectContaining({ size: 12345 })
    );
  });

  test('画像ファイルはisVideo=falseとして日時解決に渡される', async () => {
    // Arrange
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValue([createDirent('photo.jpg')] as unknown as ReturnType<
      typeof fs.readdirSync
    >);
    vi.mocked(fs.statSync).mockReturnValue({ size: 500 } as unknown as ReturnType<typeof fs.statSync>);
    vi.mocked(dateResolution.resolveCreationDateInfo).mockResolvedValue({
      creationDate: new Date('2026-01-03T00:00:00.000Z'),
      dateSource: 'file_system_fallback'
    });
    vi.mocked(dateResolution.formatJstDate).mockReturnValue('2026-01-03');

    // Act
    const result = await scanDirectory('/dir');

    // Assert
    expect(result[0].type).toBe('image');
    expect(dateResolution.resolveCreationDateInfo).toHaveBeenCalledWith(
      '/dir/photo.jpg',
      false,
      expect.objectContaining({ size: 500 })
    );
  });

  test('ディレクトリの読み取りに失敗したとき、エラーを再スローする', async () => {
    // Arrange
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockImplementation(() => {
      throw new Error('readdir failed');
    });
    vi.spyOn(console, 'error').mockImplementation(() => {});

    // Act & Assert
    await expect(scanDirectory('/dir')).rejects.toThrow('readdir failed');
  });
});
