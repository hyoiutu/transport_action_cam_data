import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('../cancellationState.js', () => ({
  setCancelling: vi.fn()
}));

const { setCancelling } = await import('../cancellationState.js');
const { cancelCopyHandler } = await import('../cancelCopyHandler.js');

describe('cancelCopyHandlerに関するテスト', () => {
  afterEach(() => {
    vi.resetAllMocks();
  });

  test('呼び出すとキャンセルフラグを立て、trueを返す', () => {
    // Arrange & Act
    const result = cancelCopyHandler({} as never);

    // Assert
    expect(setCancelling).toHaveBeenCalledWith(true);
    expect(result).toBe(true);
  });
});
