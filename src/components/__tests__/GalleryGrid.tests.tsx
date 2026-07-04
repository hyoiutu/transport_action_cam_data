import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { createFileInfo } from '../../test-utils/fixtures';
import { GalleryGrid } from '../GalleryGrid';

describe('GalleryGridに関するテスト', () => {
  test('filesが空でcurrentTabがsrcのとき、コピー元向けの空状態メッセージが表示される', () => {
    // Arrange & Act
    render(<GalleryGrid files={[]} currentTab="src" onFileClick={vi.fn()} />);

    // Assert
    expect(screen.getByText(/コピー元フォルダを選択してスキャンしてください/)).toBeInTheDocument();
  });

  test('filesが空でcurrentTabがdestのとき、コピー先向けの空状態メッセージが表示される', () => {
    // Arrange & Act
    render(<GalleryGrid files={[]} currentTab="dest" onFileClick={vi.fn()} />);

    // Assert
    expect(screen.getByText(/コピー先フォルダに動画や画像がありません/)).toBeInTheDocument();
  });

  test('filesが1件以上のとき、ファイルカードが表示される', () => {
    // Arrange
    const file = createFileInfo({ name: 'clip.mp4' });

    // Act
    render(<GalleryGrid files={[file]} currentTab="src" onFileClick={vi.fn()} />);

    // Assert
    expect(screen.getByText('clip.mp4')).toBeInTheDocument();
  });

  test('ファイルカードをクリックするとonFileClickが対象ファイルとともに呼ばれる', () => {
    // Arrange
    const file = createFileInfo({ name: 'clip.mp4' });
    const onFileClick = vi.fn();
    render(<GalleryGrid files={[file]} currentTab="src" onFileClick={onFileClick} />);

    // Act
    fireEvent.click(screen.getByText('clip.mp4'));

    // Assert
    expect(onFileClick).toHaveBeenCalledWith(file);
  });
});
