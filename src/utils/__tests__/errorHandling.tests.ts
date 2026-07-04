import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { getErrorMessage, showErrorToast } from '../errorHandling';

describe('getErrorMessageに関するテスト', () => {
  test('Errorインスタンスが渡されたとき、そのmessageを返す', () => {
    // Arrange
    const error = new Error('テストエラー');

    // Act
    const result = getErrorMessage(error);

    // Assert
    expect(result).toBe('テストエラー');
  });

  test('Errorインスタンスでない値が渡されたとき、文字列化して返す', () => {
    // Arrange
    const error = 'エラー文字列';

    // Act
    const result = getErrorMessage(error);

    // Assert
    expect(result).toBe('エラー文字列');
  });
});

describe('showErrorToastに関するテスト', () => {
  let alertSpy: ReturnType<typeof vi.spyOn>;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('console.errorがメッセージ付きで呼ばれる', () => {
    // Arrange
    const message = 'エラーメッセージ';

    // Act
    showErrorToast(message);

    // Assert
    expect(consoleErrorSpy).toHaveBeenCalledWith(message);
  });

  test('alertがメッセージ付きで呼ばれる', () => {
    // Arrange
    const message = 'エラーメッセージ';

    // Act
    showErrorToast(message);

    // Assert
    expect(alertSpy).toHaveBeenCalledWith(message);
  });
});
