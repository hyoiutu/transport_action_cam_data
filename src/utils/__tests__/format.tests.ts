import { describe, expect, test } from 'vitest';
import { formatBytes } from '../format';

const ONE_MEGABYTE_IN_BYTES = 1048576;

describe('formatBytesに関するテスト', () => {
  test('バイト数が0のとき、"0 Bytes"を返す', () => {
    // Arrange
    const bytes = 0;

    // Act
    const result = formatBytes(bytes);

    // Assert
    expect(result).toBe('0 Bytes');
  });

  test('バイト数が1024（1KB）のとき、デフォルトの小数点桁数で"1 KB"を返す', () => {
    // Arrange
    const bytes = 1024;

    // Act
    const result = formatBytes(bytes);

    // Assert
    expect(result).toBe('1 KB');
  });

  test('バイト数が1048576（1MB）のとき、"1 MB"を返す', () => {
    // Arrange
    const bytes = ONE_MEGABYTE_IN_BYTES;

    // Act
    const result = formatBytes(bytes);

    // Assert
    expect(result).toBe('1 MB');
  });

  test('小数点以下の桁数に負数を指定したとき、0桁として扱われる', () => {
    // Arrange
    const bytes = 1024;
    const decimals = -1;

    // Act
    const result = formatBytes(bytes, decimals);

    // Assert
    expect(result).toBe('1 KB');
  });
});
