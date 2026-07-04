import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { createFileInfo } from '../../test-utils/fixtures';
import { PreviewModal } from '../PreviewModal';

describe('PreviewModalに関するテスト', () => {
  test('fileがnullのとき、showクラスが付与されずプレースホルダーが表示される', () => {
    // Arrange & Act
    const { container } = render(<PreviewModal file={null} onClose={vi.fn()} />);

    // Assert
    expect(container.querySelector('.modal')?.className).not.toContain('show');
    expect(screen.getByText('File Name')).toBeInTheDocument();
  });

  test('fileが渡されたとき、showクラスが付与される', () => {
    // Arrange
    const file = createFileInfo();

    // Act
    const { container } = render(<PreviewModal file={file} onClose={vi.fn()} />);

    // Assert
    expect(container.querySelector('.modal')?.className).toContain('show');
  });

  test('動画ファイルの場合、video要素が表示される', () => {
    // Arrange
    const file = createFileInfo({ type: 'video' });

    // Act
    const { container } = render(<PreviewModal file={file} onClose={vi.fn()} />);

    // Assert
    // video要素にはaccessible roleが存在しないため、DOM構造の確認にはquerySelectorを用いる
    expect(container.querySelector('video')).not.toBeNull();
  });

  test('画像ファイルの場合、img要素が表示される', () => {
    // Arrange
    const file = createFileInfo({ type: 'image', name: 'photo.jpg' });

    // Act
    render(<PreviewModal file={file} onClose={vi.fn()} />);

    // Assert
    expect(screen.getByRole('img', { name: 'photo.jpg' })).toBeInTheDocument();
  });

  test('dateSourceがmetadataのとき、「メタデータ」と表示される', () => {
    // Arrange
    const file = createFileInfo({ dateSource: 'metadata', creationDate: '2026-01-02' });

    // Act
    render(<PreviewModal file={file} onClose={vi.fn()} />);

    // Assert
    expect(screen.getByText(/メタデータ/)).toBeInTheDocument();
  });

  test('dateSourceがmetadata以外のとき、「ファイルシステム」と表示される', () => {
    // Arrange
    const file = createFileInfo({ dateSource: 'file_system', creationDate: '2026-01-02' });

    // Act
    render(<PreviewModal file={file} onClose={vi.fn()} />);

    // Assert
    expect(screen.getByText(/ファイルシステム/)).toBeInTheDocument();
  });

  test('閉じるボタンをクリックするとonCloseが呼ばれる', () => {
    // Arrange
    const onClose = vi.fn();
    const file = createFileInfo();
    render(<PreviewModal file={file} onClose={onClose} />);

    // Act
    fireEvent.click(screen.getByRole('button'));

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('背景をクリックするとonCloseが呼ばれる', () => {
    // Arrange
    const onClose = vi.fn();
    const file = createFileInfo();
    const { container } = render(<PreviewModal file={file} onClose={onClose} />);

    // Act
    fireEvent.click(container.querySelector('.modal-backdrop') as HTMLElement);

    // Assert
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
