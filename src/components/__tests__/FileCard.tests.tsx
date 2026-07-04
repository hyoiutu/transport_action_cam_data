import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { createFileInfo } from '../../test-utils/fixtures';
import { FileCard } from '../FileCard';

describe('FileCardに関するテスト', () => {
  test('動画ファイルの場合、video要素とvideoバッジが表示される', () => {
    // Arrange
    const file = createFileInfo({ type: 'video', name: 'clip.mp4' });

    // Act
    const { container } = render(<FileCard file={file} onClick={vi.fn()} />);

    // Assert
    // video要素にはaccessible roleが存在しないため、DOM構造の確認にはquerySelectorを用いる
    expect(container.querySelector('video')).not.toBeNull();
    expect(container.querySelector('.media-badge.video')).not.toBeNull();
  });

  test('画像ファイルの場合、img要素とimageバッジが表示される', () => {
    // Arrange
    const file = createFileInfo({ type: 'image', name: 'photo.jpg' });

    // Act
    const { container } = render(<FileCard file={file} onClick={vi.fn()} />);

    // Assert
    expect(screen.getByRole('img', { name: 'photo.jpg' })).toBeInTheDocument();
    expect(container.querySelector('.media-badge.image')).not.toBeNull();
  });

  test('ファイル名・撮影日・サイズが表示される', () => {
    // Arrange
    const file = createFileInfo({ name: 'clip.mp4', creationDate: '2026-01-02', size: 1024 });

    // Act
    render(<FileCard file={file} onClick={vi.fn()} />);

    // Assert
    expect(screen.getByText('clip.mp4')).toBeInTheDocument();
    expect(screen.getByText('2026-01-02')).toBeInTheDocument();
    expect(screen.getByText('1 KB')).toBeInTheDocument();
  });

  test('クリックするとonClickが呼ばれる', () => {
    // Arrange
    const onClick = vi.fn();
    const file = createFileInfo({ name: 'clip.mp4' });

    // Act
    render(<FileCard file={file} onClick={onClick} />);
    fireEvent.click(screen.getByText('clip.mp4'));

    // Assert
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
