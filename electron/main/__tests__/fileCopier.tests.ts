import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn()
  }
}));

const fs = (await import('node:fs')).default;
const { resolveCollisionFreeFilePath } = await import('../fileCopier.js');

describe('resolveCollisionFreeFilePathに関するテスト', () => {
  afterEach(() => {
    vi.restoreAllMocks();
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
