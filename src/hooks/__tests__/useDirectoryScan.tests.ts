import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { createFileInfo } from '../../test-utils/fixtures';
import { createMockElectronApi } from '../../test-utils/mockElectronApi';
import { useDirectoryScan } from '../useDirectoryScan';

describe('useDirectoryScanに関するテスト', () => {
  beforeEach(() => {
    window.api = createMockElectronApi().api;
    window.srcFiles = [];
    window.destFiles = [];
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('初期状態ではフォルダ選択を促すメッセージが表示される', () => {
    // Arrange & Act
    const { result } = renderHook(() => useDirectoryScan());

    // Assert
    expect(result.current.scanInfo).toBe('フォルダを選択してください');
  });

  test('コピー元のスキャンに成功したとき、srcFilesとscanInfoが更新される', async () => {
    // Arrange
    const files = [createFileInfo()];
    window.api.scanDirectory = vi.fn().mockResolvedValue(files);
    const { result } = renderHook(() => useDirectoryScan());

    // Act
    await act(async () => {
      await result.current.updateDirectory('src', '/src/path');
    });

    // Assert
    expect(result.current.srcFiles).toEqual(files);
    expect(result.current.scanInfo).toBe('スキャン完了 - 元: 1 件 / 先: 0 件');
  });

  test('コピー元のスキャンに失敗したとき、srcFilesが空になりエラーが通知される', async () => {
    // Arrange
    window.api.scanDirectory = vi.fn().mockRejectedValue(new Error('scan failed'));
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const { result } = renderHook(() => useDirectoryScan());

    // Act
    await act(async () => {
      await result.current.updateDirectory('src', '/src/path');
    });

    // Assert
    expect(result.current.srcFiles).toEqual([]);
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('コピー元のスキャンに失敗しました'));
  });

  test('コピー先のスキャンに成功したとき、destFilesとscanInfoが更新される', async () => {
    // Arrange
    const files = [createFileInfo({ name: 'dest.jpg', type: 'image' })];
    window.api.scanDirectory = vi.fn().mockResolvedValue(files);
    const { result } = renderHook(() => useDirectoryScan());

    // Act
    await act(async () => {
      await result.current.updateDirectory('dest', '/dest/path');
    });

    // Assert
    expect(result.current.destFiles).toEqual(files);
    expect(result.current.scanInfo).toBe('スキャン完了 - 元: 0 件 / 先: 1 件');
  });

  test('コピー先のスキャンに失敗したとき、destFilesが空になりエラーが通知される', async () => {
    // Arrange
    window.api.scanDirectory = vi.fn().mockRejectedValue(new Error('scan failed'));
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const { result } = renderHook(() => useDirectoryScan());

    // Act
    await act(async () => {
      await result.current.updateDirectory('dest', '/dest/path');
    });

    // Assert
    expect(result.current.destFiles).toEqual([]);
    expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('コピー先のスキャンに失敗しました'));
  });

  test('コピー元スキャン中は専用の案内メッセージが表示される', async () => {
    // Arrange
    let resolveScan: (files: FileInfo[]) => void = () => {};
    window.api.scanDirectory = vi.fn(
      () =>
        new Promise<FileInfo[]>((resolve) => {
          resolveScan = resolve;
        })
    );
    const { result } = renderHook(() => useDirectoryScan());

    // Act
    act(() => {
      void result.current.updateDirectory('src', '/src/path');
    });

    // Assert
    await waitFor(() => expect(result.current.scanInfo).toBe('コピー元をスキャン中...'));

    await act(async () => {
      resolveScan([]);
    });
  });

  test('window.srcFilesがReactのsrcFiles状態と同期される', async () => {
    // Arrange
    const files = [createFileInfo()];
    window.api.scanDirectory = vi.fn().mockResolvedValue(files);
    const { result } = renderHook(() => useDirectoryScan());

    // Act
    await act(async () => {
      await result.current.updateDirectory('src', '/src/path');
    });

    // Assert
    expect(window.srcFiles).toEqual(files);
  });

  test('window.updateDirectoryにフックのupdateDirectoryが同期される', () => {
    // Arrange & Act
    const { result } = renderHook(() => useDirectoryScan());

    // Assert
    expect(window.updateDirectory).toBe(result.current.updateDirectory);
  });
});
