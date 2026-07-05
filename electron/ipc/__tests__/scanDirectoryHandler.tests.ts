import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('../../main/fileScanner.js', () => ({
  scanDirectory: vi.fn()
}));

const { scanDirectory } = await import('../../main/fileScanner.js');
const { scanDirectoryHandler } = await import('../scanDirectoryHandler.js');

describe('scanDirectoryHandlerに関するテスト', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test('fileScanner.scanDirectoryへ委譲し、その結果を返す', async () => {
    // Arrange
    const files = [{ name: 'a.mp4' }];
    vi.mocked(scanDirectory).mockResolvedValue(files as never);

    // Act
    const result = await scanDirectoryHandler({} as never, '/dir');

    // Assert
    expect(scanDirectory).toHaveBeenCalledWith('/dir');
    expect(result).toBe(files);
  });
});
