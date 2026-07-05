import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { renderWithChakra } from '../../test-utils/renderWithChakra';
import { CopyActions } from '../CopyActions';

describe('CopyActionsに関するテスト', () => {
  test('canStartCopyがfalseのとき開始ボタンは無効化される', () => {
    // Arrange & Act
    renderWithChakra(<CopyActions canStartCopy={false} isCopying={false} onStart={vi.fn()} onCancel={vi.fn()} />);

    // Assert
    expect(screen.getByRole('button', { name: /コピーを開始する/ })).toBeDisabled();
  });

  test('canStartCopyがtrueのとき開始ボタンをクリックするとonStartが呼ばれる', () => {
    // Arrange
    const onStart = vi.fn();
    renderWithChakra(<CopyActions canStartCopy={true} isCopying={false} onStart={onStart} onCancel={vi.fn()} />);

    // Act
    fireEvent.click(screen.getByRole('button', { name: /コピーを開始する/ }));

    // Assert
    expect(onStart).toHaveBeenCalledTimes(1);
  });

  test('isCopyingがfalseのときキャンセルボタンは無効化される', () => {
    // Arrange & Act
    renderWithChakra(<CopyActions canStartCopy={false} isCopying={false} onStart={vi.fn()} onCancel={vi.fn()} />);

    // Assert
    expect(screen.getByRole('button', { name: /キャンセル/ })).toBeDisabled();
  });

  test('isCopyingがtrueのときキャンセルボタンをクリックするとonCancelが呼ばれる', () => {
    // Arrange
    const onCancel = vi.fn();
    renderWithChakra(<CopyActions canStartCopy={false} isCopying={true} onStart={vi.fn()} onCancel={onCancel} />);

    // Act
    fireEvent.click(screen.getByRole('button', { name: /キャンセル/ }));

    // Assert
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
