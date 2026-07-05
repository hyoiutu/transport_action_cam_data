import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createFileInfo } from '../../test-utils/fixtures';
import { createMockElectronApi } from '../../test-utils/mockElectronApi';
import { useCopyOperation } from '../useCopyOperation';

const EXPECTED_PERCENT = 25;

describe('useCopyOperationに関するテスト', () => {
  let mockApi: ReturnType<typeof createMockElectronApi>;
  let alertSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockApi = createMockElectronApi();
    window.api = mockApi.api;
    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('srcFilesが空のとき、canStartCopyはfalseになる', () => {
    // Arrange & Act
    const { result } = renderHook(() => useCopyOperation({ srcFiles: [], destPath: '/dest', onCopyFinished: vi.fn() }));

    // Assert
    expect(result.current.canStartCopy).toBe(false);
  });

  test('destPathが空文字のとき、canStartCopyはfalseになる', () => {
    // Arrange & Act
    const { result } = renderHook(() =>
      useCopyOperation({ srcFiles: [createFileInfo()], destPath: '', onCopyFinished: vi.fn() })
    );

    // Assert
    expect(result.current.canStartCopy).toBe(false);
  });

  test('srcFilesとdestPathが揃っているとき、canStartCopyはtrueになる', () => {
    // Arrange & Act
    const { result } = renderHook(() =>
      useCopyOperation({ srcFiles: [createFileInfo()], destPath: '/dest', onCopyFinished: vi.fn() })
    );

    // Assert
    expect(result.current.canStartCopy).toBe(true);
  });

  test('canStartCopyがfalseのときstartCopyを呼んでもwindow.api.startCopyは呼ばれない', async () => {
    // Arrange
    const { result } = renderHook(() => useCopyOperation({ srcFiles: [], destPath: '', onCopyFinished: vi.fn() }));

    // Act
    await act(async () => {
      await result.current.startCopy();
    });

    // Assert
    expect(mockApi.api.startCopy).not.toHaveBeenCalled();
  });

  test('コピーが完了したとき、progressが完了状態になりonCopyFinishedが呼ばれる', async () => {
    // Arrange
    mockApi.api.startCopy = vi.fn().mockResolvedValue({ status: 'completed', copiedCount: 3 });
    const onCopyFinished = vi.fn();
    const { result } = renderHook(() =>
      useCopyOperation({ srcFiles: [createFileInfo()], destPath: '/dest', onCopyFinished })
    );

    // Act
    await act(async () => {
      await result.current.startCopy();
    });

    // Assert
    expect(result.current.progress.status).toBe('コピー完了！');
    expect(result.current.isCopying).toBe(false);
    expect(onCopyFinished).toHaveBeenCalledTimes(1);
  });

  test('コピーがキャンセルされたとき、progressがキャンセル状態になる', async () => {
    // Arrange
    mockApi.api.startCopy = vi.fn().mockResolvedValue({ status: 'cancelled', copiedCount: 1 });
    const { result } = renderHook(() =>
      useCopyOperation({ srcFiles: [createFileInfo()], destPath: '/dest', onCopyFinished: vi.fn() })
    );

    // Act
    await act(async () => {
      await result.current.startCopy();
    });

    // Assert
    expect(result.current.progress.status).toBe('キャンセルされました');
  });

  test('コピー中にエラーが発生したとき、progressがエラー状態になりエラー通知される', async () => {
    // Arrange
    mockApi.api.startCopy = vi.fn().mockRejectedValue(new Error('copy failed'));
    const { result } = renderHook(() =>
      useCopyOperation({ srcFiles: [createFileInfo()], destPath: '/dest', onCopyFinished: vi.fn() })
    );

    // Act
    await act(async () => {
      await result.current.startCopy();
    });

    // Assert
    expect(result.current.progress.status).toBe('エラーが発生しました');
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('copy failed'));
  });

  test('進捗イベントのstatusがcopying以外のとき、progressは更新されない', () => {
    // Arrange
    const { result } = renderHook(() =>
      useCopyOperation({ srcFiles: [createFileInfo()], destPath: '/dest', onCopyFinished: vi.fn() })
    );
    const progressBeforeEvent = result.current.progress;

    // Act
    act(() => {
      mockApi.emitProgress({ status: 'completed', copiedCount: 1, totalFiles: 1, currentFile: '' });
    });

    // Assert
    expect(result.current.progress).toBe(progressBeforeEvent);
  });

  test('進捗イベントのstatusがcopyingのとき、percentを含むprogressに更新される', () => {
    // Arrange
    const { result } = renderHook(() =>
      useCopyOperation({ srcFiles: [createFileInfo()], destPath: '/dest', onCopyFinished: vi.fn() })
    );

    // Act
    act(() => {
      mockApi.emitProgress({ status: 'copying', copiedCount: 1, totalFiles: 4, currentFile: 'a.mp4' });
    });

    // Assert
    expect(result.current.progress.percent).toBe(EXPECTED_PERCENT);
    expect(result.current.progress.file).toBe('コピー中: a.mp4');
  });

  test('コピーエラーイベントが発生したとき、エラーが通知される', () => {
    // Arrange
    renderHook(() => useCopyOperation({ srcFiles: [createFileInfo()], destPath: '/dest', onCopyFinished: vi.fn() }));

    // Act
    act(() => {
      mockApi.emitError({ fileName: 'a.mp4', error: 'copy error' });
    });

    // Assert
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('a.mp4'));
  });
});
