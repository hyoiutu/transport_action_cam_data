import { afterEach, describe, expect, test, vi } from 'vitest';
import type { FileInfo } from '../../types/domain.js';

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(),
    mkdirSync: vi.fn(),
    copyFileSync: vi.fn()
  }
}));

const fs = (await import('node:fs')).default;
const { resolveCollisionFreeFilePath, copyFileToDateDirectory } = await import('../fileCopier.js');

const createFileInfo = (overrides: Partial<FileInfo> = {}): FileInfo => ({
  name: 'a.mp4',
  path: '/src/a.mp4',
  size: 1,
  type: 'video',
  creationDate: '2026-01-01',
  dateSource: 'metadata',
  ...overrides
});

describe('resolveCollisionFreeFilePathに関するテスト', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test('同名ファイルが存在しないとき、そのままのファイル名のパスを返す', () => {
    // Arrange
    vi.mocked(fs.existsSync).mockReturnValue(false);

    // Act
    const result = resolveCollisionFreeFilePath('/dest/2026-01-01', 'a.mp4');

    // Assert
    expect(result).toBe('/dest/2026-01-01/a.mp4');
  });

  test('同名ファイルが1つ存在するとき、_1を付与したパスを返す', () => {
    // Arrange
    vi.mocked(fs.existsSync).mockImplementation((target) => String(target).endsWith('a.mp4'));

    // Act
    const result = resolveCollisionFreeFilePath('/dest/2026-01-01', 'a.mp4');

    // Assert
    expect(result).toBe('/dest/2026-01-01/a_1.mp4');
  });

  test('同名ファイルが複数存在するとき、空いている連番を付与したパスを返す', () => {
    // Arrange
    vi.mocked(fs.existsSync).mockImplementation((target) => {
      const targetPath = String(target);
      return targetPath.endsWith('a.mp4') || targetPath.endsWith('a_1.mp4') || targetPath.endsWith('a_2.mp4');
    });

    // Act
    const result = resolveCollisionFreeFilePath('/dest/2026-01-01', 'a.mp4');

    // Assert
    expect(result).toBe('/dest/2026-01-01/a_3.mp4');
  });

  test('拡張子がないファイルでも衝突回避が機能する', () => {
    // Arrange
    vi.mocked(fs.existsSync).mockImplementation((target) => String(target) === '/dest/README');

    // Act
    const result = resolveCollisionFreeFilePath('/dest', 'README');

    // Assert
    expect(result).toBe('/dest/README_1');
  });
});

describe('copyFileToDateDirectoryに関するテスト', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test('撮影日のサブディレクトリが存在しないとき、作成してからコピーする', () => {
    // Arrange
    vi.mocked(fs.existsSync).mockReturnValue(false);
    const file = createFileInfo();

    // Act
    const result = copyFileToDateDirectory(file, '/dest');

    // Assert
    expect(fs.mkdirSync).toHaveBeenCalledWith('/dest/2026-01-01', { recursive: true });
    expect(fs.copyFileSync).toHaveBeenCalledWith('/src/a.mp4', '/dest/2026-01-01/a.mp4');
    expect(result).toBe('/dest/2026-01-01/a.mp4');
  });

  test('撮影日のサブディレクトリが既に存在するとき、作成しない', () => {
    // Arrange
    vi.mocked(fs.existsSync).mockImplementation((target) => String(target) === '/dest/2026-01-01');
    const file = createFileInfo();

    // Act
    copyFileToDateDirectory(file, '/dest');

    // Assert
    expect(fs.mkdirSync).not.toHaveBeenCalled();
  });

  test('同名ファイルが存在するとき、連番を付与した名前でコピーする', () => {
    // Arrange
    vi.mocked(fs.existsSync).mockImplementation((target) => String(target).endsWith('a.mp4'));
    const file = createFileInfo();

    // Act
    const result = copyFileToDateDirectory(file, '/dest');

    // Assert
    expect(fs.copyFileSync).toHaveBeenCalledWith('/src/a.mp4', '/dest/2026-01-01/a_1.mp4');
    expect(result).toBe('/dest/2026-01-01/a_1.mp4');
  });
});
